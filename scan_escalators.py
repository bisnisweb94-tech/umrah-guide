import xml.etree.ElementTree as ET
import sys
import math

OSM_FILE = "/Users/aditya/Downloads/map-3.osm"

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    
    print(f"Scanning for escalators...")
    
    context = ET.iterparse(OSM_FILE, events=('end',))
    
    count = 0
    escalators = []

    for event, elem in context:
        if elem.tag == 'node':
            tags = {child.get('k'): child.get('v') for child in elem.findall('tag')}
            if not tags:
                elem.clear(); continue
            
            is_escalator = False
            
            # Check for escalator tags
            if tags.get('highway') == 'elevator' or tags.get('conveying') == 'escalator': is_escalator = True
            if 'escalator' in str(tags): is_escalator = True # Broad check
            
            if is_escalator:
                escalators.append({
                    "id": elem.get('id'),
                    "lat": elem.get('lat'),
                    "lon": elem.get('lon'),
                    "tags": tags
                })
                count += 1
            
            elem.clear()
            
    print(f"Total escalators found: {count}")
    
    # Filter for Haram area (approx box: Lat 21.41 to 21.43, Lon 39.81 to 39.84)
    haram_escalators = [e for e in escalators if 21.415 < float(e['lat']) < 21.430 and 39.815 < float(e['lon']) < 39.835]
    print(f"Escalators within Haram area: {len(haram_escalators)}")

    for e in haram_escalators:
        print(f"ESCALATOR: {e['lat']}, {e['lon']}")
        print(f"  Tags: {e['tags']}")
        print("-" * 20)

if __name__ == "__main__":
    main()
