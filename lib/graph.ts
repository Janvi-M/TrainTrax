export const cities = [
  "Mumbai", "Chennai", "Bangalore", "Delhi", "Hyderabad", "Jaipur", "Shimla", "Ahmedabad"
];

export const defaultRailwayGraph = [
  [0, 1338, 981, 1153, 711, 947, 1425, 524],
  [1338, 0, 346, 2180, 625, 1862, 2458, 1862],
  [981, 346, 0, 2111, 575, 1793, 2389, 1793],
  [1153, 2180, 2111, 0, 1273, 281, 343, 934],
  [711, 625, 575, 1273, 0, 1054, 1630, 1054],
  [947, 1862, 1793, 281, 1054, 0, 624, 655],
  [1425, 2458, 2389, 343, 1630, 624, 0, 1279],
  [524, 1862, 1793, 934, 1054, 655, 1279, 0],
];

export function dijkstra(graph: number[][], source: number, destination: number) {
  const n = graph.length;
  const distances = new Array(n).fill(Number.POSITIVE_INFINITY);
  const previous = new Array(n).fill(-1);
  const visited = new Array(n).fill(false);
  distances[source] = 0;
  for (let i = 0; i < n - 1; i++) {
    let minDistance = Number.POSITIVE_INFINITY;
    let minVertex = -1;
    for (let v = 0; v < n; v++) {
      if (!visited[v] && distances[v] < minDistance) {
        minDistance = distances[v];
        minVertex = v;
      }
    }
    if (minVertex === -1) break;
    visited[minVertex] = true;
    for (let v = 0; v < n; v++) {
      if (!visited[v] && graph[minVertex][v] > 0) {
        const newDistance = distances[minVertex] + graph[minVertex][v];
        if (newDistance < distances[v]) {
          distances[v] = newDistance;
          previous[v] = minVertex;
        }
      }
    }
  }
  const path = [];
  let current = destination;
  while (current !== -1) {
    path.unshift(current);
    current = previous[current];
  }
  if (path[0] !== source) {
    return null;
  }
  return {
    distance: distances[destination],
    path: path,
  };
}

export function findAlternativeRoutes(graph: number[][], source: number, destination: number) {
  const routes = [];
  const primaryRoute = dijkstra(graph, source, destination);
  if (primaryRoute) {
    routes.push({
      path: primaryRoute.path.map((i) => cities[i]),
      distance: primaryRoute.distance,
      time: Math.ceil(primaryRoute.distance / 60),
      price: primaryRoute.distance + 100,
      best: true,
    });
  }
  if (primaryRoute && primaryRoute.path.length > 2) {
    const modifiedGraph = graph.map((row) => [...row]);
    for (let i = 0; i < primaryRoute.path.length - 1; i++) {
      const from = primaryRoute.path[i];
      const to = primaryRoute.path[i + 1];
      const originalWeight = modifiedGraph[from][to];
      modifiedGraph[from][to] = 0;
      modifiedGraph[to][from] = 0;
      const altRoute = dijkstra(modifiedGraph, source, destination);
      if (altRoute && altRoute.distance !== Number.POSITIVE_INFINITY) {
        const routeExists = routes.some(
          (r) => JSON.stringify(r.path) === JSON.stringify(altRoute.path.map((i) => cities[i]))
        );
        if (!routeExists) {
          routes.push({
            path: altRoute.path.map((i) => cities[i]),
            distance: altRoute.distance,
            time: Math.ceil(altRoute.distance / 60),
            price: altRoute.distance + 100,
            best: false,
          });
        }
      }
      modifiedGraph[from][to] = originalWeight;
      modifiedGraph[to][from] = originalWeight;
    }
  }
  return routes.slice(0, 3);
} 