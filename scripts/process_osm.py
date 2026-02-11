#!/usr/bin/env python3
"""
Process multiple OSM files and extract POIs, Roads, and Buildings.
Merges data from all input files and outputs consolidated JSONs.
Usage: python process_osm.py file1.osm file2.osm ...
"""

import xml.etree.ElementTree as ET
import json
import sys
import os
from collections import defaultdict

# Configuration
OUTPUT_DIR = '/Users/aditya/.gemini/antigravity/scratch/umrah-guide/osm_data/'

# Enhanced Category Mapping
CATEGORY_MAP = {
    'amenity': {
        'school': 'Amenities',
        'hospital': 'Medical',
        'clinic': 'Medical',
        'pharmacy': 'Medical',
        'parking': 'Support',
        'toilets': 'W C', # Special Category
        'drinking_water': 'Zamzam/Water',
        'place_of_worship': 'Holy Site',
        'bus_station': 'Transportation',
        'taxi': 'Transportation',
        'fast_food': 'Food',
        'restaurant': 'Food',
        'cafe': 'Food',
    },
    'tourism': {
        'hotel': 'Hotel',
        'attraction': 'Landmark',
        'information': 'Support',
        'museum': 'Landmark',
    },
    'building': {
        'hotel': 'Hotel',
        'mosque': 'Holy Site',
        'hospital': 'Medical',
    },
    'highway': {
        'bus_stop': 'Transportation',
        'elevator': 'Elevator', # Special Category
        'steps': 'Stairs', # Special Category
    },
    'conveying': {
        'escalator': 'Escalator', # Special Category
    }
}

# Icon Mapping (FontAwesome classes)
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
    'W C': 'fa-restroom',
    'Elevator': 'fa-arrow-circle-up',
    'Escalator': 'fa-stream',
    'Stairs': 'fa-shoe-prints', # Or fa-stream
    'Zamzam/Water': 'fa-tint'
}

def parse_osm_file(file_path):
    """Parse a single OSM XML file."""
    print(f"Parsing {file_path}...")
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        return {}, {}
    
    nodes = {}  # id -> {lat, lon, tags}
    ways = {}   # id -> {nodes, tags}
    
    for node in root.findall('node'):
        node_id = node.get('id')
        lat = float(node.get('lat'))
        lon = float(node.get('lon'))
        tags = {tag.get('k'): tag.get('v') for tag in node.findall('tag')}
        
        nodes[node_id] = {'lat': lat, 'lon': lon, 'tags': tags}
        
    for way in root.findall('way'):
        way_id = way.get('id')
        node_refs = [nd.get('ref') for nd in way.findall('nd')]
        tags = {tag.get('k'): tag.get('v') for tag in way.findall('tag')}
        
        ways[way_id] = {'nodes': node_refs, 'tags': tags}
        
    print(f"  Nodes: {len(nodes)}, Ways: {len(ways)}")
    return nodes, ways

def identify_category(tags):
    """Determine category from tags."""
    # 1. Custom/Explicit Names - Highest Priority
    name = tags.get('name', '').lower()
    
    if any(k in name for k in ['حجر', 'أسود', 'black stone', 'hajar']): return 'Holy Site'
    if any(k in name for k in ['ركن', 'يماني', 'yamani', 'corner']): return 'Holy Site'
    if any(k in name for k in ['باب', 'gate', 'bab']): return 'Gate'
    if any(k in name for k in ['قطار', 'haramain', 'train']): return 'Transportation'
    
    # Check specific tags for facilities even without names
    if tags.get('amenity') == 'toilets': return 'W C'
    if tags.get('amenity') == 'drinking_water': return 'Zamzam/Water'
    if tags.get('highway') == 'elevator': return 'Elevator'
    if tags.get('conveying') == 'escalator': return 'Escalator'
    if tags.get('highway') == 'steps': return 'Stairs'

    # 2. Mapped Categories
    for key in ['amenity', 'tourism', 'building', 'highway', 'conveying']:
        if key in tags:
            val = tags[key]
            if val in CATEGORY_MAP.get(key, {}):
                return CATEGORY_MAP[key][val]
                
    # 3. Fallback for named items
    if 'name' in tags:
        return 'Landmark'
        
    return None

def process_data(all_nodes, all_ways):
    """Process merged data into POIs, Roads, Buildings."""
    pois = []
    roads = []
    buildings = []
    
    # Track processed IDs to avoid duplicates
    processed_poi_ids = set()
    processed_road_ids = set()
    processed_building_ids = set()
    
    # 1. Process Nodes as POIs
    print("\nCategorizing Node POIs...")
    for node_id, data in all_nodes.items():
        if node_id in processed_poi_ids: continue
        
        tags = data['tags']
        category = identify_category(tags)
        
        # Must have category AND (name OR be a facility type that doesn't need name like WC)
        is_facility = category in ['W C', 'Elevator', 'Escalator', 'Stairs', 'Zamzam/Water']
        has_name = 'name' in tags
        
        if not category or (not has_name and not is_facility):
            continue
            
        name = tags.get('name', tags.get('name:en', category)) # Fallback name to Category
        name_ar = tags.get('name:ar', tags.get('name', ''))
        
        poi = {
            'type': 'Feature',
            'properties': {
                'name': name_ar if name_ar else name, # Prefer Arabic for main display
                'name_en': tags.get('name:en', name),
                'type': category,
                'icon': ICON_MAP.get(category, 'fa-map-marker'),
                'description': tags.get('description', f'{category} - {name}'),
                'osm_id': node_id
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [data['lon'], data['lat']]
            }
        }
        pois.append(poi)
        processed_poi_ids.add(node_id)

    # 2. Process Ways
    print("Processing Ways (Roads & Buildings)...")
    for way_id, data in all_ways.items():
        tags = data['tags']
        node_refs = data['nodes']
        
        # Skip if missing nodes
        coords = []
        valid_way = True
        for ref in node_refs:
            if ref in all_nodes:
                coords.append([all_nodes[ref]['lat'], all_nodes[ref]['lon']])
            else:
                # If a way has missing nodes (from partial file), we might skip or try to render partial
                # For robust routing, we accept partial but rendering needs geometry
                pass
        
        if len(coords) < 2: continue


        # A. Buildings
        if 'building' in tags:
            if way_id in processed_building_ids: continue
            
            # 1. Add as Building Polygon
            poly_coords = [[c[1], c[0]] for c in coords]
            building = {
                'type': 'Feature',
                'properties': {
                    'name': tags.get('name', 'Building'),
                    'building_type': tags.get('building', 'yes'),
                    'osm_id': way_id
                },
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [poly_coords]
                }
            }
            buildings.append(building)
            processed_building_ids.add(way_id)

            # 2. ALSO Add as POI if it has a name and a recognizable category
            category = identify_category(tags)
            if category and 'name' in tags:
                # Calculate simple centroid
                avg_lat = sum(c[0] for c in coords) / len(coords)
                avg_lon = sum(c[1] for c in coords) / len(coords)
                
                poi = {
                    'type': 'Feature',
                    'properties': {
                        'name': tags.get('name:ar', tags.get('name')),
                        'name_en': tags.get('name:en', tags.get('name')),
                        'type': category,
                        'icon': ICON_MAP.get(category, 'fa-map-marker'),
                        'description': tags.get('description', f'{category} - {tags.get("name")}'),
                        'osm_id': f"way_{way_id}"
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [avg_lon, avg_lat]
                    }
                }
                pois.append(poi)

        # B. Roads
        elif 'highway' in tags:

            if way_id in processed_road_ids: continue
            
            hw_type = tags['highway']
            if hw_type in ['footway', 'pedestrian', 'path', 'service', 'residential', 'steps', 'corridor']:
                 # Include steps/corridors
                 pass
            elif hw_type in ['traffic_signals', 'crossing']:
                continue
            
            road = {
                'type': 'Feature',
                'properties': {
                    'name': tags.get('name', f'{hw_type.title()}'),
                    'highway_type': hw_type,
                    'osm_id': way_id,
                    'is_oneway': tags.get('oneway') == 'yes'
                },
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [[c[1], c[0]] for c in coords] # Lon, Lat
                }
            }
            roads.append(road)
            processed_road_ids.add(way_id)

    return pois, roads, buildings


import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def build_routing_graph(ways, nodes):
    """Build a routing graph from OSM ways."""
    print("Building Routing Graph...")
    graph_nodes = {} # id -> [lat, lon]
    adj = defaultdict(dict) # id -> {neighbor_id: weight}
    
    # Track used nodes to minimize graph size
    used_node_ids = set()
    
    count_edges = 0
    
    for way_id, data in ways.items():
        if 'highway' not in data['tags']:
            continue
            
        tags = data['tags']
        hw_type = tags['highway']
        # Exclude non-routable
        if hw_type in ['timelapse', 'platform', 'construction']: 
            continue
            
        way_nodes = data['nodes']
        
        # Determine directionality
        oneway = tags.get('oneway') == 'yes'
        
        # Iterate segments
        for i in range(len(way_nodes) - 1):
            u_id = way_nodes[i]
            v_id = way_nodes[i+1]
            
            if u_id not in nodes or v_id not in nodes:
                continue
                
            u_node = nodes[u_id]
            v_node = nodes[v_id]
            
            dist = haversine(u_node['lat'], u_node['lon'], v_node['lat'], v_node['lon'])
            
            # Add to graph
            adj[u_id][v_id] = dist
            if not oneway:
                adj[v_id][u_id] = dist
                
            used_node_ids.add(u_id)
            used_node_ids.add(v_id)
            count_edges += 1
            
    # Populate graph nodes
    for nid in used_node_ids:
        n = nodes[nid]
        graph_nodes[nid] = [n['lat'], n['lon']]
        
    print(f"  Graph Nodes: {len(graph_nodes)}")
    print(f"  Graph Edges: {count_edges}")
    
    return {'nodes': graph_nodes, 'adj': dict(adj)}

def save_routing_graph(graph, filename):
    filepath = OUTPUT_DIR + filename
    js_content = f"""// Haram Routing Graph v2 (Generated from OSM)
// Nodes: {len(graph['nodes'])}
// Edges: {sum(len(n) for n in graph['adj'].values())}

const routingGraph = {json.dumps(graph, separators=(',', ':'))};
"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Saved routing graph to {filepath}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python process_osm.py <file1> <file2> ...")
        sys.exit(1)
        
    input_files = sys.argv[1:]
    
    # Merged Data Stores
    merged_nodes = {}
    merged_ways = {}
    
    # 1. Parse all files
    for file_path in input_files:
        if not os.path.exists(file_path):
            print(f"Warning: File not found: {file_path}")
            continue
            
        nodes, ways = parse_osm_file(file_path)
        merged_nodes.update(nodes)
        merged_ways.update(ways)
        
    print(f"\\nTotal Merged Nodes: {len(merged_nodes)}")
    print(f"Total Merged Ways: {len(merged_ways)}")
    
    # 2. Extract Entities
    pois, roads, buildings = process_data(merged_nodes, merged_ways)
    
    # 3. Build Routing Graph
    routing_graph = build_routing_graph(merged_ways, merged_nodes)
    save_routing_graph(routing_graph, 'haram-routing-graph-v2.js')
    
    print("-" * 40)
    print(f"Extracted POIs: {len(pois)}")
    print(f"Extracted Roads: {len(roads)}")
    print(f"Extracted Buildings: {len(buildings)}")
    
    # 4. Save JSON Output
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    with open(f'{OUTPUT_DIR}osm_all_pois.json', 'w', encoding='utf-8') as f:
        json.dump(pois, f, ensure_ascii=False, indent=2)
        
    with open(f'{OUTPUT_DIR}osm_roads.json', 'w', encoding='utf-8') as f:
        json.dump(roads, f, ensure_ascii=False, indent=2)
        
    with open(f'{OUTPUT_DIR}osm_buildings.json', 'w', encoding='utf-8') as f:
        json.dump(buildings, f, ensure_ascii=False, indent=2)

    print(f"\\nSaved combined data to {OUTPUT_DIR}")


if __name__ == '__main__':
    main()
