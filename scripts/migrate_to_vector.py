import requests
import json
import time

# --- CONFIGURATION (EDIT BEFORE RUNNING) ---
# Paste your credentials here temporarily or use environment variables
UPSTASH_VECTOR_REST_URL = "https://adapting-aardvark-73650-us1-vector.upstash.io"
UPSTASH_VECTOR_REST_TOKEN = "PASTE_YOUR_TOKEN_HERE"

# Get a Gemini API Key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE"

# Path to your existing local DB
SOURCE_FILE = "../knowledge/islamqa_db.json"
# -------------------------------------------

def get_embedding(text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
    payload = {
        "model": "models/text-embedding-004",
        "content": {"parts": [{"text": text}]}
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()["embedding"]["values"]
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def upsert_to_upstash(id, vector, metadata):
    url = f"{UPSTASH_VECTOR_REST_URL}/upsert"
    headers = {
        "Authorization": f"Bearer {UPSTASH_VECTOR_REST_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "id": id,
        "vector": vector,
        "metadata": metadata
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Error upserting to Upstash: {e}")
        return False

def migrate():
    print("🚀 Starting migration to Upstash Vector...")
    
    try:
        with open(SOURCE_FILE, 'r') as f:
            data = json.load(f)
            fatwas = data.get('fatwas', [])
            
        print(f"📚 Found {len(fatwas)} fatwas to migrate.")
        
        for i, fatwa in enumerate(fatwas):
            # Construct text for embedding (rich context)
            text_to_embed = f"Judul: {fatwa.get('title_id', '')}\nTanya: {fatwa.get('question_id', '')}\nJawab: {fatwa.get('answer_id', '')}"
            truncated_text = text_to_embed[:8000] # Safe limit for embedding model
            
            print(f"[{i+1}/{len(fatwas)}] Processing: {fatwa.get('id')} - {fatwa.get('title_id')[:30]}...")
            
            # 1. Generate Embedding
            vector = get_embedding(truncated_text)
            if not vector:
                print("   ⚠️ Skipping due to embedding failure.")
                continue
                
            # 2. Upload to Upstash
            success = upsert_to_upstash(
                id=str(fatwa.get('id')),
                vector=vector,
                metadata={
                    "title": fatwa.get('title_id'),
                    "text": truncated_text[:2000], # Store partial text for context retrieval
                    "url": fatwa.get('url'),
                    "category": fatwa.get('category')
                }
            )
            
            if success:
                print("   ✅ Uploaded.")
            else:
                print("   ❌ Failed to upload.")
                
            # Rate limiting handling (avoid hitting Gemini limits)
            time.sleep(1) 

        print("\n🎉 Migration Complete!")
        
    except FileNotFoundError:
        print(f"❌ Source file not found: {SOURCE_FILE}")
    except Exception as e:
        print(f"❌ Critical Error: {e}")

if __name__ == "__main__":
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("❌ Error: Please edit the script and add your GEMINI_API_KEY before running.")
    else:
        migrate()
