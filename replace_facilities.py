import json
import re

# Load new facilities data
with open('facilities_update.json', 'r') as f:
    new_facilities = json.load(f)

# Read current masjidil-haram-data.js
with open('masjidil-haram-data.js', 'r') as f:
    content = f.read()

# Find the array content
match = re.search(r'const masjidilHaramLocations = \[(.*?)\];', content, re.DOTALL)
if not match:
    print("Error: Could not find masjidilHaramLocations array")
    exit(1)

array_content = match.group(1)

# Parse existing data
# We'll extract everything that's NOT a toilet or escalator
existing_data_str = f'[{array_content}]'
# Use a simple approach: convert to JSON
try:
    existing_data = json.loads(existing_data_str)
except:
    print("Error parsing existing data")
    exit(1)

# Filter out old toilets and escalators
filtered_data = [
    item for item in existing_data
    if not (item['properties'].get('subtype') in ['Toilet', 'Escalator'])
]

print(f"Filtered out {len(existing_data) - len(filtered_data)} old facilities")
print(f"Adding {len(new_facilities)} new facilities")

# Combine
final_data = filtered_data + new_facilities

# Write back
output_js = f"""// Data Lokasi Penting Masjidil Haram - Versi Premium (OSM Map-3)
// Diperbarui dengan koordinat lebih akurat dan kategori tambahan

const masjidilHaramLocations = {json.dumps(final_data, indent=4, ensure_ascii=False)};

// Helper functions (Tetap sama)
function getAllLocations() {{
    return masjidilHaramLocations;
}}

function getLocationsByType(type) {{
    return masjidilHaramLocations.filter(loc => loc.properties.type === type);
}}

function searchLocation(query) {{
    const lowerQuery = query.toLowerCase();
    return masjidilHaramLocations.filter(loc =>
        loc.properties.name.toLowerCase().includes(lowerQuery) ||
        loc.properties.name_en.toLowerCase().includes(lowerQuery)
    );
}}
"""

with open('masjidil-haram-data.js', 'w', encoding='utf-8') as f:
    f.write(output_js)

print(f"Successfully updated masjidil-haram-data.js")
print(f"Total locations: {len(final_data)}")
