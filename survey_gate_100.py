import xml.etree.ElementTree as ET
import sys
import math

OSM_FILE = "/Users/aditya/Downloads/map-2.osm"
TARGET_LAT = 21.425391
TARGET_LON = 39.824132

def haversine(lat1, lon1, lat2, lon2):
    R = 6371e3
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    
    print(f"Scanning facilities near Gate 100 (Radius 400m)...")
    
    context = ET.iterparse(OSM_FILE, events=('end',))
    
    count = 0
    for event, elem in context:
        if elem.tag == 'node':
            tags = {child.get('k'): child.get('v') for child in elem.findall('tag')}
            if not tags:
                elem.clear(); continue
            
            try:
                lat = float(elem.get('lat'))
                lon = float(elem.get('lon'))
                dist = haversine(TARGET_LAT, TARGET_LON, lat, lon)
                
                if dist < 400:
                    is_hit = False
                    type_ = ""
                    
                    if tags.get('amenity') == 'toilets':
                        is_hit = True
                        type_ = "Toilet"
                        gender = tags.get('male') == 'yes' and 'Male' or (tags.get('female') == 'yes' and 'Female' or 'Unspecified')
                        if tags.get('unisex') == 'yes': gender = 'Unisex'
                        type_ += f" ({gender})"
                    
                    elif 'escalator' in str(tags): 
                        is_hit = True
                        type_ = "Escalator"
                    
                    elif 'wheelchair' in str(tags):
                        is_hit = True
                        type_ = "Wheelchair Facility"
                    
                    if is_hit:
                        print(f"MATCH: {type_}")
                        print(f"  Node {elem.get('id')} ({dist:.1f}m)")
                        print(f"  Coords: {lat}, {lon}")
                        print(f"  Tags: {tags}")
                        print("-" * 30)
                        count += 1
            except:
                pass

            elem.clear()
            
    print(f"Total found: {count}")

if __name__ == "__main__":
    main()
