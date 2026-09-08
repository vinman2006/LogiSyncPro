export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  stage: string;
}

// Nashik to Pune corridor
export const ORANGES_ROUTE_WAYPOINTS: Waypoint[] = [
  { name: 'Maharashtra Orange Farm, Nashik', lat: 20.0110, lng: 73.7903, stage: 'LOADED_ORIGIN' },
  { name: 'Sinnar Highway Checkpost', lat: 19.8454, lng: 73.9961, stage: 'IN_TRANSIT_WAYPOINT_1' },
  { name: 'Sangamner Agri Corridor', lat: 19.5761, lng: 74.2144, stage: 'IN_TRANSIT_WAYPOINT_2' },
  { name: 'Ahmednagar Bypass', lat: 19.0952, lng: 74.7496, stage: 'IN_TRANSIT_WAYPOINT_3' },
  { name: 'Chakan Logistics Park', lat: 18.7606, lng: 73.8567, stage: 'APPROACHING_DESTINATION' },
  { name: 'Pune Produce Market Yard', lat: 18.4900, lng: 73.8650, stage: 'ARRIVED_DESTINATION' },
];

export function getSimulatedTruckLocation(progressFraction: number): {
  lat: number;
  lng: number;
  currentWaypoint: Waypoint;
  nextWaypoint?: Waypoint;
} {
  const clamped = Math.max(0, Math.min(1, progressFraction));
  const totalSegments = ORANGES_ROUTE_WAYPOINTS.length - 1;
  const rawIdx = clamped * totalSegments;
  const currentIdx = Math.floor(rawIdx);
  const nextIdx = Math.min(currentIdx + 1, totalSegments);
  const segmentT = rawIdx - currentIdx;

  const p1 = ORANGES_ROUTE_WAYPOINTS[currentIdx];
  const p2 = ORANGES_ROUTE_WAYPOINTS[nextIdx];

  const lat = p1.lat + (p2.lat - p1.lat) * segmentT;
  const lng = p1.lng + (p2.lng - p1.lng) * segmentT;

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    currentWaypoint: p1,
    nextWaypoint: p2,
  };
}
