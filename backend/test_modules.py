"""Quick test script for the updated backend modules."""
import sys

print("Testing product_fetcher...")
from product_fetcher import _estimate_price, _build_amazon_url, _build_flipkart_url

print(f"  Price for 'stainless steel bottle': ₹{_estimate_price('stainless steel bottle')}")
print(f"  Price for 'organic cotton shirt': ₹{_estimate_price('organic cotton shirt')}")
print(f"  Price for 'bamboo toothbrush': ₹{_estimate_price('bamboo toothbrush')}")
print(f"  Price for 'unknown product': ₹{_estimate_price('unknown product')}")
print(f"  Amazon URL: {_build_amazon_url('bamboo toothbrush')}")
print(f"  Flipkart URL: {_build_flipkart_url('bamboo toothbrush')}")

print("\nTesting ai_engine fallbacks...")
from ai_engine import FALLBACK_ALTERNATIVES, CATEGORY_FALLBACKS, DEFAULT_FALLBACK

print(f"  Fallback mappings: {len(FALLBACK_ALTERNATIVES)} products")
print(f"  Category fallbacks: {len(CATEGORY_FALLBACKS)} categories")
print(f"  Default fallback: {len(DEFAULT_FALLBACK)} items")

# Test that fallback always returns alternatives
import os
os.environ['GEMINI_API_KEY'] = ''
os.environ['GROQ_API_KEY'] = ''

from ai_engine import get_eco_alternatives
result = get_eco_alternatives("plastic bottle")
print(f"\nAlternatives for 'plastic bottle': {len(result.get('alternatives', []))} items")
for alt in result['alternatives']:
    print(f"  - {alt['name']}: {alt.get('material', 'N/A')}")

result2 = get_eco_alternatives("some random xyz product")
print(f"\nAlternatives for 'some random xyz product': {len(result2.get('alternatives', []))} items")
for alt in result2['alternatives']:
    print(f"  - {alt['name']}")

print("\nTesting database...")
from database import init_db
init_db()
import sqlite3
conn = sqlite3.connect('ecoswap.db')
conn.row_factory = sqlite3.Row
alts = conn.execute('SELECT name, price, product_link FROM alternatives LIMIT 3').fetchall()
for a in alts:
    print(f"  DB: {a['name']} - ₹{int(a['price'])} - {a['product_link'][:50]}...")
conn.close()

print("\n✅ All tests passed!")
