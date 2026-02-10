import xml.etree.ElementTree as ET
import json
import sys

# File paths
OSM_FILE = "/Users/aditya/Downloads/map-3.osm"
OUTPUT_FILE = "/Users/aditya/.gemini/antigravity/scratch/umrah-guide/ghaza_pois.json"

# Relevance filters
RELEVANT_TAGS = {
    'tourism': ['hotel', 'guest_house', 'apartment'],
    'amenity': ['restaurant', 'fast_food', 'cafe', 'pharmacy', 'clinic', 'hospital', 'place_of_worship', 'toilets', 'bank', 'atm'],
    'shop': ['supermarket', 'convenience', 'mall', 'clothes', 'mobile_phone']
}

def is_relevant(tags):
    for key, values in RELEVANT_TAGS.items():
        if key in tags and tags[key] in values:
            return True
        # Also capture generic shops if they have a name
        if key == 'shop' and 'name' in tags:
            return True
    return False

def get_icon(tags):
    if 'tourism' in tags and tags['tourism'] in ['hotel', 'guest_house']:
        return 'fa-hotel'
    if 'amenity' in tags:
        a = tags['amenity']
        if a in ['restaurant', 'fast_food', 'cafe']: return 'fa-utensils'
        if a in ['pharmacy', 'clinic', 'hospital']: return 'fa-notes-medical'
        if a == 'place_of_worship': return 'fa-mosque'
        if a == 'toilets': return 'fa-restroom'
        if a in ['bank', 'atm']: return 'fa-money-bill'
    if 'shop' in tags:
        return 'fa-shopping-cart'
    return 'fa-map-marker-alt'

def get_type(tags):
    if 'tourism' in tags: return "Hotel"
    if 'amenity' in tags:
        a = tags['amenity']
        if a == 'place_of_worship': return "Holy Site" # Or separate category
        if a in ['restaurant', 'fast_food', 'cafe']: return "Food"
        if a in ['pharmacy', 'clinic', 'hospital']: return "Medical"
        return "Support"
    if 'shop' in tags: return "Shopping"
    return "Landmark"

def main():
    print(f"Parsing {OSM_FILE}...")
    pois = []
    
    context = ET.iterparse(OSM_FILE, events=('end',))
    for event, elem in context:
        if elem.tag == 'node':
            tags = {child.get('k'): child.get('v') for child in elem.findall('tag')}
            
            if is_relevant(tags) and ('name' in tags or 'name:en' in tags or 'name:ar' in tags):
                lat = float(elem.get('lat'))
                lon = float(elem.get('lon'))
                
                name = tags.get('name', tags.get('name:en', tags.get('name:ar', 'Unknown')))
                name_en = tags.get('name:en', tags.get('name', ''))
                
                poi = {
                    "type": "Feature",
                    "properties": {
                        "name": name,
                        "name_en": name_en,
                        "type": get_type(tags),
                        "icon": get_icon(tags),
                        "description": f"{tags.get('amenity', tags.get('shop', tags.get('tourism', '')))} in Ghaza area".capitalize()
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    }
                }
                pois.append(poi)
            
            elem.clear()

    print(f"Found {len(pois)} Points of Interest.")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(pois, f, indent=4, ensure_ascii=False)
        
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
