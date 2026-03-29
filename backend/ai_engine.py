"""
ai_engine.py
Handles all AI-powered analysis and eco-alternative generation.
Uses Google Gemini (primary) and Groq (secondary) with comprehensive fallback mapping.
"""

import os
import json
import requests
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configure API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ─── AI Results Cache ───────────────────────────────────────────────
_ai_cache = {}

# ─── Comprehensive Fallback Mapping ─────────────────────────────────
# Maps harmful/unsustainable products to eco-friendly alternatives.
# This ensures we NEVER return empty results.
FALLBACK_ALTERNATIVES = {
    "plastic bottle": [
        {"name": "Stainless Steel Water Bottle", "reason": "Reusable, durable, and completely plastic-free", "material": "Stainless Steel"},
        {"name": "Glass Water Bottle", "reason": "Non-toxic, recyclable, and chemical-free", "material": "Borosilicate Glass"},
        {"name": "Bamboo Water Bottle", "reason": "Biodegradable natural material with glass liner", "material": "Bamboo & Glass"},
    ],
    "plastic bag": [
        {"name": "Organic Cotton Tote Bag", "reason": "Reusable, washable, and biodegradable", "material": "Organic Cotton"},
        {"name": "Jute Shopping Bag", "reason": "Strong, durable, and 100% natural fiber", "material": "Natural Jute"},
        {"name": "Recycled Canvas Bag", "reason": "Made from recycled materials, very durable", "material": "Recycled Canvas"},
    ],
    "disposable cup": [
        {"name": "Bamboo Travel Cup", "reason": "Biodegradable and lightweight for daily use", "material": "Bamboo Fiber"},
        {"name": "Stainless Steel Tumbler", "reason": "Keeps drinks hot/cold, lasts for years", "material": "Stainless Steel"},
        {"name": "Ceramic Reusable Cup", "reason": "Non-toxic, microwave-safe, and stylish", "material": "Ceramic"},
    ],
    "plastic toothbrush": [
        {"name": "Bamboo Toothbrush", "reason": "Biodegradable handle, reduces plastic waste", "material": "Moso Bamboo"},
        {"name": "Charcoal Bamboo Toothbrush", "reason": "Activated charcoal bristles with bamboo handle", "material": "Bamboo & Charcoal"},
        {"name": "Cornstarch Toothbrush", "reason": "Made from plant-based materials, compostable", "material": "Cornstarch PLA"},
    ],
    "polyester shirt": [
        {"name": "Organic Cotton T-Shirt", "reason": "No harmful pesticides, breathable and soft", "material": "100% Organic Cotton"},
        {"name": "Hemp Fabric Shirt", "reason": "Uses 50% less water than cotton, very durable", "material": "Industrial Hemp"},
        {"name": "Linen Shirt", "reason": "Made from flax plant, naturally biodegradable", "material": "Natural Linen"},
    ],
    "plastic straw": [
        {"name": "Stainless Steel Straw Set", "reason": "Reusable, dishwasher-safe, comes with cleaner", "material": "Stainless Steel"},
        {"name": "Bamboo Drinking Straws", "reason": "Natural, biodegradable, and organic", "material": "Bamboo"},
        {"name": "Glass Drinking Straw", "reason": "Clear, reusable, and easy to clean", "material": "Borosilicate Glass"},
    ],
    "plastic wrap": [
        {"name": "Beeswax Food Wrap", "reason": "Natural, reusable, and keeps food fresh", "material": "Beeswax & Cotton"},
        {"name": "Silicone Stretch Lids", "reason": "Reusable, airtight seal, fits multiple sizes", "material": "Food-Grade Silicone"},
        {"name": "Plant-Based Cling Film", "reason": "Made from plant material, compostable", "material": "Plant Cellulose"},
    ],
    "paper towel": [
        {"name": "Reusable Bamboo Towels", "reason": "Washable up to 100 times, highly absorbent", "material": "Bamboo Fiber"},
        {"name": "Swedish Dishcloth", "reason": "Replaces 17 rolls of paper towels, compostable", "material": "Cellulose & Cotton"},
        {"name": "Microfiber Cleaning Cloth", "reason": "Ultra absorbent, machine washable", "material": "Recycled Microfiber"},
    ],
    "disposable razor": [
        {"name": "Safety Razor", "reason": "Stainless steel, only replace blades, lasts lifetime", "material": "Stainless Steel"},
        {"name": "Bamboo Handle Razor", "reason": "Sustainable handle with replaceable blades", "material": "Bamboo & Steel"},
        {"name": "Electric Trimmer", "reason": "Rechargeable, no disposable waste", "material": "Recycled Plastic & Metal"},
    ],
    "plastic container": [
        {"name": "Stainless Steel Lunch Box", "reason": "Durable, leak-proof, and non-toxic", "material": "Stainless Steel"},
        {"name": "Glass Food Container Set", "reason": "Microwave-safe, airtight, and toxin-free", "material": "Borosilicate Glass"},
        {"name": "Bamboo Fiber Container", "reason": "Lightweight, biodegradable, BPA-free", "material": "Bamboo Fiber"},
    ],
    "fast fashion": [
        {"name": "Organic Cotton Basics", "reason": "Ethically made, no harmful chemicals", "material": "GOTS Organic Cotton"},
        {"name": "Recycled Polyester Jacket", "reason": "Made from recycled PET bottles", "material": "Recycled PET"},
        {"name": "Thrifted Vintage Wear", "reason": "Reduces textile waste, unique style", "material": "Various Vintage"},
    ],
    "synthetic detergent": [
        {"name": "Eco Soap Nuts", "reason": "100% natural, chemical-free cleaning", "material": "Sapindus Mukorossi"},
        {"name": "Plant-Based Detergent", "reason": "Biodegradable, no toxic residue", "material": "Plant Enzymes"},
        {"name": "Detergent Sheets", "reason": "Zero plastic packaging, concentrated formula", "material": "Plant-Based"},
    ],
}

# Category-based fallbacks for broader matches
CATEGORY_FALLBACKS = {
    "plastic": [
        {"name": "Stainless Steel Alternative", "reason": "Durable, reusable, and fully recyclable", "material": "Stainless Steel"},
        {"name": "Bamboo Alternative", "reason": "Biodegradable, renewable, and sustainable", "material": "Bamboo"},
        {"name": "Glass Alternative", "reason": "Non-toxic, infinitely recyclable", "material": "Recycled Glass"},
    ],
    "disposable": [
        {"name": "Reusable Bamboo Product", "reason": "Long-lasting, eco-friendly replacement", "material": "Bamboo"},
        {"name": "Stainless Steel Reusable", "reason": "Durable alternative to single-use items", "material": "Stainless Steel"},
        {"name": "Silicone Reusable Product", "reason": "Flexible, durable, and easy to clean", "material": "Food-Grade Silicone"},
    ],
    "synthetic": [
        {"name": "Organic Cotton Product", "reason": "No pesticides, breathable, and soft", "material": "Organic Cotton"},
        {"name": "Hemp-Based Alternative", "reason": "Sustainable crop requiring minimal water", "material": "Industrial Hemp"},
        {"name": "Linen Product", "reason": "Natural flax fiber, biodegradable", "material": "Natural Linen"},
    ],
    "chemical": [
        {"name": "Plant-Based Cleaner", "reason": "Non-toxic, safe for environment and health", "material": "Plant Extracts"},
        {"name": "Vinegar & Baking Soda Kit", "reason": "Natural cleaning agents, zero chemicals", "material": "Natural"},
        {"name": "Enzyme-Based Cleaner", "reason": "Biodegradable bacteria break down stains", "material": "Bio-Enzymes"},
    ],
}

# Ultimate default fallback (always eco-friendly, never empty)
DEFAULT_FALLBACK = [
    {"name": "Bamboo Eco Product", "reason": "Renewable, biodegradable, and sustainable choice", "material": "Bamboo"},
    {"name": "Recycled Material Alternative", "reason": "Made from post-consumer recycled materials", "material": "Recycled Materials"},
    {"name": "Plant-Based Sustainable Option", "reason": "Derived from renewable plant sources", "material": "Plant-Based"},
]


def analyze_product_with_gemini(product_description):
    """Analyzes product sustainability using Google Gemini API."""
    if not GEMINI_API_KEY:
        return None

    prompt = f"""
    Analyze the following product for environmental sustainability and greenwashing.
    Product: {product_description}

    Return a STRICT JSON object with the following keys:
    - category (e.g., 'Clothing', 'Electronics', 'Home', 'Kitchen', 'Personal Care')
    - primary_material
    - estimated_carbon_kg (float)
    - sustainability_score (0-100)
    - eco_summary (short paragraph)
    - greenwashing_detected (boolean)

    Do not include any other text in the response.
    """

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        content = response.text.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        return json.loads(content)
    except Exception as e:
        logger.error(f"Gemini Analysis Error: {e}")
        return None


def fallback_keyword_engine(description):
    """Local keyword-based sustainability analysis fallback."""
    description = description.lower()
    score = 50
    
    keywords = {
        "organic cotton": 20, "recycled": 25, "bamboo": 15, "hemp": 20,
        "plastic": -30, "polyester": -15, "synthetic": -20, "vegan": 10,
        "fast fashion": -25, "disposable": -20, "glass": 10, "steel": 15,
        "natural": 10, "biodegradable": 20, "compostable": 20,
    }

    found_materials = []
    for keyword, value in keywords.items():
        if keyword in description:
            score += value
            found_materials.append(keyword)

    score = max(0, min(100, score))
    
    # Determine category
    category = "General"
    if any(w in description for w in ["shirt", "clothing", "wear", "fabric", "polyester", "cotton"]):
        category = "Clothing"
    elif any(w in description for w in ["bottle", "cup", "straw", "container", "plate"]):
        category = "Kitchen"
    elif any(w in description for w in ["bag", "wrap", "towel"]):
        category = "Home"
    elif any(w in description for w in ["toothbrush", "razor", "soap", "shampoo"]):
        category = "Personal Care"
    elif any(w in description for w in ["phone", "charger", "electronic"]):
        category = "Electronics"
    
    return {
        "category": category,
        "primary_material": ", ".join(found_materials) if found_materials else "Unknown",
        "estimated_carbon_kg": 5.0,
        "sustainability_score": score,
        "eco_summary": "Analysis based on keyword detection. Accuracy may be limited.",
        "greenwashing_detected": score < 40 and "eco" in description
    }


def get_eco_alternatives_gemini(product_name):
    """Get eco alternatives from Gemini with strict JSON output."""
    if not GEMINI_API_KEY:
        return None

    prompt = f"""
    You are an AI sustainability assistant for the web application ECOSWAP.
    A user has searched for: {product_name}

    Suggest exactly 3 eco-friendly alternative products that are direct functional replacements.
    
    For each alternative, provide:
    - name: Clear, specific product name (e.g., "Stainless Steel Water Bottle" not just "Steel Bottle")
    - reason: Short sustainability benefit (1 sentence)
    - material: Primary eco-material used

    Return ONLY a JSON object in this exact format:
    {{
      "alternatives": [
        {{ "name": "Product Name", "reason": "Why it's eco-friendly", "material": "Material" }}
      ]
    }}

    Do not include any other text, markdown, or formatting. Only the JSON object.
    """

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        data = json.loads(content)
        
        # Normalize key names
        if "alternatives" not in data:
            for key in ["eco_alternatives", "products", "suggestions", "results"]:
                if key in data:
                    data["alternatives"] = data.pop(key)
                    break
            else:
                data["alternatives"] = []
        
        # Validate we got actual alternatives
        if data["alternatives"] and len(data["alternatives"]) > 0:
            # Ensure each alt has required fields
            clean_alts = []
            for alt in data["alternatives"][:3]:
                clean_alts.append({
                    "name": alt.get("name", "Eco Alternative"),
                    "reason": alt.get("reason", alt.get("description", "Sustainable and eco-friendly")),
                    "material": alt.get("material", "Eco-Friendly Material"),
                })
            data["alternatives"] = clean_alts
            logger.info(f"Gemini returned {len(clean_alts)} alternatives for '{product_name}'")
            return data
        
        return None
    except Exception as e:
        logger.error(f"Gemini Eco Alternatives Error: {e}")
        return None


def get_eco_alternatives_groq(product_name):
    """Get eco alternatives from Groq (Llama 3) with JSON format."""
    if not GROQ_API_KEY or "your_groq_api_key" in GROQ_API_KEY:
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }

    prompt = f"""
    You are an AI sustainability assistant for ECOSWAP.
    A user searched for: {product_name}

    Suggest exactly 3 eco-friendly alternative products that are direct functional replacements.
    
    For each alternative, provide:
    - name: Clear, specific product name
    - reason: Short sustainability benefit (1 sentence)
    - material: Primary eco-material used

    Return ONLY a JSON object:
    {{
      "alternatives": [
        {{ "name": "Product Name", "reason": "Why eco-friendly", "material": "Material" }}
      ]
    }}
    """

    data = {
        "messages": [{"role": "user", "content": prompt}],
        "model": "llama-3.3-70b-versatile",
        "stream": False,
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=10)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        result = json.loads(content)
        
        if result.get("alternatives") and len(result["alternatives"]) > 0:
            logger.info(f"Groq returned alternatives for '{product_name}'")
            return result
        return None
    except Exception as e:
        logger.error(f"Groq Alternatives Error: {e}")
        return None


def get_eco_alternatives(product_name):
    """
    Main function to get eco-friendly alternatives.
    Uses a 3-level approach:
    1. Try AI (Gemini → Groq)
    2. Try exact fallback mapping
    3. Try category/keyword fallback
    NEVER returns empty results.
    """
    product_lower = product_name.strip().lower() if product_name else ""
    
    # Check cache first
    if product_lower in _ai_cache:
        logger.info(f"AI cache hit for: {product_lower}")
        return _ai_cache[product_lower]
    
    # ─── Level 1: AI Models ─────────────────────────────────────
    # Try Gemini first (primary)
    result = get_eco_alternatives_gemini(product_name)
    if result and result.get("alternatives"):
        _ai_cache[product_lower] = result
        return result
    
    # Try Groq as secondary
    result = get_eco_alternatives_groq(product_name)
    if result and result.get("alternatives"):
        _ai_cache[product_lower] = result
        return result
    
    # ─── Level 2: Exact Fallback Mapping ─────────────────────────
    for key, alternatives in FALLBACK_ALTERNATIVES.items():
        if key in product_lower or product_lower in key:
            result = {"alternatives": alternatives}
            _ai_cache[product_lower] = result
            logger.info(f"Exact fallback match for '{product_name}' -> '{key}'")
            return result
    
    # ─── Level 3: Category/Keyword Fallback ──────────────────────
    for keyword, alternatives in CATEGORY_FALLBACKS.items():
        if keyword in product_lower:
            result = {"alternatives": alternatives}
            _ai_cache[product_lower] = result
            logger.info(f"Category fallback match for '{product_name}' -> '{keyword}'")
            return result
    
    # ─── Level 4: Default Fallback (never empty) ─────────────────
    logger.info(f"Using default fallback for '{product_name}'")
    result = {"alternatives": DEFAULT_FALLBACK}
    _ai_cache[product_lower] = result
    return result


def get_groq_response(user_message):
    """Get a sustainability-focused response from Groq API for chatbot."""
    if not GROQ_API_KEY or "your_groq_api_key" in GROQ_API_KEY:
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }
    
    system_prompt = (
        "You are an AI Sustainability Expert helping users choose eco-friendly products. "
        "Give short, clear, practical answers. "
        "Recommend eco alternatives when possible. "
        "Explain environmental impact simply. "
        "Never give empty responses."
    )

    data = {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "model": "llama-3.3-70b-versatile",
        "stream": False,
        "temperature": 0.5
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=10)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        logger.error(f"Groq Chatbot Error: {e}")
        return None


def get_chatbot_response(user_message):
    """Get a sustainability-focused response from AI (Groq or Gemini) for the chatbot."""
    # 1. Try Groq first
    if GROQ_API_KEY and "your_groq_api_key" not in GROQ_API_KEY:
        reply = get_groq_response(user_message)
        if reply:
            return reply

    # 2. Try Gemini as fallback
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"You are an AI Sustainability Expert helping users choose eco-friendly products. Answer this: {user_message}"
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini Chatbot Error: {e}")

    # 3. Friendly fallback
    return ("I'm having a bit of trouble connecting right now. In the meantime, "
            "try looking for products with 'recycled', 'organic', or 'bamboo' labels — "
            "they're usually more sustainable choices! 🌱")


def analyze_product(description):
    """Analyze a product's sustainability. Uses Gemini with keyword fallback."""
    result = analyze_product_with_gemini(description)
    if not result:
        result = fallback_keyword_engine(description)
    return result
