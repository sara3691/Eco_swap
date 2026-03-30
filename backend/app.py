import os
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Local module imports
from ai_engine import analyze_product, get_chatbot_response, get_eco_alternatives
from image_fetch import fetch_product_image, fetch_eco_product_image
from product_fetcher import fetch_product_data, _build_amazon_url, _estimate_price
from database import init_db

# Load environment variables
load_dotenv()

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for the frontend origin
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize database on startup
try:
    init_db()
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")

def get_db_connection():
    from database import get_connection
    conn = get_connection()
    # No need for WAL pragma with Postgres
    return conn

def get_cursor(conn):
    return conn.cursor(cursor_factory=RealDictCursor)


def enrich_alternatives_with_product_data(ai_alternatives):
    """
    Takes raw AI alternative suggestions and enriches them with real product data:
    - Real price in ₹ from SerpAPI Google Shopping
    - Product thumbnail image
    - Working buy link to e-commerce site
    """
    enriched = []
    seen_images = set()
    
    for idx, alt in enumerate(ai_alternatives[:3]):  # Limit to 3
        name = alt.get("name", "Eco Alternative")
        reason = alt.get("reason", "Sustainable and eco-friendly")
        material = alt.get("material", reason)
        
        # Fetch real product data from SerpAPI Shopping
        product_data = fetch_product_data(name)
        
        # Get image - prefer SerpAPI shopping thumbnail, then dedicated eco image fetch
        image_url = product_data.get("thumbnail", "")
        if not image_url or image_url in seen_images:
            image_url = fetch_eco_product_image(name)
        
        # Avoid duplicate images
        if image_url in seen_images:
            image_url = fetch_product_image(f"{name} eco friendly", eco_themed=True)
        seen_images.add(image_url)
        
        # Get buy link - prefer SerpAPI product link, fallback to Amazon.in search
        product_link = product_data.get("product_link", "")
        if not product_link or product_link == "#":
            product_link = _build_amazon_url(name)
        
        # Get price in ₹
        price = product_data.get("price", _estimate_price(name))
        price_display = product_data.get("price_display", f"₹{int(price)}")
        
        enriched.append({
            "id": f"eco-{idx}",
            "name": name,
            "material": material,
            "reason": reason,
            "sustainability_score": 88 + (idx * 3),
            "price": price,
            "price_display": price_display,
            "currency": "INR",
            "image_url": image_url,
            "product_link": product_link,
            "source": product_data.get("source", "Amazon.in"),
            "rating": product_data.get("rating"),
            "reviews": product_data.get("reviews"),
        })
    
    return enriched


def internal_get_recommendations(product_name, category):
    """
    3-level alternative recommendation system.
    Level 1: AI (Gemini/Groq) + product enrichment
    Level 2: Local eco database
    Level 3: Smart fallback (NEVER empty)
    """
    product_name = product_name.lower() if product_name else ""
    category = category.lower() if category else ""
    
    try:
        # ─── Level 1: AI Recommendations (Primary) ─────────────────
        ai_results = None
        retries = 1
        for i in range(retries + 1):
            try:
                ai_response = get_eco_alternatives(product_name)
                ai_alts = ai_response.get("alternatives", [])
                if ai_alts:
                    ai_results = ai_alts
                    break
            except Exception as e:
                logger.error(f"AI Attempt {i+1} failed: {e}")
                if i == retries:
                    break
        
        if ai_results:
            # Enrich with real product data (price, image, buy link)
            enriched = enrich_alternatives_with_product_data(ai_results)
            if enriched:
                return {"alternatives": enriched, "source": "ai_powered"}
        
        # ─── Level 2: Local Database ────────────────────────────────
        conn = get_db_connection()
        cursor = get_cursor(conn)
        results = []
        
        if product_name and len(product_name) > 2:
            cursor.execute(
                'SELECT * FROM alternatives WHERE LOWER(name) LIKE %s',
                (f'%{product_name}%',)
            )
            results = cursor.fetchall()
        
        if not results and category and category != 'general':
            cursor.execute(
                'SELECT * FROM alternatives WHERE LOWER(category) = %s LIMIT 3',
                (category,)
            )
            results = cursor.fetchall()
        
        if not results and product_name:
            words = product_name.split()
            for word in words:
                if len(word) > 3:
                    cursor.execute(
                        'SELECT * FROM alternatives WHERE LOWER(name) LIKE %s OR LOWER(material) LIKE %s',
                        (f'%{word}%', f'%{word}%')
                    )
                    results = cursor.fetchall()
                    if results:
                        break
        
        if results:
            db_items = []
            for row in results[:3]:
                item = dict(row)
                # Ensure price is in ₹ format
                price = item.get('price', 499)
                item['price_display'] = f"₹{int(price)}"
                item['currency'] = 'INR'
                # Ensure buy link works
                if not item.get('product_link') or item['product_link'] == '#' or 'example.com' in item.get('product_link', ''):
                    item['product_link'] = _build_amazon_url(item.get('name', ''))
                db_items.append(item)
            conn.close()
            return {"alternatives": db_items, "source": "local_db"}
        
        conn.close()
        
        # ─── Level 3: Fallback (NEVER empty) ────────────────────────
        # Try AI one more time with a broader search
        fallback_response = get_eco_alternatives(product_name or "eco friendly product")
        fallback_alts = fallback_response.get("alternatives", [])
        if fallback_alts:
            enriched = enrich_alternatives_with_product_data(fallback_alts)
            return {
                "alternatives": enriched,
                "source": "smart_fallback",
                "message": "🌱 Showing recommended eco swaps while AI learns."
            }
        
        # Ultimate fallback
        return {
            "alternatives": enrich_alternatives_with_product_data([
                {"name": "Bamboo Eco Product", "reason": "Renewable and biodegradable", "material": "Bamboo"},
                {"name": "Recycled Material Alternative", "reason": "Made from post-consumer recycled materials", "material": "Recycled Materials"},
                {"name": "Plant-Based Sustainable Option", "reason": "Derived from renewable plant sources", "material": "Plant-Based"},
            ]),
            "source": "default_fallback",
            "message": "🌱 Showing recommended eco swaps while AI learns."
        }
        
    except Exception as e:
        logger.error(f"Internal Recommendation Error: {e}")
        # Even on error, return something useful
        return {
            "alternatives": enrich_alternatives_with_product_data([
                {"name": "Bamboo Eco Product", "reason": "Renewable and biodegradable", "material": "Bamboo"},
                {"name": "Stainless Steel Alternative", "reason": "Durable and reusable for years", "material": "Stainless Steel"},
                {"name": "Organic Cotton Product", "reason": "No harmful pesticides used", "material": "Organic Cotton"},
            ]),
            "source": "error_fallback",
            "message": "🌱 Showing recommended eco swaps while AI learns."
        }


# ──────────────────────────────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────────────────────────────

@app.route('/signup', methods=['POST'])
def signup():
    """Register a new user with username, email, and password."""
    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    name = data.get('name', username).strip()

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE email = %s OR username = %s', (email, username))
        existing = cursor.fetchone()
        if existing:
            return jsonify({"error": "Username or Email already exists"}), 400

        hashed_password = generate_password_hash(password)
        with conn:
            with get_cursor(conn) as cur:
                cur.execute(
                    'INSERT INTO users (username, email, password_hash, name) VALUES (%s, %s, %s, %s) RETURNING id',
                    (username, email, hashed_password, name)
                )
                user_record = cur.fetchone()
                user_id = user_record['id'] if user_record else None
                
                # Initialize gamification and eco_scores
                cur.execute(
                    'INSERT INTO gamification (user_id, points, badge_name, badge_icon, eco_level, eco_swaps_count, eco_streak) VALUES (%s, 0, %s, %s, 1, 0, 0) ON CONFLICT (user_id) DO NOTHING',
                    (user_id, "Seed", "🌱")
                )
                cur.execute(
                    'INSERT INTO eco_scores (user_id, eco_transformation_score, total_searches, eco_searches) VALUES (%s, 0.0, 0, 0) ON CONFLICT (user_id) DO NOTHING',
                    (user_id,)
                )

        return jsonify({"message": "User created successfully", "user_id": user_id}), 201
    except Exception as e:
        logger.error(f"Signup Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/login', methods=['POST'])
def login():
    """Login with email and password, and track login activity."""
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({"error": "Invalid email or password"}), 401

        user_id = user['id']
        
        # Track login history
        with conn:
            with get_cursor(conn) as cur:
                cur.execute(
                    'INSERT INTO login_history (user_id, login_time) VALUES (%s, CURRENT_TIMESTAMP) RETURNING id',
                    (user_id,)
                )
                session_id = cur.fetchone()['id']

        cursor.execute('SELECT * FROM gamification WHERE user_id = %s', (user_id,))
        gam = cursor.fetchone()
        gam = dict(gam) if gam else {}
        
        cursor.execute('SELECT * FROM eco_scores WHERE user_id = %s', (user_id,))
        eco = cursor.fetchone()
        eco_score = eco['eco_transformation_score'] if eco else 0

        return jsonify({
            "user": {
                "id": user_id,
                "name": user['name'],
                "email": user['email'],
                "username": user['username'],
                "session_id": session_id
            },
            "stats": {
                "points": gam.get('points', 0),
                "badge_name": gam.get('badge_name', 'Seed'),
                "badge_icon": gam.get('badge_icon', '🌱'),
                "eco_level": gam.get('eco_level', 1),
                "eco_swaps_count": gam.get('eco_swaps_count', 0),
                "eco_streak": gam.get('eco_streak', 0),
                "eco_transformation_score": eco_score
            }
        })
    except Exception as e:
        logger.error(f"Login Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/logout', methods=['POST'])
def logout():
    """Track logout and session duration."""
    data = request.json
    session_id = data.get('session_id')
    
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute('SELECT login_time FROM login_history WHERE id = %s', (session_id,))
        login_record = cursor.fetchone()
        
        if login_record:
            login_time = login_record['login_time']
            logout_time = datetime.now()
            duration = int((logout_time - login_time).total_seconds())
            
            with conn:
                with get_cursor(conn) as cur:
                    cur.execute(
                        'UPDATE login_history SET logout_time = %s, session_duration = %s WHERE id = %s',
                        (logout_time, duration, session_id)
                    )
        
        return jsonify({"message": "Logged out successfully"})
    except Exception as e:
        logger.error(f"Logout Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Fetch user profile and gamification stats."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        cursor.execute('SELECT * FROM gamification WHERE user_id = %s', (user_id,))
        gam = cursor.fetchone()

        user = dict(user)
        gam = dict(gam) if gam else {"points": 0, "badge_name": "Seed", "badge_icon": "🌱", "eco_level": 1, "eco_swaps_count": 0, "eco_streak": 0}

        return jsonify({
            "user": {
                "id": user['id'],
                "name": user.get('name') or user.get('username'),
                "email": user.get('email'),
            },
            "stats": gam
        })
    except Exception as e:
        logger.error(f"Get User Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze a product for sustainability. Returns analysis + category."""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.json
    product_name = data.get('product_name') or data.get('product')
    if not product_name:
        return jsonify({"error": "product_name is required"}), 400

    logger.info(f"Analyzing product: {product_name}")

    try:
        analysis = analyze_product(product_name)
        image_url = fetch_product_image(product_name, eco_themed=False)
        
        analysis.update({
            "image_url": image_url,
            "product_name": product_name
        })
        
        return jsonify({
            "analysis": analysis,
            "category": analysis.get("category", "General").lower()
        })
    except Exception as e:
        logger.error(f"Analysis Error: {e}")
        return jsonify({"error": "Internal AI Processing Error"}), 500


@app.route('/analyze-product', methods=['POST'])
def analyze_product_endpoint():
    """
    New unified endpoint per spec.
    POST /analyze-product
    Payload: { "product": "plastic bottle" }
    Returns: analysis + eco alternatives with real prices, images, and buy links.
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    data = request.json
    product_name = data.get('product') or data.get('product_name')
    if not product_name:
        return jsonify({"error": "product is required"}), 400
    
    logger.info(f"Full analyze-product for: {product_name}")
    
    try:
        # 1. Sustainability analysis
        analysis = analyze_product(product_name)
        image_url = fetch_product_image(product_name, eco_themed=False)
        analysis.update({
            "image_url": image_url,
            "product_name": product_name
        })
        
        # 2. Get eco alternatives with product data
        category = analysis.get("category", "General").lower()
        recommendations = internal_get_recommendations(product_name, category)
        
        # 3. Track search history and update eco score if user_id is provided
        user_id = data.get('user_id')
        if user_id:
            conn = get_db_connection()
            cursor = get_cursor(conn)
            alts = recommendations.get("alternatives", [])
            suggested = alts[0]['name'] if alts else "None"
            
            # Check if current search is eco-friendly
            is_eco = analysis.get('sustainability_score', 0) > 80
            
            with conn:
                with get_cursor(conn) as cur:
                    cur.execute(
                        'INSERT INTO search_history (user_id, search_query, eco_alternative_suggested) VALUES (%s, %s, %s)',
                        (user_id, product_name, suggested)
                    )
                    
                    # Update Eco Score
                    cur.execute('SELECT * FROM eco_scores WHERE user_id = %s', (user_id,))
                    eco_stats = cur.fetchone()
                    if not eco_stats:
                        total = 1
                        eco_count = 1 if is_eco else 0
                        score = (eco_count / total) * 100
                        cur.execute(
                            'INSERT INTO eco_scores (user_id, total_searches, eco_searches, eco_transformation_score) VALUES (%s, %s, %s, %s)',
                            (user_id, total, eco_count, score)
                        )
                    else:
                        total = eco_stats['total_searches'] + 1
                        eco_count = eco_stats['eco_searches'] + (1 if is_eco else 0)
                        score = (eco_count / total) * 100
                        cur.execute(
                            'UPDATE eco_scores SET total_searches = %s, eco_searches = %s, eco_transformation_score = %s, last_updated = CURRENT_TIMESTAMP WHERE user_id = %s',
                            (total, eco_count, score, user_id)
                        )
            conn.close()

        return jsonify({
            "analysis": analysis,
            "category": category,
            "alternatives": recommendations.get("alternatives", []),
            "alternatives_source": recommendations.get("source", "unknown")
        })
    except Exception as e:
        logger.error(f"Analyze-Product Error: {e}")
        return jsonify({"error": "Internal processing error"}), 500


@app.route('/alternatives', methods=['GET'])
def alternatives():
    """Get eco alternatives for a product. Used by the frontend Alternatives component."""
    category = request.args.get('category', '').lower()
    product_name = request.args.get('product', '').lower()
    recommendations = internal_get_recommendations(product_name, category)
    return jsonify(recommendations)


@app.route('/chatbot', methods=['POST'])
def chatbot():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.json
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({"error": "message is required"}), 400

    logger.info(f"Chatbot question: {user_message}")

    try:
        reply = get_chatbot_response(user_message)
        return jsonify({"reply": reply})
    except Exception as e:
        logger.error(f"Chatbot Error: {e}")
        return jsonify({"reply": "I'm experiencing some technical difficulties. Please try again later."}), 500


@app.route('/alternatives/<category>', methods=['GET'])
def get_alternatives_legacy(category):
    """Legacy endpoint for backward compatibility."""
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute(
            '''SELECT * FROM alternatives 
               WHERE (category LIKE %s OR name LIKE %s) 
               AND sustainability_score >= 70
               ORDER BY sustainability_score DESC''', 
            (f'%{category}%', f'%{category}%')
        )
        alternatives_list = cursor.fetchall()
        
        if not alternatives_list:
            cursor.execute(
                'SELECT * FROM alternatives WHERE sustainability_score >= 85 ORDER BY sustainability_score DESC LIMIT 3'
            )
            alternatives_list = cursor.fetchall()
            
        conn.close()
        
        items = []
        for row in alternatives_list:
            item = dict(row)
            price = item.get('price', 499)
            item['price_display'] = f"₹{int(price)}"
            item['currency'] = 'INR'
            if not item.get('product_link') or 'example.com' in item.get('product_link', ''):
                item['product_link'] = _build_amazon_url(item.get('name', ''))
            items.append(item)
        
        return jsonify({"alternatives": items})
    except Exception as e:
        logger.error(f"DB Error: {e}")
        return jsonify({"alternatives": []}), 200


@app.route('/ai/recommend', methods=['POST'])
def ai_recommend():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.json
    product_name = data.get('product_name')
    category = data.get('category', 'General')
    
    if not product_name:
        return jsonify({"error": "product_name is required"}), 400

    try:
        recommendations = internal_get_recommendations(product_name, category)
        return jsonify(recommendations)
    except Exception as e:
        logger.error(f"Recommendation Error: {e}")
        return jsonify({"error": "Failed to generate recommendations"}), 500


@app.route('/suggest', methods=['POST'])
def suggest_alternative():
    data = request.json
    product_name = data.get('product_name')
    suggested_name = data.get('suggested_name')
    suggested_link = data.get('suggested_link', '')

    if not product_name or not suggested_name:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = get_db_connection()
        with conn:
            with get_cursor(conn) as cur:
                cur.execute(
                    'INSERT INTO eco_suggestions (product_name, suggested_name, suggested_link) VALUES (%s, %s, %s)',
                    (product_name, suggested_name, suggested_link)
                )
        conn.close()
        return jsonify({"message": "Suggestion saved successfully!"})
    except Exception as e:
        logger.error(f"Suggestion Error: {e}")
        return jsonify({"error": "Failed to save suggestion"}), 500


@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute('''
            SELECT u.username, g.points, g.badge_name as badge, g.badge_icon, g.eco_swaps_count, g.eco_level, g.eco_streak
            FROM users u
            JOIN gamification g ON u.id = g.user_id
            ORDER BY g.points DESC
            LIMIT 10
        ''')
        leaderboard = cursor.fetchall()
        conn.close()
        return jsonify([dict(row) for row in leaderboard])
    except Exception as e:
        logger.error(f"Leaderboard Error: {e}")
        return jsonify([]), 200


BADGE_LEVELS = [
    {"level": 1, "name": "Seed", "icon": "🌱", "min_points": 0},
    {"level": 2, "name": "Sprout", "icon": "🍃", "min_points": 50},
    {"level": 3, "name": "Plant", "icon": "🌿", "min_points": 100},
    {"level": 4, "name": "Flower", "icon": "🌻", "min_points": 300},
    {"level": 5, "name": "Fruit", "icon": "🍓", "min_points": 700},
    {"level": 6, "name": "Tree", "icon": "🌳", "min_points": 1200},
    {"level": 7, "name": "Forest", "icon": "⛰️", "min_points": 2000},
    {"level": 8, "name": "Jungle", "icon": "🏞", "min_points": 3500},
    {"level": 9, "name": "Green World", "icon": "🌎", "min_points": 5000},
]

def calculate_badge(points):
    for level in reversed(BADGE_LEVELS):
        if points >= level["min_points"]:
            return level
    return BADGE_LEVELS[0]


@app.route('/user/gamification', methods=['GET'])
def get_user_gamification():
    user_id = request.args.get('user_id', 1)
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute('SELECT * FROM gamification WHERE user_id = %s', (user_id,))
        user_stats = cursor.fetchone()
        conn.close()
        
        if user_stats:
            stats = dict(user_stats)
            badge = calculate_badge(stats['points'])
            return jsonify({
                "points": stats['points'],
                "badge_name": badge['name'],
                "badge_icon": badge['icon'],
                "level": badge['level']
            })
        else:
            return jsonify({
                "points": 0,
                "badge_name": "Seed",
                "badge_icon": "🌱",
                "level": 1
            })
    except Exception as e:
        logger.error(f"User Gamification Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/community/stats', methods=['GET'])
def get_community_stats():
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute('''
            SELECT 
                COUNT(*) as total_swaps,
                SUM(co2_saved) as total_co2,
                SUM(plastic_saved) as total_plastic,
                SUM(water_saved) as total_water
            FROM eco_impact_logs
        ''')
        stats = cursor.fetchone()
        conn.close()
        
        return jsonify({
            "total_swaps": stats['total_swaps'] or 0,
            "total_co2": round(stats['total_co2'] or 0, 1),
            "total_plastic_kg": round((stats['total_plastic'] or 0) / 1000, 1),
            "total_water_liters": int(stats['total_water'] or 0)
        })
    except Exception as e:
        logger.error(f"Community Stats Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/community/feed', methods=['GET'])
def get_community_feed():
    conn = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute('''
            SELECT l.*, g.badge_icon, u.username
            FROM eco_impact_logs l
            JOIN users u ON l.user_id = u.id
            JOIN gamification g ON l.user_id = g.user_id
            ORDER BY l.timestamp DESC
            LIMIT 20
        ''')
        feed = cursor.fetchall()
        return jsonify([dict(row) for row in feed])
    except Exception as e:
        logger.error(f"Community Feed Error: {e}")
        return jsonify([]), 500
    finally:
        if conn:
            conn.close()


@app.route('/gamification/update', methods=['POST'])
def update_gamification_v2():
    from datetime import datetime, timedelta
    data = request.json or {}
    user_id = data.get('user_id', 1) 
    action_type = data.get('action_type', 'swap')
    
    points_to_add = 10 if action_type == 'analysis' else 0
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        cursor.execute('SELECT * FROM gamification WHERE user_id = %s', (user_id,))
        user_stats = cursor.fetchone()
        
        now = datetime.now()
        level_upgraded = False
        streak_updated = False
        is_first_swap = False
        
        if not user_stats:
            is_first_swap = True
            new_points = points_to_add
            new_swaps = 1 if action_type == 'swap' else 0
            new_streak = 1
            badge = calculate_badge(new_points)
            
            with conn:
                with get_cursor(conn) as cur:
                    cur.execute('''
                        INSERT INTO gamification (user_id, points, eco_swaps_count, badge_name, badge_icon, eco_level, eco_streak, last_action_timestamp)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ''', (user_id, new_points, new_swaps, badge['name'], badge['icon'], badge['level'], new_streak, now))
        else:
            user_stats = dict(user_stats)
            old_points = user_stats['points']
            old_swaps = user_stats['eco_swaps_count']
            old_level = user_stats['eco_level']
            old_streak = user_stats['eco_streak']
            last_action_str = user_stats.get('last_action_timestamp')
            
            new_points = old_points + points_to_add
            new_swaps = old_swaps + (1 if action_type == 'swap' else 0)
            
            new_streak = old_streak
            if last_action_str:
                last_action = last_action_str # In postgres/psycopg2 this is usually a datetime object
                if isinstance(last_action, str):
                    last_action = datetime.fromisoformat(last_action.replace(' ', 'T'))
                
                diff = now - last_action
                if diff < timedelta(hours=24):
                    pass
                elif diff < timedelta(hours=48):
                    new_streak += 1
                    streak_updated = True
                else:
                    new_streak = 1
                    streak_updated = True
            else:
                new_streak = 1
                streak_updated = True
            
            badge = calculate_badge(new_points)
            new_level = badge['level']
            
            if new_level > old_level:
                level_upgraded = True
            
            with conn:
                with get_cursor(conn) as cur:
                    cur.execute('''
                        UPDATE gamification 
                        SET points = %s, eco_swaps_count = %s, badge_name = %s, badge_icon = %s, eco_level = %s, eco_streak = %s, last_action_timestamp = %s
                        WHERE user_id = %s
                    ''', (new_points, new_swaps, badge['name'], badge['icon'], new_level, new_streak, now, user_id))
                
                if action_type == 'swap':
                    product_name = data.get('product_name', 'Unknown Product')
                    alt_name = data.get('alternative_name', 'Eco Alternative')
                    co2 = round(0.5 + (new_swaps * 0.1), 1)
                    plastic = round(20.0 + (new_swaps * 2.0), 1)
                    water = round(5.0 + (new_swaps * 1.5), 1)
                    
                    with get_cursor(conn) as cur2:
                        cur2.execute('''
                            INSERT INTO eco_impact_logs (user_id, action_type, product_name, alternative_name, co2_saved, plastic_saved, water_saved)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ''', (user_id, 'swap', product_name, alt_name, co2, plastic, water))

            current_level = old_level

        cursor.execute('SELECT * FROM gamification WHERE user_id = %s', (user_id,))
        updated_stats = cursor.fetchone()
        
        return jsonify({
            "status": "success",
            "points_added": points_to_add,
            "is_first_swap": is_first_swap,
            "level_upgraded": level_upgraded,
            "streak_updated": streak_updated,
            "celebration_message": f"Congratulations! You've evolved to {badge['name']}!" if level_upgraded else None,
            "stats": dict(updated_stats)
        })
    except Exception as e:
        logger.error(f"Gamification Update Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/gamify', methods=['POST'])
def update_gamification():
    return update_gamification_v2()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200


@app.route('/user/dashboard/<int:user_id>', methods=['GET'])
def get_user_dashboard(user_id):
    """Fetch all data for the user dashboard."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        
        # 1. User info & gamification
        cursor.execute('SELECT name, username, email FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        cursor.execute('SELECT * FROM gamification WHERE user_id = %s', (user_id,))
        gam = cursor.fetchone()
        cursor.execute('SELECT * FROM eco_scores WHERE user_id = %s', (user_id,))
        eco = cursor.fetchone()
        
        # 2. Recent searches
        cursor.execute('''
            SELECT search_query, eco_alternative_suggested, timestamp 
            FROM search_history 
            WHERE user_id = %s 
            ORDER BY timestamp DESC LIMIT 5
        ''', (user_id,))
        searches = cursor.fetchall()
        
        # 3. Login history
        cursor.execute('''
            SELECT login_time, logout_time, session_duration 
            FROM login_history 
            WHERE user_id = %s 
            ORDER BY login_time DESC LIMIT 5
        ''', (user_id,))
        logins = cursor.fetchall()
        
        # 4. Impact highlights
        cursor.execute('SELECT SUM(co2_saved) as co2, SUM(plastic_saved) as plastic, SUM(water_saved) as water FROM eco_impact_logs WHERE user_id = %s', (user_id,))
        impact_logs = cursor.fetchone()

        return jsonify({
            "user": dict(user),
            "stats": {
                "points": gam['points'] if gam else 0,
                "badge_name": gam['badge_name'] if gam else "Seed",
                "badge_icon": gam['badge_icon'] if gam else "🌱",
                "eco_level": gam['eco_level'] if gam else 1,
                "eco_swaps_count": gam['eco_swaps_count'] if gam else 0,
                "eco_transformation_score": eco['eco_transformation_score'] if eco else 0,
                "total_searches": eco['total_searches'] if eco else 0,
                "eco_searches": eco['eco_searches'] if eco else 0
            },
            "recent_searches": [dict(s) for s in searches],
            "login_history": [dict(l) for l in logins],
            "impact": {
                "co2_saved": round(impact_logs['co2'] or 0, 2),
                "plastic_saved": round(impact_logs['plastic'] or 0, 2),
                "water_saved": round(impact_logs['water'] or 0, 2)
            }
        })
    except Exception as e:
        logger.error(f"Dashboard Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/history/<int:user_id>', methods=['GET'])
def get_user_history(user_id):
    """Fetch all complete search history and login history for a user."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)
        # Fetch Search History
        cursor.execute('''
            SELECT id, search_query, eco_alternative_suggested, timestamp 
            FROM search_history 
            WHERE user_id = %s 
            ORDER BY timestamp DESC
        ''', (user_id,))
        searches = cursor.fetchall()
        
        # Fetch Login History
        cursor.execute('''
            SELECT id, login_time, logout_time, session_duration 
            FROM login_history 
            WHERE user_id = %s 
            ORDER BY login_time DESC
        ''', (user_id,))
        logins = cursor.fetchall()
        
        return jsonify({
            "search_history": [dict(s) for s in searches],
            "login_history": [dict(l) for l in logins]
        }), 200
    except Exception as e:
        logger.error(f"History Fetch Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/history/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    """Delete a specific search history entry."""
    conn = None
    try:
        conn = get_db_connection()
        with conn:
            with get_cursor(conn) as cur:
                cur.execute('DELETE FROM search_history WHERE id = %s', (history_id,))
        return jsonify({"message": "History deleted"}), 200
    except Exception as e:
        logger.error(f"History Delete Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
