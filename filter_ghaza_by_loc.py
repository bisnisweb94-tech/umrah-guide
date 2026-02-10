import json

INPUT_FILE = "/Users/aditya/.gemini/antigravity/scratch/umrah-guide/ghaza_pois.json"

# Ghaza Approximate Bounding Box
LAT_MIN, LAT_MAX = 21.428, 21.440
LON_MIN, LON_MAX = 39.825, 39.838

def main():
    with open(INPUT_FILE, 'r') as f:
        data = json.load(f)
    
    print(f"Total POIs: {len(data)}")
    
    in_ghaza = []
    for f in data:
        lon, lat = f['geometry']['coordinates']
        if LAT_MIN <= lat <= LAT_MAX and LON_MIN <= lon <= LON_MAX:
             in_ghaza.append(f)
             
    print(f"POIs in Ghaza Box: {len(in_ghaza)}")
    
    for p in in_ghaza:
        props = p['properties']
        coords = p['geometry']['coordinates']
        lat, lon = coords[1], coords[0]
        
        if props['type'] == 'Hotel':
            print(f"HOTEL: {props['name']} ({props['name_en']}) - {lat}, {lon}")
        elif props['type'] == 'Food':
            print(f"FOOD: {props['name']} ({props['name_en']})")
        elif props['type'] == 'Shopping':
            print(f"SHOP: {props['name']} ({props['name_en']})")
            
if __name__ == "__main__":
    main()
