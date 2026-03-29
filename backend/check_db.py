import sqlite3
import os

DB_PATH = r"c:\Users\Admin\OneDrive\Desktop\ai\ecoswap\backend\ecoswap.db"

if not os.path.exists(DB_PATH):
    print(f"DB not found at {DB_PATH}")
    # Try alternate path
    DB_PATH = "ecoswap.db"

try:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tables: {[t['name'] for t in tables]}")
    
    if 'alternatives' in [t['name'] for t in tables]:
        cursor.execute("SELECT * FROM alternatives LIMIT 20;")
        rows = cursor.fetchall()
        for row in rows:
            print(dict(row))
    else:
        print("Table 'alternatives' not found")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
