from typing import Union, Dict, Any
from fastapi import FastAPI, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from diffusers import FluxPipeline
from fastapi.responses import FileResponse
from typing import Optional
import torch
import uuid
import os
import logging
# Add Alibaba Cloud OSS imports
import oss2
from pydantic import BaseModel

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
    
    yield
    # Shutdown code (if needed)
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


if __name__ == "__main__":
    # This allows running directly with python main.py for development
    # The actual deployment will use the uvicorn command from the script
    import uvicorn
    port = int(os.environ.get("BACKEND_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)