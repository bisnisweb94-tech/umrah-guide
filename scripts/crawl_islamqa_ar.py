import requests
from bs4 import BeautifulSoup
import time
import base64
import json

# --- CONFIGURATION ---
UPSTASH_VECTOR_REST_URL = "https://adapting-aardvark-73650-us1-vector.upstash.io"
UPSTASH_VECTOR_REST_TOKEN = "PASTE_YOUR_UPSTASH_TOKEN"
GEMINI_API_KEY = "PASTE_YOUR_GEMINI_KEY"
BASE_URL = "https://islamqa.info/ar"
# ---------------------

def get_embedding(text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
    payload = {
        "model": "models/text-embedding-004",
        "content": {"parts": [{"text": text}]}
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.json()["embedding"]["values"]
    except:
        return None

def upsert_to_upstash(url, text, title):
    vector = get_embedding(text[:8000])
    if not vector: return False
    
    headers = {"Authorization": f"Bearer {UPSTASH_VECTOR_REST_TOKEN}"}
    payload = {
        "id": base64.b64encode(url.encode()).decode(),
        "vector": vector,
        "metadata": {"url": url, "text": text[:2000], "title": title, "lang": "ar"}
    }
    res = requests.post(f"{UPSTASH_VECTOR_REST_URL}/upsert", json=payload, headers=headers)
    return res.status_code == 200

def scrape_fatwa(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Specific selectors for IslamQA
        title = soup.find('h1').text.strip() if soup.find('h1') else ""
        question = soup.find('section', class_='single_fatwa__question').text.strip() if soup.find('section', class_='single_fatwa__question') else ""
        answer = soup.find('section', class_='single_fatwa__answer').text.strip() if soup.find('section', class_='single_fatwa__answer') else ""
        
        full_content = f"Title: {title}\nQuestion: {question}\nAnswer: {answer}"
        return title, full_content
    except:
        return None, None

def crawl_category(category_path, limit=100):
    """
    Crawls a specific category and ingests fatwas.
    Example category_path: "/categories/topics/1/Aqeedah"
    """
    print(f"🚀 Crawling {BASE_URL}{category_path}...")
    # This is a simplified crawler. For 10k fatwas, you'd iterate through pagination.
    # We will just show the logic for a few pages.
    
    count = 0
    for page in range(1, 10): # Example: first 10 pages
        if count >= limit: break
        
        list_url = f"{BASE_URL}{category_path}?page={page}"
        res = requests.get(list_url)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        links = soup.find_all('a', href=True)
        fatwa_links = [l['href'] for l in links if '/answers/' in l['href']]
        
        for link in set(fatwa_links):
            if count >= limit: break
            full_link = link if link.startswith('http') else f"https://islamqa.info{link}"
            
            print(f"[{count+1}] Ingesting: {full_link}")
            title, content = scrape_fatwa(full_link)
            if content:
                if upsert_to_upstash(full_link, content, title):
                    print(f"   ✅ Saved.")
                    count += 1
                else:
                    print(f"   ❌ Failed.")
            
            time.sleep(1) # Respectful delay

if __name__ == "__main__":
    # Daftar kategori utama dari IslamQA Arabic
    CATEGORIES = [
        {"name": "Aqeedah", "path": "/ar/categories/topics/1/%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9"},
        {"name": "Hajj & Umrah", "path": "/ar/categories/topics/149/%D8%A7%D9%84%D8%AD%D8%AC-%D9%88%D8%A7%D9%84%D8%B9%D9%85%D8%B1%D8%A9"},
        {"name": "Fiqh (Ibadah)", "path": "/ar/categories/topics/3/%D8%A7%D9%84%D9%81%D9%82%D9%87"},
        {"name": "Adab & Akhlaq", "path": "/ar/categories/topics/111/%D8%A7%D9%84%D8%A2%D8%AF%D8%A7%D8%A8-%D9%88%D8%A7%D9%84%D8%A3%D8%AE%D9%84%D8%A7%D9%82"},
    ]
    
    LIMIT_PER_CATEGORY = 200 # Anda bisa naikkan ke 500 atau 1000
    
    print(f"🌟 Memulai Ingest Massal (Total Kategori: {len(CATEGORIES)})")
    print(f"Target: {LIMIT_PER_CATEGORY} fatwa per kategori.\n")

    for cat in CATEGORIES:
        print(f"--- FOLDER: {cat['name']} ---")
        try:
            crawl_category(cat['path'], limit=LIMIT_PER_CATEGORY)
        except Exception as e:
            print(f"⚠️ Gagal memproses kategori {cat['name']}: {e}")
            continue
        print(f"--- Selesai Kategori {cat['name']} ---\n")

    print("🎉 SEMUA DATA MASAL SELESAI DIPROSES!")
