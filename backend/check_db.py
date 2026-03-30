import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
else:
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check tables
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
        tables = cursor.fetchall()
        print(f"Tables: {[t['table_name'] for t in tables]}")
        
        if 'alternatives' in [t['table_name'] for t in tables]:
            cursor.execute("SELECT * FROM alternatives LIMIT 20;")
            rows = cursor.fetchall()
            for row in rows:
                print(dict(row))
        else:
            print("Table 'alternatives' not found")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
