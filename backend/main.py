from typing import Union, Dict, Any, List
from fastapi import FastAPI, HTTPException, status, Form, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from diffusers import FluxPipeline
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional
from dotenv import load_dotenv
import torch
import uuid
import os
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import json
# Add Alibaba Cloud OSS imports
import oss2
from pydantic import BaseModel, Field

import requests
import base64
import aiohttp
import asyncio
from bs4 import BeautifulSoup
# Add Alibaba Cloud OCR imports
from alibabacloud_ocr20191230.client import Client as OcrClient
from alibabacloud_ocr20191230.models import RecognizePdfRequest
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_util import models as util_models
from alibabacloud_tea_util.client import Client as UtilClient


load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Alibaba Cloud OSS configuration
ALIBABA_ACCESS_KEY_ID = os.environ.get("ALIBABA_ACCESS_KEY_ID", "")
ALIBABA_ACCESS_KEY_SECRET = os.environ.get("ALIBABA_ACCESS_KEY_SECRET", "")
ALIBABA_OSS_ENDPOINT = os.environ.get("ALIBABA_OSS_ENDPOINT", "")
ALIBABA_OSS_BUCKET = os.environ.get("ALIBABA_OSS_BUCKET", "aplus-images")

# AnalyticDB PostgreSQL configuration
DB_HOST = os.environ.get("DB_HOST", "")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "")
DB_USER = os.environ.get("DB_USER", "")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")

# Define lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    port = os.environ.get("BACKEND_PORT", "8000")
    logger.info(f"Starting API server on port {port}")
    
    # Initialize OSS client
    if ALIBABA_ACCESS_KEY_ID and ALIBABA_ACCESS_KEY_SECRET and ALIBABA_OSS_ENDPOINT:
        auth = oss2.Auth(ALIBABA_ACCESS_KEY_ID, ALIBABA_ACCESS_KEY_SECRET)
        app.state.bucket = oss2.Bucket(auth, ALIBABA_OSS_ENDPOINT, ALIBABA_OSS_BUCKET)
        logger.info("Alibaba Cloud OSS client initialized")
    else:
        app.state.bucket = None
        logger.warning("Alibaba Cloud OSS credentials not found, storage functionality will be disabled")
    
    # Initialize database connection
    try:
        app.state.db_conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        logger.info("Database connection established")
    except Exception as e:
        app.state.db_conn = None
        logger.error(f"Failed to connect to database: {str(e)}")
        # Print more detailed connection information for debugging
        logger.error(f"Connection details: host={DB_HOST}, port={DB_PORT}, dbname={DB_NAME}, user={DB_USER}")
    
    yield
    
    # Shutdown code
    if hasattr(app.state, 'db_conn') and app.state.db_conn:
        app.state.db_conn.close()
        logger.info("Database connection closed")
    
    logger.info("Shutting down API server")

# Initialize FastAPI application
app = FastAPI(
    title="Aplus API",
    description="Backend API for Aplus application",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response model for image generation
class ImageGenerationResponse(BaseModel):
    local_path: str
    storage_url: Optional[str] = None
    space_id: Optional[str] = None


@app.get("/", tags=["root"])
def read_root() -> Dict[str, str]:
    """
    Root endpoint returning a welcome message.
    """
    return {"message": "Welcome to Aplus API"}


@app.get("/health", tags=["health"])
def health_check() -> Dict[str, str]:
    """
    Health check endpoint to verify API is running.
    """
    return {"status": "healthy"}


@app.post("/generate-image", tags=["image-generation"], response_model=ImageGenerationResponse)
async def generate_image(prompt: str = Form(...), 
                        guidance_scale: float = Form(0.0),
                        num_inference_steps: int = Form(4),
                        max_sequence_length: int = Form(256),
                        seed: Optional[int] = Form(None),
                        space_id: Optional[str] = Form(None)):
    """
    Generate an image using the FluxPipeline based on the provided prompt.
    
    Args:
        prompt: The text prompt to generate an image from
        guidance_scale: Guidance scale for the generation (default: 0.0)
        num_inference_steps: Number of inference steps (default: 4)
        max_sequence_length: Maximum sequence length (default: 256)
        seed: Random seed for reproducibility (optional)
        space_id: ID of the space to store the image in (optional)
        
    Returns:
        The generated image along with storage information
    """
    global flux_pipeline
    
    if flux_pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="FluxPipeline model is not available"
        )
    
    try:
        # Create a generator with the provided seed or a random one
        if seed is not None:
            generator = torch.Generator("cpu").manual_seed(seed)
        else:
            generator = torch.Generator("cpu").manual_seed(torch.randint(0, 2**32 - 1, (1,)).item())
        
        # Generate the image
        image = flux_pipeline(
            prompt,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            max_sequence_length=max_sequence_length,
            generator=generator
        ).images[0]
        
        # Create unique filename and save locally
        image_id = str(uuid.uuid4())
        image_filename = f"{image_id}.png"
        
        # Create local path structure
        os.makedirs("generated_images", exist_ok=True)
        local_filepath = f"generated_images/{image_filename}"
        image.save(local_filepath)
        
        storage_url = None
        
        # Upload to Alibaba Cloud OSS if available
        if app.state.bucket:
            try:
                # Determine object path based on space_id
                object_path = f"{space_id}/{image_filename}" if space_id else image_filename
                
                # Upload the object
                app.state.bucket.put_object_from_file(object_path, local_filepath)
                
                # Construct the URL for the uploaded object
                storage_url = f"https://{ALIBABA_OSS_BUCKET}.{ALIBABA_OSS_ENDPOINT}/{object_path}"
                logger.info(f"Image uploaded to Alibaba Cloud OSS: {storage_url}")
            except Exception as storage_error:
                logger.error(f"Error uploading to storage: {str(storage_error)}")
                # Continue execution even if storage upload fails
        
        # Create response with file and storage information
        response = ImageGenerationResponse(
            local_path=local_filepath,
            storage_url=storage_url,
            space_id=space_id
        )
        
        # Return the FileResponse with additional headers
        return FileResponse(
            local_filepath, 
            media_type="image/png",
            headers={"X-Storage-URL": storage_url or ""}
        )
    
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate image: {str(e)}"
        )


class StudyPlanCreate(BaseModel):
    plan_name: str = Field(..., description="Name of the study plan")
    plan_description: str = Field(None, description="Description of the study plan")

class WorkflowTrigger(BaseModel):
    plan_id: int = Field(..., description="ID of the study plan")
    links: List[str] = Field(default=[], description="List of links for the workflow")
    files: List[str] = Field(default=[], description="List of file paths for the workflow")

@app.post("/create-study-plan", tags=["study-plan"])
async def create_study_plan(study_plan: StudyPlanCreate):
    """
    Create a new study plan with name and description.
    
    Args:
        study_plan: The study plan data including name and description
        
    Returns:
        The created study plan ID and success message
    """
    if not hasattr(app.state, 'db_conn') or app.state.db_conn is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available"
        )
    
    try:
        # Create a cursor for database operations
        cursor = app.state.db_conn.cursor(cursor_factory=RealDictCursor)
        
        # Begin transaction
        app.state.db_conn.autocommit = False
        
        try:
            # Insert the study plan into the plans table
            cursor.execute(
                """
                INSERT INTO public.plans (name, description)
                VALUES (%s, %s)
                RETURNING id, name, description, created_at, updated_at
                """,
                (study_plan.plan_name, study_plan.plan_description)
            )
            
            # Get the created study plan
            created_plan = cursor.fetchone()
            
            # Commit the transaction
            app.state.db_conn.commit()
            
            return {
                "status": "success",
                "message": "Study plan created successfully",
                "plan": created_plan
            }
            
        except Exception as e:
            # Rollback in case of error
            app.state.db_conn.rollback()
            logger.error(f"Error creating study plan: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create study plan: {str(e)}"
            )
        finally:
            # Reset autocommit and close cursor
            app.state.db_conn.autocommit = True
            cursor.close()
            
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

async def extract_text_from_url(url: str) -> str:
    """
    Scrape text content from a URL
    
    Args:
        url: The URL to scrape
        
    Returns:
        The extracted text content
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=30) as response:
                if response.status != 200:
                    logger.warning(f"Failed to fetch URL {url}: HTTP {response.status}")
                    return f"Failed to fetch content from {url}"
                
                html = await response.text()
                
                # Parse HTML with BeautifulSoup
                soup = BeautifulSoup(html, 'html.parser')
                
                # Remove script and style elements
                for script_or_style in soup(["script", "style"]):
                    script_or_style.decompose()
                
                # Get text content
                text = soup.get_text(separator='\n')
                
                # Clean up text: remove multiple newlines and whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = '\n'.join(chunk for chunk in chunks if chunk)
                
                return text
    except Exception as e:
        logger.error(f"Error scraping URL {url}: {str(e)}")
        return f"Error extracting content from {url}: {str(e)}"

async def extract_text_from_pdf(file_path: str, ocr_client) -> str:
    """
    Extract text from a PDF file using Alibaba Cloud OCR
    
    Args:
        file_path: Path to the PDF file
        ocr_client: Alibaba Cloud OCR client
        
    Returns:
        The extracted text content
    """
    try:
        # Read the file and encode it as base64
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # Encode the file content as base64
        base64_content = base64.b64encode(file_content).decode('utf-8')
        
        # Create the OCR request
        request = RecognizePdfRequest(
            body=base64_content
        )
        
        # Set runtime options
        runtime = util_models.RuntimeOptions()
        
        # Call the OCR API
        response = ocr_client.recognize_general_with_options(request, runtime)
        
        # Extract text from the response
        if response.body and response.body.data and response.body.data.content:
            return response.body.data.content
        else:
            logger.warning(f"No text content extracted from {file_path}")
            return f"No text content extracted from {os.path.basename(file_path)}"
    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
        return f"Error extracting text from {os.path.basename(file_path)}: {str(e)}"


@app.post("/trigger-workflow", tags=["workflow"])
async def trigger_workflow(
    plan_id: int = Form(...),
    links: str = Form("[]"),  # JSON string of links
    files: List[UploadFile] = File(...)
):
    """
    Trigger a workflow with a plan ID, links, and PDF files.
    
    Args:
        plan_id: ID of the study plan
        links: JSON string containing a list of links
        files: List of uploaded PDF files
        
    Returns:
        Status of the workflow trigger operation
    """
    try:
        # Parse the links JSON string to a Python list
        try:
            links_list = json.loads(links)
            if not isinstance(links_list, list):
                links_list = []
        except json.JSONDecodeError:
            links_list = []
            
        # Process the uploaded PDF files
        pdf_files = []
        pdf_texts = {}  # Store extracted text from PDFs
        pdf_oss_urls = {}  # Store OSS URLs for the extracted text
        
        for file in files:
            # Check if the file is a PDF
            if file.content_type == "application/pdf" or file.filename.lower().endswith('.pdf'):
                # Read file content
                content = await file.read()
                
                # Create a unique filename to avoid collisions
                unique_filename = f"{uuid.uuid4()}_{file.filename}"
                
                # Create directory if it doesn't exist
                os.makedirs("uploaded_pdfs", exist_ok=True)
                
                # Save the file to disk
                file_path = f"uploaded_pdfs/{unique_filename}"
                with open(file_path, "wb") as f:
                    f.write(content)
                
                # Store file information
                pdf_file_info = {
                    "original_filename": file.filename,
                    "saved_path": file_path,
                    "size": len(content),
                    "content_type": file.content_type
                }
                
                # Extract text from PDF using OCR if OCR client is available
                if hasattr(app.state, 'ocr_client') and app.state.ocr_client:
                    try:
                        extracted_text = await extract_text_from_pdf(file_path, app.state.ocr_client)
                        pdf_file_info["extracted_text"] = extracted_text
                        pdf_texts[file.filename] = extracted_text
                        print("pdf extraction text: "+ extracted_text)
                        
                        # Store the extracted text in OSS
                        if app.state.bucket:
                            try:
                                # Create a unique text filename for OSS
                                text_filename = f"extracted_texts/{plan_id}/{uuid.uuid4()}_pdf_{file.filename}.txt"
                                
                                # Upload the extracted text to OSS
                                app.state.bucket.put_object(text_filename, extracted_text)
                                
                                # Get the OSS URL
                                oss_url = f"https://{ALIBABA_OSS_BUCKET}.{ALIBABA_OSS_ENDPOINT}/{text_filename}"
                                pdf_file_info["oss_text_url"] = oss_url
                                pdf_oss_urls[file.filename] = oss_url
                                logger.info(f"PDF extracted text stored in OSS: {oss_url}")
                            except Exception as oss_error:
                                logger.error(f"Error storing PDF text in OSS: {str(oss_error)}")
                                pdf_file_info["oss_error"] = str(oss_error)
                        
                    except Exception as ocr_error:
                        logger.error(f"OCR processing error for {file.filename}: {str(ocr_error)}")
                        pdf_file_info["ocr_error"] = str(ocr_error)
                else:
                    pdf_file_info["ocr_status"] = "OCR client not available"
                
                pdf_files.append(pdf_file_info)
                
                # Reset file pointer for potential future reads
                await file.seek(0)
        
        # Process links and extract content
        link_contents = {}
        link_oss_urls = {}  # Store OSS URLs for the extracted text from links
        
        for url in links_list:
            try:
                extracted_text = await extract_text_from_url(url)
                link_contents[url] = extracted_text
                print("link extraction text: "+ extracted_text)
                
                # Store the extracted text in OSS
                if app.state.bucket:
                    try:
                        # Create a URL-safe filename by encoding the URL
                        encoded_url = base64.urlsafe_b64encode(url.encode()).decode()
                        text_filename = f"extracted_texts/{plan_id}/{uuid.uuid4()}_url_{encoded_url}.txt"
                        
                        # Upload the extracted text to OSS
                        app.state.bucket.put_object(text_filename, extracted_text)
                        
                        # Get the OSS URL
                        oss_url = f"https://{ALIBABA_OSS_BUCKET}.{ALIBABA_OSS_ENDPOINT}/{text_filename}"
                        link_oss_urls[url] = oss_url
                        logger.info(f"URL extracted text stored in OSS: {oss_url}")
                    except Exception as oss_error:
                        logger.error(f"Error storing URL text in OSS: {str(oss_error)}")
                
            except Exception as url_error:
                logger.error(f"Error processing URL {url}: {str(url_error)}")
                link_contents[url] = f"Error: {str(url_error)}"
        
        # Log the workflow trigger
        logger.info(f"Workflow triggered for plan_id: {plan_id} with {len(links_list)} links and {len(pdf_files)} PDF files")
        
        # Here you would typically queue or start your processing workflow
        # For now, we'll just return the collected data
        
        return {
            "status": "success",
            "message": "Workflow triggered successfully",
            "data": {
                "plan_id": plan_id,
                "links": links_list,
                "link_contents": link_contents,
                "link_oss_urls": link_oss_urls,
                "files": pdf_files,
                "pdf_texts": pdf_texts,
                "pdf_oss_urls": pdf_oss_urls
            }
        }
        
    except Exception as e:
        logger.error(f"Error triggering workflow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger workflow: {str(e)}"
        )



if __name__ == "__main__":
    # This allows running directly with python main.py for development
    # The actual deployment will use the uvicorn command from the script
    import uvicorn
    port = int(os.environ.get("BACKEND_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)