import xml.etree.ElementTree as ET
import sys

OSM_FILE = "/Users/aditya/Downloads/map-2.osm"

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print(f"Scanning {OSM_FILE} for Umrah Gate...")
    queries = ["umrah", "umra", "omra", "amrah", "62"]
    
    context = ET.iterparse(OSM_FILE, events=('end',))
    
    count = 0
    for event, elem in context:
        if elem.tag == 'node':
            tags = {child.get('k'): child.get('v') for child in elem.findall('tag')}
            if not tags:
                elem.clear(); continue

            # Ref 62 check (strict or partial)
            ref_match = False
            if '62' in tags.get('ref', ''):
                ref_match = True
            
            full_text = f"{tags.get('name', '').lower()} {tags.get('name:en', '').lower()} {tags.get('alt_name', '').lower()} {tags.get('name:ar', '')}"
            
            name_match = any(q in full_text for q in queries)
            
            if ref_match or name_match:
                # Gate check
                is_gate = False
                if 'barrier' in tags and tags['barrier'] == 'gate': is_gate = True
                if 'entrance' in tags: is_gate = True
                if 'gate' in full_text or 'bab' in full_text: is_gate = True
                
                if is_gate:
                    print(f"MATCH: Node {elem.get('id')}")
                    print(f"  Coords: {elem.get('lat')}, {elem.get('lon')}")
                    print(f"  Tags: {tags}")
                    print("-" * 30)
                    count += 1
            
            elem.clear()
            
    print(f"Total found: {count}")

if __name__ == "__main__":
    main()
