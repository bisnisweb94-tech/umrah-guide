// Routing Logic
// Depends on 'routingGraph' global variable from haram-routing-graph.js

function findNearestNode(lat, lon) {
    let minDist = Infinity;
    let closestNode = null;

    // Iterate all nodes
    for (const [id, coords] of Object.entries(routingGraph.nodes)) {
        const d = Math.sqrt(Math.pow(lat - coords[0], 2) + Math.pow(lon - coords[1], 2));
        if (d < minDist) {
            minDist = d;
            closestNode = id;
        }
    }
    return closestNode;
}

function dijkstra(startNode, endNode) {
    const distances = {};
    const previous = {};
    const queue = new PriorityQueue();

    distances[startNode] = 0;
    queue.enqueue(startNode, 0);

    // Initialize
    for (const node in routingGraph.adj) {
        if (node !== startNode) distances[node] = Infinity;
        previous[node] = null;
    }

    while (!queue.isEmpty()) {
        const current = queue.dequeue().element;

        if (current === endNode) {
            // Reconstruct path
            const path = [];
            let u = endNode;
            while (u) {
                path.unshift(routingGraph.nodes[u]); // Add coords [lat, lon]
                u = previous[u];
            }
            return path;
        }

        const neighbors = routingGraph.adj[current];
        if (!neighbors) continue;

        for (const [neighbor, weight] of Object.entries(neighbors)) {
            const alt = distances[current] + weight;
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = current;
                queue.enqueue(neighbor, alt);
            }
        }
    }

    return null; // No path found
}

// Simple Priority Queue implementation
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        const qElement = { element, priority };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                this.items.splice(i, 0, qElement);
                added = true;
                break;
            }
        }
        if (!added) this.items.push(qElement);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

// Global routing state
let routeLayer = null;
let startMarker = null;
let endMarker = null;
let isSettingStart = false;
let isSettingEnd = false;

// UI Functions
function initRouting() {
    // Add routing controls if not already handled by HTML
}

function setStartPoint() {
    isSettingStart = true;
    document.getElementById('map').style.cursor = 'crosshair';
    // Logic handled in map click listener
}

function setEndPoint() {
    isSettingEnd = true;
    document.getElementById('map').style.cursor = 'crosshair';
}

function clearRoute() {
    if (routeLayer) map.removeLayer(routeLayer);
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    document.getElementById('routeStart').value = '';
    document.getElementById('routeEnd').value = '';
    routeLayer = null;
    startMarker = null;
    endMarker = null;
}

// Main Calculate Function
window.calculateOfflineRoute = function () {
    if (!startPoint || !endPoint) {
        alert("Pilih titik awal dan tujuan di peta terlebih dahulu.");
        return;
    }

    const startNode = findNearestNode(startPoint.lat, startPoint.lng);
    const endNode = findNearestNode(endPoint.lat, endPoint.lng);

    if (!startNode || !endNode) {
        alert("Titik terlalu jauh dari jaringan jalan yang terdata.");
        return;
    }

    const path = dijkstra(startNode, endNode);

    if (path) {
        if (routeLayer) map.removeLayer(routeLayer);

        routeLayer = L.polyline(path, {
            color: 'blue',
            weight: 5,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round'
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });

        // Calculate distance & time
        let totalDist = 0;
        for (let i = 0; i < path.length - 1; i++) {
            totalDist += map.distance(path[i], path[i + 1]);
        }

        const timeMins = Math.round(totalDist / 80); // ~80m/min walking speed
        alert(`Rute ditemukan!\nJarak: ${Math.round(totalDist)} meter\nWaktu: ~${timeMins} menit`);
    } else {
        alert("Maaf, rute tidak ditemukan antara titik ini.");
    }
};
