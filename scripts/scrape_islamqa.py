import requests
from bs4 import BeautifulSoup
import json
import time
import os
import re

# --- CONFIGURATION ---
BASE_URL = "https://islamqa.info"
LANG = "id"  # Using Indonesian as primary for chatbot
CATEGORIES = {
    "umrah_haji": "/id/categories/topics/108/haji-dan-umrah",
    "shalat": "/id/categories/topics/4/fiqih-ibadah",
    "aqidah": "/id/categories/topics/3/aqidah",
    "wanita": "/id/categories/topics/83/fiqih-wanita",
    "puasa": "/id/categories/topics/102/puasa",
    "zakat": "/id/categories/topics/105/zakat-dan-sedekah"
}
OUTPUT_FILE = "knowledge/islamqa_db.json"
MAX_FATWAS_PER_CATEGORY = 10  # Start small for testing, scale up later
DELAY = 1.5  # Seconds between requests to be polite

def get_soup(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"❌ Error fetching {url}: {e}")
        return None

def parse_list_page(soup):
    links = []
    # Identify links based on the provided HTML structure
    # Look for <a> with class containing SUT_post_item or within li[data-gtm="link-list-item-container"]
    items = soup.find_all('li', {'data-gtm': 'link-list-item-container'})
    for item in items:
        a_tag = item.find('a', href=True)
        if a_tag and '/answers/' in a_tag['href']:
            links.append(BASE_URL + a_tag['href'])
    return links

def parse_detail_page(soup, url):
    try:
        # Title
        title = soup.find('h1').get_text(strip=True) if soup.find('h1') else "No Title"
        
        # Fatwa ID from URL
        fatwa_id = url.split('/')[-1]
        
        # Question
        # Selector found: .tw-bg-paperQuestion
        question_section = soup.select_one('.tw-bg-paperQuestion')
        question_text = question_section.get_text(strip=True) if question_section else "No Question"
        
        # Answer
        # Selector found: .SUT_answer_text
        answer_section = soup.select_one('.SUT_answer_text')
        if not answer_section:
            # Fallback for some pages
            answer_section = soup.select_one('h2 + p')
        
        answer_text = answer_section.get_text(strip=True) if answer_section else "No Answer"
        
        # Cleanup
        if question_text == "No Question" or answer_text == "No Answer":
            print(f"  ⚠️ Skipping {fatwa_id}: Missing content.")
            return None

        # Keywords (simple extraction from title)
        keywords = list(set(re.findall(r'\w+', title.lower())))
        keywords = [k for k in keywords if len(k) > 3]

        return {
            "id": fatwa_id,
            "title_id": title,
            "question_id": question_text,
            "answer_id": answer_text,
            "url": url,
            "category": "scraped",
            "keywords": keywords[:10]
        }
    except Exception as e:
        print(f"⚠️ Error parsing {url}: {e}")
        return None

def main():
    if not os.path.exists('knowledge'):
        os.makedirs('knowledge')

    # Load existing database
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)
    else:
        db = {"metadata": {"version": "3.0", "source": "islamqa.info", "count": 0}, "fatwas": []}

    existing_ids = {f['id'] for f in db['fatwas']}
    
    for cat_name, cat_url in CATEGORIES.items():
        print(f"🔎 Scraping category: {cat_name}...")
        full_cat_url = BASE_URL + cat_url
        soup = get_soup(full_cat_url)
        if not soup: continue
        
        fatwa_links = parse_list_page(soup)
        count = 0
        
        for link in fatwa_links:
            fatwa_id = link.split('/')[-1]
            if fatwa_id in existing_ids:
                continue
            
            print(f"  📄 Fetching fatwa {fatwa_id}...")
            f_soup = get_soup(link)
            if not f_soup: continue
            
            data = parse_detail_page(f_soup, link)
            if data:
                data['category'] = cat_name
                db['fatwas'].append(data)
                existing_ids.add(fatwa_id)
                count += 1
                db['metadata']['count'] = len(db['fatwas'])
                
                # Save incrementally
                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                    json.dump(db, f, ensure_ascii=False, indent=2)
                
                if count >= MAX_FATWAS_PER_CATEGORY:
                    break
            
            time.sleep(DELAY)
            
    print(f"✅ Scraping complete. Total fatwas: {db['metadata']['count']}")

if __name__ == "__main__":
    main()
