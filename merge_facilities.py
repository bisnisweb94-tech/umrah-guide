import json

# Load toilets data
with open('toilets_data.json', 'r') as f:
    toilets = json.load(f)

# Escalators from scan (map-3.osm)
escalators_data = [
    {"lat": 21.4198481, "lon": 39.8228696, "name": "Lift/Escalator 1"},
    {"lat": 21.4204201, "lon": 39.8231105, "name": "Lift/Escalator 2"},
    {"lat": 21.4240541, "lon": 39.8226620, "name": "Lift/Escalator 3"},
    {"lat": 21.4248131, "lon": 39.8231730, "name": "Lift/Escalator 4"},
    {"lat": 21.4250853, "lon": 39.8234278, "name": "Lift/Escalator 5"},
    {"lat": 21.4258793, "lon": 39.8247166, "name": "Lift/Escalator 6"},
    {"lat": 21.4260241, "lon": 39.8251846, "name": "Lift/Escalator 7"},
    {"lat": 21.4261464, "lon": 39.8260322, "name": "Lift/Escalator 8"},
    {"lat": 21.4248656, "lon": 39.8274467, "name": "Lift/Escalator 9 (Multi-Level)"},
    {"lat": 21.4225647, "lon": 39.8277420, "name": "Lift/Escalator 10 (Multi-Level)"}
]

escalators = []
for i, esc in enumerate(escalators_data, 1):
    escalators.append({
        "type": "Feature",
        "properties": {
            "name": f"مصعد {i}",
            "name_en": esc["name"],
            "type": "Support",
            "subtype": "Escalator",
            "icon": "fa-elevator",
            "description": "Lift/Escalator untuk akses lantai atas."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [esc["lon"], esc["lat"]]
        }
    })

# Merge toilets and escalators
all_facilities = toilets + escalators

# Write to masjidil-haram-data.js
print(f"Total facilities: {len(toilets)} toilets + {len(escalators)} escalators = {len(all_facilities)}")

with open('facilities_update.json', 'w') as f:
    json.dump(all_facilities, f, indent=2, ensure_ascii=False)

print("Facilities data prepared in facilities_update.json")
