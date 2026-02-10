import xml.etree.ElementTree as ET
import sys
import math

OSM_FILE = "/Users/aditya/Downloads/map-2.osm"

# Coordinates of King Abdullah Gate (Gate 100) from our data
TARGET_LAT = 21.425391
TARGET_LON = 39.824132

def haversine(lat1, lon1, lat2, lon2):
    R = 6371e3 # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print(f"Scanning {OSM_FILE} for toilets near Gate 100 ({TARGET_LAT}, {TARGET_LON})...")
    
    context = ET.iterparse(OSM_FILE, events=('end',))
    
    count = 0
    for event, elem in context:
        if elem.tag == 'node':
            tags = {child.get('k'): child.get('v') for child in elem.findall('tag')}
            if not tags:
                elem.clear(); continue
            
            # Check for toilets
            is_toilet = False
            if tags.get('amenity') == 'toilets': is_toilet = True
            
            if is_toilet:
                lat = float(elem.get('lat'))
                lon = float(elem.get('lon'))
                
                dist = haversine(TARGET_LAT, TARGET_LON, lat, lon)
                
                # Check within 200 meters of Gate 100
                if dist < 200:
                    gender = tags.get('male') == 'yes' and 'Male' or (tags.get('female') == 'yes' and 'Female' or 'Unspecified')
                    if tags.get('unisex') == 'yes': gender = 'Unisex'
                    
                    print(f"MATCH: Node {elem.get('id')} ({dist:.1f}m away)")
                    print(f"  Coords: {lat}, {lon}")
                    print(f"  Tags: {tags}")
                    print(f"  Gender: {gender}")
                    print("-" * 30)
                    count += 1
            
            elem.clear()
            
    print(f"Total toilets found near Gate 100: {count}")

if __name__ == "__main__":
    main()
