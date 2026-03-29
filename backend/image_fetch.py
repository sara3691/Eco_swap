"""
image_fetch.py
Fetches product images from multiple sources with smart fallbacks.
Priority: SerpAPI Shopping thumbnail → Unsplash → Placeholder
"""

import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.getenv("SERP_API_KEY")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

logger = logging.getLogger(__name__)

# Eco-themed default placeholder
PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop"

# Image cache to avoid repeated API calls
_image_cache = {}


def fetch_product_image(query, eco_themed=True):
    """
    Fetches a product image using multiple sources.
    For eco_themed=False (original product): SerpAPI Image Search → Unsplash
    For eco_themed=True (eco alternatives): SerpAPI Shopping → Unsplash → Placeholder
    """
    if not query:
        return PLACEHOLDER_IMAGE
    
    cache_key = f"{query.strip().lower()}_{eco_themed}"
    if cache_key in _image_cache:
        return _image_cache[cache_key]
    
    image_url = None
    
    if eco_themed:
        # For eco alternatives: try shopping thumbnail first (most accurate)
        image_url = _fetch_from_serp_shopping(query)
        if not image_url:
            image_url = _fetch_from_unsplash(query, eco_themed=True)
    else:
        # For original product analysis: image search
        image_url = _fetch_from_serp_images(query)
        if not image_url:
            image_url = _fetch_from_unsplash(query, eco_themed=False)
    
    if not image_url:
        image_url = _get_fallback_image(query)
    
    _image_cache[cache_key] = image_url
    return image_url


def fetch_eco_product_image(product_name):
    """
    Specifically fetches an image for an eco-friendly product.
    Uses SerpAPI Shopping for most accurate product images.
    """
    if not product_name:
        return PLACEHOLDER_IMAGE
    
    cache_key = f"eco_{product_name.strip().lower()}"
    if cache_key in _image_cache:
        return _image_cache[cache_key]

    # Try SerpAPI Shopping (best for product images)
    image_url = _fetch_from_serp_shopping(f"eco {product_name}")
    
    # Try Unsplash with eco query
    if not image_url:
        image_url = _fetch_from_unsplash(f"eco friendly {product_name}", eco_themed=True)
    
    # Try generic search
    if not image_url:
        image_url = _fetch_from_serp_images(product_name)
    
    if not image_url:
        image_url = _get_fallback_image(product_name)
    
    _image_cache[cache_key] = image_url
    return image_url


def _fetch_from_serp_shopping(query):
    """Fetch product thumbnail from SerpAPI Google Shopping."""
    if not SERP_API_KEY or len(SERP_API_KEY) < 10:
        return None
    
    try:
        params = {
            "engine": "google_shopping",
            "q": query,
            "hl": "en",
            "gl": "in",
            "api_key": SERP_API_KEY,
            "num": 1
        }
        response = requests.get("https://serpapi.com/search.json", params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            results = data.get("shopping_results", [])
            if not results:
                results = data.get("inline_shopping_results", [])
            if results and len(results) > 0:
                thumb = results[0].get("thumbnail", "")
                if thumb and thumb.startswith("http"):
                    logger.info(f"SerpAPI Shopping image found for: {query}")
                    return thumb
    except Exception as e:
        logger.error(f"SerpAPI Shopping Image Error: {e}")
    
    return None


def _fetch_from_serp_images(query):
    """Fetch image from SerpAPI Image Search."""
    if not SERP_API_KEY or len(SERP_API_KEY) < 10:
        return None
    
    try:
        params = {
            "q": f"{query} product",
            "tbm": "isch",
            "api_key": SERP_API_KEY,
            "num": 1
        }
        response = requests.get("https://serpapi.com/search.json", params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "images_results" in data and len(data["images_results"]) > 0:
                img = data["images_results"][0]
                url = img.get("original", img.get("thumbnail", ""))
                if url and url.startswith("http"):
                    logger.info(f"SerpAPI Image Search found for: {query}")
                    return url
    except Exception as e:
        logger.error(f"SerpAPI Image Search Error: {e}")
    
    return None


def _fetch_from_unsplash(query, eco_themed=True):
    """Fetch image from Unsplash API."""
    if not UNSPLASH_ACCESS_KEY or len(UNSPLASH_ACCESS_KEY) < 10:
        return None
    
    try:
        search_query = query.strip()
        if eco_themed:
            search_query = f"eco {search_query} product"
        else:
            search_query = f"{search_query} product"
        
        params = {
            "query": search_query,
            "client_id": UNSPLASH_ACCESS_KEY,
            "per_page": 1,
            "orientation": "squarish"
        }
        response = requests.get("https://api.unsplash.com/search/photos", params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "results" in data and len(data["results"]) > 0:
                url = data["results"][0]["urls"].get("regular", "")
                if url:
                    logger.info(f"Unsplash image found for: {query}")
                    return url
    except Exception as e:
        logger.error(f"Unsplash Error: {e}")
    
    return None


def _get_fallback_image(query):
    """Generate a fallback image URL."""
    if query:
        # Use a cleaner placeholder service
        tags = query.replace(" ", ",")
        return f"https://loremflickr.com/400/400/{tags},eco,sustainable"
    return PLACEHOLDER_IMAGE


def clear_image_cache():
    """Clear the image cache."""
    global _image_cache
    _image_cache = {}
