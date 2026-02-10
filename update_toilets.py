import json
import re

# New specific toilets near Gate 100
new_toilets = [
    # MEN (West, Lon < 39.823)
    {"coords": [39.8213574, 21.4251632], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},
    {"coords": [39.8211451, 21.4252752], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},
    {"coords": [39.8207911, 21.4254201], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},
    {"coords": [39.8216689, 21.4258089], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},
    {"coords": [39.8213928, 21.4260725], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},
    {"coords": [39.8219166, 21.4256376], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},
    {"coords": [39.8226032, 21.4264151], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},
    {"coords": [39.8224758, 21.4266457], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},
    {"coords": [39.8222847, 21.4269422], "name_en": "Men's Toilet (King Abdullah - West)", "gender": "Male", "icon": "fa-person"},

    # WOMEN (East, Lon >= 39.823)
    {"coords": [39.823849, 21.4273442], "name_en": "Women's Toilet (King Abdullah - East)", "gender": "Female", "icon": "fa-person-dress"},
    {"coords": [39.823849, 21.4275946], "name_en": "Women's Toilet (King Abdullah - East)", "gender": "Female", "icon": "fa-person-dress"},
    {"coords": [39.8238278, 21.4278515], "name_en": "Women's Toilet (King Abdullah - East)", "gender": "Female", "icon": "fa-person-dress"},
    {"coords": [39.8249391, 21.4276934], "name_en": "Women's Toilet (King Abdullah - East)", "gender": "Female", "icon": "fa-person-dress"},
    {"coords": [39.8248966, 21.4279306], "name_en": "Women's Toilet (King Abdullah - East)", "gender": "Female", "icon": "fa-person-dress"},
    {"coords": [39.8248825, 21.4281744], "name_en": "Women's Toilet (King Abdullah - East)", "gender": "Female", "icon": "fa-person-dress"},
    {"coords": [39.8258522, 21.4277922], "name_en": "Women's Toilet (King Abdullah - East)", "gender": "Female", "icon": "fa-person-dress"},
    {"coords": [39.8258805, 21.4282074], "name_en": "Women's Toilet (King Abdullah - East)", "gender": "Female", "icon": "fa-person-dress"}
]

js_objects = []
for t in new_toilets:
    obj = f"""    {{
        "type": "Feature",
        "properties": {{
            "name": "{'Toilet Pria' if t['gender'] == 'Male' else 'Toilet Wanita'}",
            "name_en": "{t['name_en']}",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "{t['icon']}",
            "description": "Fasilitas toilet di area King Abdullah Extension.",
            "gender": "{t['gender']}"
        }},
        "geometry": {{
            "type": "Point",
            "coordinates": {t['coords']}
        }}
    }}"""
    js_objects.append(obj)

new_content_str = ",\n".join(js_objects)

path = "/Users/aditya/.gemini/antigravity/scratch/umrah-guide/masjidil-haram-data.js"
with open(path, "r") as f:
    content = f.read()

# Regex to find the entry before the generic block: 39.829182, 21.4295167
marker_regex = r'(39\.829182,\s+21\.4295167\s+\]\s+\}\s+\}\,)'

match = re.search(marker_regex, content)
if match:
    end_idx = match.end()
    header = content[:end_idx]
    
    # Find footer by searching for the end of the array `];`
    footer_match = re.search(r'\n\];\n', content)
    if footer_match:
        footer = content[footer_match.start():]
        
        final_content = header + "\n" + new_content_str + footer
        
        with open(path, "w") as f:
            f.write(final_content)
        print("Successfully updated toilets.")
    else:
        print("Error: Footer not found.")
else:
    print("Error: Marker not found.")
