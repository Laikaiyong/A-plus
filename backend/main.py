from typing import Union, Dict, Any, List
from fastapi import FastAPI, HTTPException, status, Form, Body
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
# Add Alibaba Cloud OSS imports
import oss2
from pydantic import BaseModel, Field


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

# Models for study plan creation
class StudyFile(BaseModel):
    file_name: str
    file_url: str

class StudyLink(BaseModel):
    link_title: str
    link_url: str

class StudyTopic(BaseModel):
    topic_name: str
    topic_description: Optional[str] = None

class StudySessionRequest(BaseModel):
    study_session_title: str
    study_date: str
    study_duration: int  # in minutes
    study_topics: List[StudyTopic]

class CreateStudyPlanRequest(BaseModel):
    study_plan_name: str
    study_plan_description: str
    files: List[StudyFile] = Field(default_factory=list)
    links: List[StudyLink] = Field(default_factory=list)
    study_session: StudySessionRequest

class CreateStudyPlanResponse(BaseModel):
    study_plan_id: int
    message: str = "Study plan created successfully"

# Models for study plan creation
class StudyFile(BaseModel):
    file_name: str
    file_url: str

class StudyLink(BaseModel):
    link_title: str
    link_url: str

class StudyTopic(BaseModel):
    topic_name: str
    topic_description: Optional[str] = None

class StudySessionRequest(BaseModel):
    study_session_title: str
    study_date: str
    study_duration: int  # in minutes
    study_topics: List[StudyTopic]

class CreateStudyPlanRequest(BaseModel):
    study_plan_name: str
    study_plan_description: str
    files: List[StudyFile] = Field(default_factory=list)
    links: List[StudyLink] = Field(default_factory=list)
    study_session: StudySessionRequest

class CreateStudyPlanResponse(BaseModel):
    study_plan_id: int
    message: str = "Study plan created successfully"

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


@app.post("/create-study-plan", tags=["study-plan"], response_model=CreateStudyPlanResponse)
async def create_study_plan(study_plan: CreateStudyPlanRequest = Body(...)):
    """
    Create a new study plan with associated files, links, and study session.
    
    Args:
        study_plan: The study plan data including name, description, files, links, and study session details
        
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
            # 1. Insert study plan and get the ID
            cursor.execute(
                """
                INSERT INTO study_plans (name, description, created_at, updated_at)
                VALUES (%s, %s, NOW(), NOW())
                RETURNING id
                """,
                (study_plan.study_plan_name, study_plan.study_plan_description)
            )
            study_plan_id = cursor.fetchone()['id']
            
            # 2. Insert files if any
            for file in study_plan.files:
                cursor.execute(
                    """
                    INSERT INTO study_plan_files (study_plan_id, file_name, file_url, created_at, updated_at)
                    VALUES (%s, %s, %s, NOW(), NOW())
                    """,
                    (study_plan_id, file.file_name, file.file_url)
                )
            
            # 3. Insert links if any
            for link in study_plan.links:
                cursor.execute(
                    """
                    INSERT INTO study_plan_links (study_plan_id, link_title, link_url, created_at, updated_at)
                    VALUES (%s, %s, %s, NOW(), NOW())
                    """,
                    (study_plan_id, link.link_title, link.link_url)
                )
            
            # 4. Insert study session
            cursor.execute(
                """
                INSERT INTO study_sessions (study_plan_id, title, session_date, duration_minutes, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                RETURNING id
                """,
                (
                    study_plan_id, 
                    study_plan.study_session.study_session_title,
                    study_plan.study_session.study_date,
                    study_plan.study_session.study_duration
                )
            )
            study_session_id = cursor.fetchone()['id']
            
            # 5. Insert study topics
            for topic in study_plan.study_session.study_topics:
                cursor.execute(
                    """
                    INSERT INTO study_topics (study_session_id, name, description, created_at, updated_at)
                    VALUES (%s, %s, %s, NOW(), NOW())
                    """,
                    (study_session_id, topic.topic_name, topic.topic_description or '')
                )
            
            # Commit the transaction
            app.state.db_conn.commit()
            
            return CreateStudyPlanResponse(study_plan_id=study_plan_id)
            
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


if __name__ == "__main__":
    # This allows running directly with python main.py for development
    # The actual deployment will use the uvicorn command from the script
    import uvicorn
    port = int(os.environ.get("BACKEND_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)