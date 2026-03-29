import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "ecoswap.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table — complete login: username, email, password_hash
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    # Migration: add columns if they don't exist
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN name TEXT")
    except Exception:
        pass

    # Login history tracking
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS login_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP,
        session_duration INTEGER, -- in seconds
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Search history tracking
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        search_query TEXT NOT NULL,
        eco_alternative_suggested TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Eco behaviour analysis scores
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS eco_scores (
        user_id INTEGER PRIMARY KEY,
        eco_transformation_score REAL DEFAULT 0,
        total_searches INTEGER DEFAULT 0,
        eco_searches INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Alternatives table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alternatives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        material TEXT,
        sustainability_score INTEGER,
        carbon_estimate REAL,
        price REAL,
        image_url TEXT,
        product_link TEXT
    )
    ''')
    
    # Reviews table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_name TEXT NOT NULL,
        rating INTEGER,
        comment TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Gamification table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS gamification (
        user_id INTEGER PRIMARY KEY,
        points INTEGER DEFAULT 0,
        badge_name TEXT DEFAULT 'Seed',
        badge_icon TEXT DEFAULT '🌱',
        eco_level INTEGER DEFAULT 1,
        eco_swaps_count INTEGER DEFAULT 0,
        eco_streak INTEGER DEFAULT 0,
        last_action_timestamp TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Eco impact logs table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS eco_impact_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action_type TEXT,
        product_name TEXT,
        alternative_name TEXT,
        co2_saved REAL,
        plastic_saved REAL,
        water_saved REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Seed some alternatives with real e-commerce links
    cursor.execute("SELECT COUNT(*) FROM alternatives")
    if cursor.fetchone()[0] == 0:
        alternatives = [
            ('Bottle', 'Stainless Steel Bottle', 'Stainless Steel', 99, 0.5, 549.0, 'https://images.unsplash.com/photo-1523362628242-f513a30ef2bc', 'https://www.amazon.in/s?k=stainless+steel+water+bottle+eco+friendly'),
            ('Bottle', 'Glass Bottle', 'Borosilicate Glass', 95, 0.8, 399.0, 'https://images.unsplash.com/photo-1602143307185-83dc7955375d', 'https://www.amazon.in/s?k=glass+water+bottle+eco+friendly'),
            ('Bottle', 'Bamboo Bottle', 'Bamboo & Glass', 92, 0.4, 699.0, 'https://images.unsplash.com/photo-1610839563044-89969d6ec31c', 'https://www.amazon.in/s?k=bamboo+water+bottle'),
            ('Bag', 'Cloth Bag', 'Organic Cotton', 98, 0.2, 199.0, 'https://images.unsplash.com/photo-1544816153-12ad5d713281', 'https://www.amazon.in/s?k=organic+cotton+cloth+bag'),
            ('Bag', 'Jute Bag', 'Natural Jute Fiber', 97, 0.3, 249.0, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b', 'https://www.amazon.in/s?k=jute+shopping+bag'),
            ('Cup', 'Steel Cup', 'Stainless Steel', 99, 0.4, 299.0, 'https://images.unsplash.com/photo-1577937927133-66ef066c482c', 'https://www.amazon.in/s?k=stainless+steel+cup+eco'),
            ('Cup', 'Bamboo Cup', 'Bamboo Fiber', 94, 0.3, 349.0, 'https://images.unsplash.com/photo-1588693951525-63806e5797d8', 'https://www.amazon.in/s?k=bamboo+cup+eco+friendly'),
            ('Clothing', 'Organic Cotton Oversized Tee', '100% GOTS Organic Cotton', 98, 2.1, 899.0, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'https://www.amazon.in/s?k=organic+cotton+t-shirt'),
            ('Clothing', 'Recycled Wool Cardigan', '70% Recycled Wool, 30% Tencel', 92, 5.4, 2499.0, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b', 'https://www.amazon.in/s?k=recycled+wool+cardigan'),
            ('Home', 'Bamboo Bath Set', 'Sustainable Moso Bamboo', 95, 0.8, 799.0, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04', 'https://www.amazon.in/s?k=bamboo+bath+set+eco'),
            ('Electronics', 'Modular Fairphone 4', 'Recycled Plastics & Gold', 88, 38.0, 45999.0, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'https://www.amazon.in/s?k=fairphone'),
            ('Home', 'Recycled Glass Carafe', '100% Post-consumer Glass', 99, 1.2, 599.0, 'https://images.unsplash.com/photo-1590001155093-a3c048bc8f6d', 'https://www.amazon.in/s?k=recycled+glass+carafe'),
            ('Clothing', 'Hemp Work Shirt', '100% Industrial Hemp', 96, 3.2, 1299.0, 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8', 'https://www.amazon.in/s?k=hemp+shirt+eco+friendly')
        ]
        cursor.executemany('''
        INSERT INTO alternatives (category, name, material, sustainability_score, carbon_estimate, price, image_url, product_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', alternatives)

    # Seed mock users and gamification
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        mock_users = [
            (1, 'EcoWarrior_99', 'warrior@eco.com', 'EcoWarrior 99'),
            (2, 'GreenLife_Alice', 'alice@green.com', 'Green Alice'),
            (3, 'NatureLover_Bob', 'bob@nature.com', 'Nature Bob')
        ]
        cursor.executemany("INSERT OR IGNORE INTO users (id, username, email, name) VALUES (?, ?, ?, ?)", mock_users)
        
        mock_stats = [
            (1, 2850, 'Forest', '⛰️', 7, 142, 5),
            (2, 1920, 'Tree', '🌳', 6, 96, 3),
            (3, 850, 'Fruiting Plant', '🍓', 5, 42, 1)
        ]
        cursor.executemany("INSERT INTO gamification (user_id, points, badge_name, badge_icon, eco_level, eco_swaps_count, eco_streak) VALUES (?, ?, ?, ?, ?, ?, ?)", mock_stats)

        # Seed initial impact logs
        mock_logs = [
            (1, 'swap', 'Plastic Toothbrush', 'Bamboo Toothbrush', 0.5, 20.0, 5.0),
            (2, 'swap', 'Plastic Water Bottle', 'Steel Bottle', 1.2, 50.0, 10.0),
            (3, 'swap', 'Fast Fashion Tee', 'Organic Cotton Tee', 5.5, 0.0, 2700.0),
            (1, 'swap', 'Liquid Soap', 'Bar Soap', 0.3, 40.0, 2.0),
            (2, 'swap', 'Paper Towels', 'Microfiber Cloth', 1.0, 0.0, 50.0)
        ]
        cursor.executemany("INSERT INTO eco_impact_logs (user_id, action_type, product_name, alternative_name, co2_saved, plastic_saved, water_saved) VALUES (?, ?, ?, ?, ?, ?, ?)", mock_logs)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
