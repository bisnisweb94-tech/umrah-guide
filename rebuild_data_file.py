import json

# Read the original file to extract non-facility data
with open('masjidil-haram-data.js', 'r') as f:
    lines = f.readlines()

# Find where facilities start (first occurrence of subtype: Toilet or Escalator)
facility_start_line = None
for i, line in enumerate(lines):
    if '"subtype": "Toilet"' in line or '"subtype": "Escalator"' in line:
        # Go back to find the start of this object
        for j in range(i, max(0, i-20), -1):
            if lines[j].strip() == '{':
                facility_start_line = j
                break
        break

if facility_start_line is None:
    print("No facilities found in original file")
    exit(1)

print(f"Facilities start at line {facility_start_line}")

# Extract everything before facilities
pre_facilities = ''.join(lines[:facility_start_line])

# Load new facilities
with open('facilities_update.json', 'r') as f:
    new_facilities = json.load(f)

# Convert new facilities to JS format
facilities_js = json.dumps(new_facilities, indent=4, ensure_ascii=False)
# Remove outer brackets
facilities_js = facilities_js[1:-1].strip()

# Reconstruct the file
new_content = pre_facilities + facilities_js + """
];

// Helper functions (Tetap sama)
function getAllLocations() {
    return masjidilHaramLocations;
}

function getLocationsByType(type) {
    return masjidilHaramLocations.filter(loc => loc.properties.type === type);
}

function searchLocation(query) {
    const lowerQuery = query.toLowerCase();
    return masjidilHaramLocations.filter(loc =>
        loc.properties.name.toLowerCase().includes(lowerQuery) ||
        loc.properties.name_en.toLowerCase().includes(lowerQuery)
    );
}
"""

# Write the new file
with open('masjidil-haram-data-new.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Created masjidil-haram-data-new.js")
print(f"Added {len(new_facilities)} facilities")
