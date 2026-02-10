import xml.etree.ElementTree as ET
import json

osm_file = '/Users/aditya/Downloads/map-3.osm'
output_file = 'toilets_data.json'

toilets = []

try:
    # Iterative parsing to handle large file
    context = ET.iterparse(osm_file, events=('end',))
    for event, elem in context:
        if elem.tag == 'node':
            tags = {tag.attrib['k']: tag.attrib['v'] for tag in elem.findall('tag')}
            if tags.get('amenity') == 'toilets':
                toilet = {
                    "type": "Feature",
                    "properties": {
                        "name": tags.get('name', 'Toilet'),
                        "name_en": tags.get('name:en', 'Public Toilet'),
                        "type": "Support",
                        "subtype": "Toilet",
                        "icon": "fa-restroom",
                        "description": "Fasilitas toilet umum.",
                        "gender": tags.get('male') == 'yes' and 'Male' or (tags.get('female') == 'yes' and 'Female' or 'Unspecified')
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [float(elem.attrib['lon']), float(elem.attrib['lat'])]
                    }
                }
                
                # Refine info based on tags
                if toilet["properties"]["gender"] == 'Male':
                    toilet["properties"]["name"] += " (Pria)"
                    toilet["properties"]["name_en"] += " (Men)"
                    toilet["properties"]["icon"] = "fa-person"
                elif toilet["properties"]["gender"] == 'Female':
                    toilet["properties"]["name"] += " (Wanita)"
                    toilet["properties"]["name_en"] += " (Women)"
                    toilet["properties"]["icon"] = "fa-person-dress"
                
                toilets.append(toilet)
                
            elem.clear() # Free memory

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(toilets, f, indent=4, ensure_ascii=False)

    print(f"Successfully extracted {len(toilets)} toilets to {output_file}")

except Exception as e:
    print(f"Error parsing OSM: {e}")
