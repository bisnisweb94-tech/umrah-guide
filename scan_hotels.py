import xml.etree.ElementTree as ET
import sys
import math

OSM_FILE = "/Users/aditya/Downloads/map-2.osm"

# Kaaba Coordinates
CENTER_LAT = 21.4225
CENTER_LON = 39.8262

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

    print(f"Scanning for hotels near Masjidil Haram (within 600m)...")
    
    context = ET.iterparse(OSM_FILE, events=('end',))
    
    count = 0
    hotels = []

    for event, elem in context:
        if elem.tag == 'node':
            tags = {child.get('k'): child.get('v') for child in elem.findall('tag')}
            if not tags:
                elem.clear(); continue
            
            is_hotel = False
            if tags.get('tourism') == 'hotel': is_hotel = True
            if tags.get('building') == 'hotel': is_hotel = True
            
            if is_hotel and 'name' in tags:
                lat = float(elem.get('lat'))
                lon = float(elem.get('lon'))
                
                dist = haversine(CENTER_LAT, CENTER_LON, lat, lon)
                
                if dist <= 800: # 800 meters radius
                    hotels.append({
                        "name": tags.get('name'),
                        "name_en": tags.get('name:en', tags.get('name')),
                        "lat": lat,
                        "lon": lon,
                        "dist": dist
                    })
                    count += 1
            
            elem.clear()
            
    print(f"Total hotels found: {count}")

    # Sort by distance
    hotels.sort(key=lambda x: x['dist'])

    for h in hotels:
        print(f"HOTEL: {h['name']} ({h['name_en']}) - {h['dist']:.0f}m")
        print(f"  Coords: {h['lat']}, {h['lon']}")
        print("-" * 20)

if __name__ == "__main__":
    main()
