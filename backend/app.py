import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pathlib import Path
import pandas as pd
from pydantic import BaseModel
import google.generativeai as genai
from PIL import Image
import io
import os
import logging
from transformers import ViTImageProcessor, ViTForImageClassification
import torch
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get port from environment variable (Render provides this)
port = int(os.environ.get("PORT", 8000))

app = FastAPI(
    title="Ocean Data API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY", "AIzaSyD8zxB8Hs1MDlHKcj5FJl0AcXdAwKhk3uU")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Hugging Face model
try:
    logger.info("Loading Hugging Face model...")
    processor = ViTImageProcessor.from_pretrained(
        'google/vit-base-patch16-224')
    model = ViTForImageClassification.from_pretrained(
        'google/vit-base-patch16-224')
    HF_MODEL_LOADED = True
    logger.info("Hugging Face model loaded successfully")
except Exception as e:
    HF_MODEL_LOADED = False
    logger.error(f"Failed to load Hugging Face model: {str(e)}")
    print("Hugging Face model not available, using fallback")

# Use absolute paths for production
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Map dataset domains to CSV + metadata
DATASETS = {
    "oceanographic": {
        "file": os.path.join(BASE_DIR, "../Data/processed/ocean_data_india.csv"),
        "name": "Sea Surface Temperature",
        "provider": "NOAA",
        "coverage": "Global",
    },
    "fisheries": {
        "file": os.path.join(BASE_DIR, "../Data/processed/cleaned_fish_data.csv"),
        "name": "Catch Records",
        "provider": "FAO",
        "coverage": "Global",
    },
    "molecular": {
        "file": os.path.join(BASE_DIR, "../Data/processed/real_edna_data.csv"),
        "name": "eDNA Metabarcoding",
        "provider": "OBIS",
        "coverage": "Global",
    },
}


def load_csv(domain: str) -> pd.DataFrame:
    if domain not in DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")
    path = DATASETS[domain]["file"]
    if not os.path.exists(path):
        print(f"Warning: CSV file missing: {path}")
        return pd.DataFrame({
            'example_column': ['Example data 1', 'Example data 2'],
            'another_column': [123, 456]
        })
    try:
        return pd.read_csv(path)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error reading {path}: {e}")


class SearchQuery(BaseModel):
    query: str


@app.post("/classify-image")
async def classify_image(file: UploadFile = File(...)):
    """
    Classify marine-related images using Hugging Face vision models
    """
    try:
        logger.info(
            f"Received image: {file.filename}, content-type: {file.content_type}")

        # Check if the file is an image
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, detail="File must be an image (JPEG, PNG, etc.)")

        # Read the image file
        image_data = await file.read()
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")

        # Try to open the image
        try:
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            logger.info(
                f"Image opened successfully: {image.size}, mode: {image.mode}")
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Invalid image file: {str(e)}")

        # Check if Hugging Face model is available
        if not HF_MODEL_LOADED:
            return {
                "classification": "AI model is still loading. Please try again in a moment or describe the image.",
                "status": "error",
                "suggestion": "Use the description field to describe your image"
            }

        try:
            # Process image with Hugging Face model
            inputs = processor(images=image, return_tensors="pt")
            outputs = model(**inputs)
            logits = outputs.logits
            predicted_class_idx = logits.argmax(-1).item()
            predicted_label = model.config.id2label[predicted_class_idx]
            confidence = torch.nn.functional.softmax(
                logits, dim=1)[0][predicted_class_idx].item()

            logger.info(
                f"Prediction: {predicted_label}, Confidence: {confidence:.2%}")

            # Marine-specific interpretation
            marine_interpretation = interpret_for_marine_context(
                predicted_label, confidence)

            return {
                "classification": marine_interpretation,
                "detected_object": predicted_label,
                "confidence": f"{confidence:.2%}",
                "status": "success"
            }

        except Exception as e:
            logger.error(f"Hugging Face model error: {str(e)}")
            return {
                "classification": "Error processing image with AI. Please describe the image instead.",
                "status": "error",
                "suggestion": "Use the description field below to describe what you see"
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in classify_image: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


def interpret_for_marine_context(label, confidence):
    """Convert generic labels to marine biology context"""
    label_lower = label.lower()

    marine_categories = {
        'fish': ['fish', 'trout', 'salmon', 'shark', 'tuna', 'goldfish', 'aquarium', 'angelfish'],
        'coral': ['coral', 'reef', 'anemone', 'coral reef'],
        'mammals': ['whale', 'dolphin', 'seal', 'otter', 'walrus', 'manatee'],
        'birds': ['seagull', 'pelican', 'penguin', 'albatross', 'tern'],
        'invertebrates': ['jellyfish', 'octopus', 'squid', 'crab', 'lobster', 'shrimp', 'starfish'],
        'environment': ['water', 'ocean', 'sea', 'underwater', 'beach', 'coast', 'waves']
    }

    # Detect marine context
    detected_context = []
    for category, keywords in marine_categories.items():
        if any(keyword in label_lower for keyword in keywords):
            detected_context.append(category)

    # Build analysis
    analysis = "🌊 **Marine Image Analysis**\n\n"

    if detected_context:
        analysis += f"**Detected Context:** {', '.join(detected_context)}\n\n"

    analysis += f"**AI Detection:** {label} (Confidence: {confidence:.2%})\n\n"

    if any(ctx in detected_context for ctx in ['fish', 'coral', 'mammals', 'invertebrates']):
        analysis += "This appears to be marine life. For more specific identification, consider:\n"
        analysis += "- Taking a clearer photo if possible\n"
        analysis += "- Describing distinctive features like colors, patterns, or size\n"
        analysis += "- noting the location where the photo was taken\n"
    elif 'environment' in detected_context:
        analysis += "This appears to be a marine environment. For better analysis, try to:\n"
        analysis += "- Focus on specific organisms in the image\n"
        analysis += "- Describe any visible marine life\n"
        analysis += "- Note water conditions and habitat features\n"
    else:
        analysis += "This doesn't appear to be marine-related. If it is, please describe what you see in the image.\n"

    analysis += "\n**Tip:** Use the description field below for more accurate identification!"

    return analysis


@app.post("/ai-search")
async def ai_search(payload: SearchQuery):
    """
    Connect to Google Gemini API to get marine insights.
    """
    try:
        # Check if API key is configured
        if GEMINI_API_KEY == "your-actual-gemini-api-key-here":
            return {"result": "Gemini API key not configured. Please add your API key to the backend."}

        # Initialize the Gemini model
        model = genai.GenerativeModel('gemini-pro')

        prompt = f"""As a marine biology expert, provide detailed information about: {payload.query}
        
        Please include:
        1. Classification and characteristics
        2. Habitat and distribution
        3. Ecological role
        4. Conservation status (if applicable)
        5. Interesting facts
        
        Format your response in clear paragraphs with bullet points for key information."""

        response = model.generate_content(prompt)
        return {"result": response.text}

    except Exception as e:
        print(f"Gemini API error: {e}")
        # Fallback mock response
        fallback_responses = {
            "shark": """• Sharks are elasmobranch fish with cartilaginous skeletons
• Over 500 species exist, from small dwarf lanternsharks to massive whale sharks
• They have existed for over 400 million years, predating dinosaurs
• Many are apex predators crucial for maintaining marine ecosystem balance
• Sharks have electroreception allowing them to detect electrical fields""",

            "tuna": """• Tuna are fast-swimming fish in the tribe Thunnini
• They are warm-blooded, unusual among fish, enabling survival in cooler waters
• Some species reach speeds up to 75 km/h (47 mph)
• Highly migratory, traveling across oceans throughout their lives
• Important commercially but many species face overfishing concerns""",

            "coral": """• Corals are marine invertebrates in class Anthozoa
• They live in colonies of identical individual polyps
• Coral reefs are among Earth's most diverse ecosystems
• Reefs form as polyps secrete calcium carbonate exoskeletons
• Coral bleaching occurs when stressed corals expel their algae"""
        }

        query_lower = payload.query.lower()
        for key in fallback_responses:
            if key in query_lower:
                return {"result": fallback_responses[key]}

        return {"result": f"Information about {payload.query}:\n\n• Marine species play vital roles in ocean ecosystems\n• Many face threats from climate change, pollution, and overfishing\n• Conservation efforts are essential for marine biodiversity"}


@app.get("/")
async def root():
    return {"message": "Ocean Data API is running", "status": "OK"}


@app.get("/health")
async def health_check():
    """Health check endpoint for Render"""
    return {
        "status": "healthy",
        "service": "OceanIQ API",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": HF_MODEL_LOADED
    }


@app.get("/models/status")
async def model_status():
    """Check if Hugging Face model is loaded"""
    return {
        "hugging_face_loaded": HF_MODEL_LOADED,
        "model_name": "google/vit-base-patch16-224" if HF_MODEL_LOADED else None
    }


@app.get("/datasets")
def list_datasets() -> Dict[str, Any]:
    """Return available datasets with metadata and API links."""
    # Use relative URLs that will work on Render
    base_url = os.environ.get("RENDER_EXTERNAL_URL", "http://localhost:8000")
    result = {}
    for domain, meta in DATASETS.items():
        result[domain] = {
            "name": meta["name"],
            "provider": meta["provider"],
            "coverage": meta["coverage"],
            "preview_url": f"{base_url}/preview/{domain}",
            "api_url": f"{base_url}/data/{domain}",
            "columns_url": f"{base_url}/columns/{domain}",
        }
    return result


@app.get("/preview/{domain}")
def preview_dataset(domain: str, n: int = 20) -> List[Dict[str, Any]]:
    """Return first n rows of a dataset."""
    df = load_csv(domain)
    return df.head(n).where(pd.notnull(df), None).to_dict(orient="records")


@app.get("/data/{domain}")
def get_dataset(
    domain: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
) -> Dict[str, Any]:
    """Return dataset rows with pagination."""
    df = load_csv(domain)
    subset = df.iloc[offset: offset + limit]
    return {
        "total": len(df),
        "offset": offset,
        "limit": limit,
        "rows": subset.where(pd.notnull(subset), None).to_dict(orient="records"),
    }


@app.get("/columns/{domain}")
def get_columns(domain: str) -> List[str]:
    """Return column names for a dataset."""
    df = load_csv(domain)
    return list(df.columns)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
