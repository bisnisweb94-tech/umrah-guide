#!/usr/bin/env python3
"""
Extract all data from map-3.osm and categorize into JSON files.
"""

import xml.etree.ElementTree as ET
import json
from collections import defaultdict

# File paths
OSM_FILE = 'osm_data/map-4.osm'
OUTPUT_DIR = '/Users/aditya/.gemini/antigravity/scratch/umrah-guide/osm_data/'

# Category mappings
CATEGORY_MAP = {
    'amenity': {
        'school': 'Amenities',
        'hospital': 'Medical',
        'clinic': 'Medical',
        'pharmacy': 'Medical',
        'parking': 'Support',
        'toilets': 'Support',
        'drinking_water': 'Support',
        'place_of_worship': 'Holy Site',
        'bus_station': 'Transportation',
        'restaurant': 'Food',
        'cafe': 'Food',
        'fast_food': 'Food',
        'food_court': 'Food',
    },
    'tourism': {
        'hotel': 'Hotel',
        'attraction': 'Landmark',
        'information': 'Support',
    },
    'building': {
        'hotel': 'Hotel',
        'mosque': 'Holy Site',
        'hospital': 'Medical',
    },
    'highway': {
        'bus_stop': 'Transportation',
    }
}

# Icon mappings
ICON_MAP = {
    'Holy Site': 'fa-kaaba',
    'Gate': 'fa-door-open',
    'Hotel': 'fa-hotel',
    'Medical': 'fa-hospital',
    'Support': 'fa-info-circle',
    'Transportation': 'fa-bus',
    'Amenities': 'fa-building',
    'Landmark': 'fa-map-marker-alt',
    'Food': 'fa-utensils',
}

def parse_osm_file():
    """Parse OSM XML file and extract all relevant data."""
    print(f"Parsing {OSM_FILE}...")
    
    tree = ET.parse(OSM_FILE)
    root = tree.getroot()
    
    # Storage for different data types
    nodes_data = {}  # id -> {lat, lon, tags}
    ways_data = {}   # id -> {nodes, tags}
    
    # Parse all nodes
    print("Extracting nodes...")
    for node in root.findall('node'):
        node_id = node.get('id')
        lat = float(node.get('lat'))
        lon = float(node.get('lon'))
        
        tags = {}
        for tag in node.findall('tag'):
            tags[tag.get('k')] = tag.get('v')
        
        nodes_data[node_id] = {
            'lat': lat,
            'lon': lon,
            'tags': tags
        }
    
    print(f"  Found {len(nodes_data)} nodes")
    
    # Parse all ways
    print("Extracting ways...")
    for way in root.findall('way'):
        way_id = way.get('id')
        
        node_refs = []
        for nd in way.findall('nd'):
            node_refs.append(nd.get('ref'))
        
        tags = {}
        for tag in way.findall('tag'):
            tags[tag.get('k')] = tag.get('v')
        
        ways_data[way_id] = {
            'nodes': node_refs,
            'tags': tags
        }
    
    print(f"  Found {len(ways_data)} ways")
    
    return nodes_data, ways_data

def categorize_node(tags):
    """Determine category for a node based on its tags."""
    # Check for specific holy sites
    name = tags.get('name', '').lower()
    if any(keyword in name for keyword in ['حجر', 'أسود', 'black stone', 'hajar']):
        return 'Holy Site'
    if any(keyword in name for keyword in ['ركن', 'يماني', 'yamani', 'corner']):
        return 'Holy Site'
    if any(keyword in name for keyword in ['باب', 'gate', 'bab']):
        return 'Gate'
    if 'قطار' in name or 'haramain' in name or 'train' in name:
        return 'Transportation'
    
    # Check amenity tags
    if 'amenity' in tags:
        amenity_type = tags['amenity']
        if amenity_type in CATEGORY_MAP['amenity']:
            return CATEGORY_MAP['amenity'][amenity_type]
    
    # Check tourism tags
    if 'tourism' in tags:
        tourism_type = tags['tourism']
        if tourism_type in CATEGORY_MAP['tourism']:
            return CATEGORY_MAP['tourism'][tourism_type]
    
    # Check building tags
    if 'building' in tags:
        building_type = tags['building']
        if building_type in CATEGORY_MAP['building']:
            return CATEGORY_MAP['building'][building_type]
    
    # Check highway tags
    if 'highway' in tags:
        highway_type = tags['highway']
        if highway_type in CATEGORY_MAP['highway']:
            return CATEGORY_MAP['highway'][highway_type]
    
    # If has name but no category, mark as Landmark
    if 'name' in tags:
        return 'Landmark'
    
    return None

def extract_pois(nodes_data):
    """Extract POIs from nodes."""
    pois_by_category = defaultdict(list)
    
    print("Categorizing POIs...")
    for node_id, node_info in nodes_data.items():
        tags = node_info['tags']
        
        # Skip nodes without names (except specific amenities)
        has_name = 'name' in tags or 'name:en' in tags or 'name:ar' in tags
        is_food = tags.get('amenity') in ['restaurant', 'cafe', 'fast_food', 'food_court']
        
        if not has_name and not is_food and 'amenity' not in tags:
            continue
        
        category = categorize_node(tags)
        if not category:
            continue
        
        # Get name
        name = tags.get('name', tags.get('name:en', 'Unnamed'))
        if name == 'Unnamed' and is_food:
            amenity_type = tags.get('amenity', 'Food').replace('_', ' ').title()
            name = f"{amenity_type} (Tanpa Nama)"
            
        name_ar = tags.get('name:ar', tags.get('name', ''))
        
        # Create POI entry
        poi = {
            'type': 'Feature',
            'properties': {
                'name': name_ar if name_ar else name,
                'name_en': tags.get('name:en', name),
                'type': category,
                'icon': ICON_MAP.get(category, 'fa-map-marker'),
                'description': tags.get('description', f'{category} di area Masjidil Haram.'),
                'osm_id': node_id,
                'tags': tags
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [node_info['lon'], node_info['lat']]
            }
        }
        
        pois_by_category[category].append(poi)
    
    # Print statistics
    print("\nPOI Statistics:")
    for category, pois in sorted(pois_by_category.items()):
        print(f"  {category}: {len(pois)}")
    
    return pois_by_category

def extract_roads(ways_data, nodes_data):
    """Extract roads from ways."""
    roads = []
    
    print("\nExtracting roads...")
    for way_id, way_info in ways_data.items():
        tags = way_info['tags']
        
        # Only process highways
        if 'highway' not in tags:
            continue
        
        highway_type = tags['highway']
        # Skip minor highway types
        if highway_type in ['traffic_signals', 'crossing', 'speed_camera', 'motorway_junction', 'turning_circle']:
            continue
        
        # Get coordinates
        coordinates = []
        for node_ref in way_info['nodes']:
            if node_ref in nodes_data:
                node = nodes_data[node_ref]
                coordinates.append([node['lat'], node['lon']])
        
        if len(coordinates) < 2:
            continue
        
        road = {
            'type': 'Feature',
            'properties': {
                'name': tags.get('name', f'{highway_type.title()} Road'),
                'highway_type': highway_type,
                'osm_id': way_id,
                'tags': tags
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
            }
        }
        
        roads.append(road)
    
    print(f"  Found {len(roads)} roads")
    return roads

def extract_buildings(ways_data, nodes_data):
    """Extract buildings from ways."""
    buildings = []
    
    print("\nExtracting buildings...")
    for way_id, way_info in ways_data.items():
        tags = way_info['tags']
        
        # Only process buildings
        if 'building' not in tags:
            continue
        
        # Get coordinates
        coordinates = []
        for node_ref in way_info['nodes']:
            if node_ref in nodes_data:
                node = nodes_data[node_ref]
                coordinates.append([node['lat'], node['lon']])
        
        if len(coordinates) < 3:
            continue
        
        building = {
            'type': 'Feature',
            'properties': {
                'name': tags.get('name', 'Building'),
                'building_type': tags.get('building', 'yes'),
                'osm_id': way_id,
                'tags': tags
            },
            'geometry': {
                'type': 'Polygon',
                'coordinates': [coordinates]
            }
        }
        
        buildings.append(building)
    
    print(f"  Found {len(buildings)} buildings")
    return buildings

def save_to_json(data, filename):
    """Save data to JSON file."""
    import os
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    filepath = OUTPUT_DIR + filename
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Saved to {filepath}")

def main():
    """Main extraction process."""
    print("=" * 60)
    print("OSM Data Extraction Tool")
    print("=" * 60)
    
    # Parse OSM file
    nodes_data, ways_data = parse_osm_file()
    
    # Extract POIs
    pois_by_category = extract_pois(nodes_data)
    
    # Save POIs by category
    print("\nSaving POI data...")
    for category, pois in pois_by_category.items():
        filename = f"osm_{category.lower().replace(' ', '_')}.json"
        save_to_json(pois, filename)
    
    # Save all POIs combined
    all_pois = []
    for pois in pois_by_category.values():
        all_pois.extend(pois)
    save_to_json(all_pois, 'osm_all_pois.json')
    
    # Extract roads
    roads = extract_roads(ways_data, nodes_data)
    save_to_json(roads, 'osm_roads.json')
    
    # Extract buildings
    buildings = extract_buildings(ways_data, nodes_data)
    save_to_json(buildings, 'osm_buildings.json')
    
    print("\n" + "=" * 60)
    print("Extraction Complete!")
    print(f"Total POIs: {len(all_pois)}")
    print(f"Total Roads: {len(roads)}")
    print(f"Total Buildings: {len(buildings)}")
    print("=" * 60)

if __name__ == '__main__':
    main()
