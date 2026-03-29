"""
product_fetcher.py
Fetches real product data (price, image, buy link) from SerpAPI Google Shopping.
Falls back to constructed e-commerce search URLs when API fails.
"""

import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.getenv("SERP_API_KEY")
logger = logging.getLogger(__name__)

# In-memory cache for product data (avoids repeated API calls for same query)
_product_cache = {}


def fetch_product_data(product_name):
    """
    Fetches real product data from SerpAPI Google Shopping.
    Returns dict with: title, price, price_raw, currency, thumbnail, product_link
    
    Uses Google Shopping (engine=google_shopping) for Indian market (gl=in).
    """
    if not product_name:
        return _build_fallback(product_name)

    cache_key = product_name.strip().lower()
    if cache_key in _product_cache:
        logger.info(f"Product cache hit: {cache_key}")
        return _product_cache[cache_key]

    # Try SerpAPI Google Shopping
    if SERP_API_KEY and len(SERP_API_KEY) > 10:
        try:
            params = {
                "engine": "google_shopping",
                "q": product_name,
                "hl": "en",
                "gl": "in",
                "api_key": SERP_API_KEY,
                "num": 3
            }
            response = requests.get(
                "https://serpapi.com/search.json",
                params=params,
                timeout=8
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("shopping_results", [])
                
                if not results:
                    results = data.get("inline_shopping_results", [])
                
                if results and len(results) > 0:
                    item = results[0]
                    
                    # Extract price - try extracted_price first, then parse from price string
                    price_raw = item.get("extracted_price", 0)
                    price_str = item.get("price", "")
                    
                    if not price_raw and price_str:
                        # Parse price string like "₹499.00" or "$12.99"
                        import re
                        nums = re.findall(r'[\d,.]+', price_str)
                        if nums:
                            try:
                                price_raw = float(nums[0].replace(',', ''))
                            except ValueError:
                                price_raw = 0
                    
                    # Ensure price is in reasonable INR range
                    if price_raw and price_raw < 10:
                        # Likely USD, convert approximately
                        price_raw = round(price_raw * 83, 2)
                    
                    thumbnail = item.get("thumbnail", "")
                    product_link = item.get("link", item.get("product_link", ""))
                    
                    # If no direct link, try to find from source
                    if not product_link:
                        source = item.get("source", "")
                        if source:
                            product_link = _build_search_url(product_name, source)
                    
                    result = {
                        "title": item.get("title", product_name),
                        "price": round(price_raw, 0) if price_raw else _estimate_price(product_name),
                        "price_display": f"₹{int(round(price_raw, 0))}" if price_raw else f"₹{_estimate_price(product_name)}",
                        "currency": "INR",
                        "thumbnail": thumbnail,
                        "product_link": product_link or _build_amazon_url(product_name),
                        "source": item.get("source", "Online Store"),
                        "rating": item.get("rating", None),
                        "reviews": item.get("reviews", None),
                    }
                    
                    _product_cache[cache_key] = result
                    logger.info(f"SerpAPI Shopping success for: {product_name}")
                    return result

        except Exception as e:
            logger.error(f"SerpAPI Shopping Error for '{product_name}': {e}")

    # Fallback
    fallback = _build_fallback(product_name)
    _product_cache[cache_key] = fallback
    return fallback


def fetch_multiple_products(product_names):
    """
    Fetches product data for multiple product names.
    Returns list of product data dicts.
    """
    results = []
    for name in product_names:
        data = fetch_product_data(name)
        results.append(data)
    return results


def _build_fallback(product_name):
    """Build fallback product data with Amazon.in search link and estimated price."""
    price = _estimate_price(product_name)
    return {
        "title": product_name or "Eco Product",
        "price": price,
        "price_display": f"₹{price}",
        "currency": "INR",
        "thumbnail": "",
        "product_link": _build_amazon_url(product_name),
        "source": "Amazon.in",
        "rating": None,
        "reviews": None,
    }


def _build_amazon_url(product_name):
    """Build Amazon.in search URL for a product."""
    if not product_name:
        return "https://www.amazon.in"
    query = product_name.replace(" ", "+")
    return f"https://www.amazon.in/s?k={query}&tag=eco-friendly"


def _build_flipkart_url(product_name):
    """Build Flipkart search URL for a product."""
    if not product_name:
        return "https://www.flipkart.com"
    query = product_name.replace(" ", "%20")
    return f"https://www.flipkart.com/search?q={query}"


def _build_search_url(product_name, source=""):
    """Build a search URL based on source."""
    source_lower = source.lower() if source else ""
    if "flipkart" in source_lower:
        return _build_flipkart_url(product_name)
    elif "myntra" in source_lower:
        query = product_name.replace(" ", "-")
        return f"https://www.myntra.com/{query}"
    else:
        return _build_amazon_url(product_name)


def _estimate_price(product_name):
    """
    Estimate a realistic Indian price for eco products when API data unavailable.
    """
    if not product_name:
        return 499
    
    name_lower = product_name.lower()
    
    price_map = {
        "bottle": 499,
        "water bottle": 599,
        "steel bottle": 549,
        "glass bottle": 399,
        "bamboo bottle": 699,
        "copper bottle": 799,
        "bag": 299,
        "cloth bag": 199,
        "jute bag": 249,
        "tote bag": 349,
        "cotton bag": 299,
        "cup": 249,
        "bamboo cup": 349,
        "steel cup": 299,
        "tumbler": 499,
        "toothbrush": 149,
        "bamboo toothbrush": 129,
        "straw": 199,
        "steel straw": 199,
        "bamboo straw": 149,
        "shirt": 899,
        "t-shirt": 799,
        "organic cotton": 999,
        "hemp shirt": 1299,
        "linen shirt": 1499,
        "soap": 199,
        "shampoo bar": 349,
        "lunch box": 599,
        "tiffin": 699,
        "wrap": 399,
        "beeswax wrap": 499,
        "razor": 799,
        "safety razor": 899,
        "pen": 149,
        "notebook": 299,
        "phone case": 499,
        "charger": 1299,
        "earbuds": 1999,
        "furniture": 4999,
        "chair": 3999,
        "plate": 599,
        "cutlery": 399,
    }
    
    # Search for best matching key
    best_match = None
    best_len = 0
    for key, price in price_map.items():
        if key in name_lower and len(key) > best_len:
            best_match = key
            best_len = len(key)
    
    if best_match:
        return price_map[best_match]
    
    return 499  # Default reasonable eco product price


def clear_cache():
    """Clear the product data cache."""
    global _product_cache
    _product_cache = {}
