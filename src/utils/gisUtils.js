/**
 * GIS Utility Functions for AgriFuture Satellite Hub
 * Provides accurate geodesic area/perimeter math, centroid calculation,
 * coordinate formatting, and GeoJSON export tools.
 */

/**
 * Calculates geodesic distance between two points in meters using Haversine formula
 */
export const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculates total perimeter of a polygon in meters and kilometers
 */
export const getPolygonPerimeter = (points = []) => {
  if (!points || points.length < 2) return { meters: 0, km: 0, text: '0 m' };

  let totalMeters = 0;
  for (let i = 0; i < points.length; i++) {
    const nextIdx = (i + 1) % points.length;
    const p1 = points[i];
    const p2 = points[nextIdx];
    totalMeters += getDistanceMeters(
      p1.lat,
      p1.lng ?? p1.lon,
      p2.lat,
      p2.lng ?? p2.lon
    );
  }

  const meters = parseFloat(totalMeters.toFixed(1));
  const km = parseFloat((totalMeters / 1000).toFixed(2));
  const text = meters >= 1000 ? `${km} km` : `${meters} m`;

  return { meters, km, text };
};

/**
 * Calculates geodesic area of a polygon using planar projection centered at polygon centroid
 */
export const getPolygonArea = (points = []) => {
  if (!points || points.length < 3) {
    return {
      sqM: 0,
      acres: 0,
      hectares: 0,
      gunthas: 0,
      bigha: 0,
      formatted: '0 Acres',
      perimeter: { meters: 0, km: 0, text: '0 m' },
      centroid: null,
    };
  }

  const refLat = points[0].lat;
  const refLon = points[0].lng ?? points[0].lon;
  const R_LAT = 111320; // meters per degree latitude
  const R_LON = 111320 * Math.cos((refLat * Math.PI) / 180); // meters per degree longitude

  // Project lat/lon to local meters (X/Y)
  const projected = points.map((p) => ({
    x: ((p.lng ?? p.lon) - refLon) * R_LON,
    y: (p.lat - refLat) * R_LAT,
  }));

  let area = 0;
  let cx = 0;
  let cy = 0;
  const n = projected.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const factor = projected[i].x * projected[j].y - projected[j].x * projected[i].y;
    area += factor;
    cx += (projected[i].x + projected[j].x) * factor;
    cy += (projected[i].y + projected[j].y) * factor;
  }

  const sqM = Math.abs(area) / 2.0;
  const acres = sqM / 4046.86;
  const hectares = sqM / 10000;
  const gunthas = sqM / 101.17;
  const bigha = acres / 0.625; // Standard Indian Bigha approx

  const centerLon = refLon + (sqM !== 0 ? cx / (6 * (area / 2.0)) / R_LON : 0);
  const centerLat = refLat + (sqM !== 0 ? cy / (6 * (area / 2.0)) / R_LAT : 0);

  const perimeter = getPolygonPerimeter(points);

  let formatted = `${acres.toFixed(2)} Acres`;
  if (acres < 0.1) {
    formatted = `${sqM.toFixed(0)} sq.m (${gunthas.toFixed(1)} Gunthas)`;
  } else if (acres >= 100) {
    formatted = `${hectares.toFixed(2)} Hectares (${acres.toFixed(1)} Acres)`;
  }

  return {
    sqM: parseFloat(sqM.toFixed(2)),
    acres: parseFloat(acres.toFixed(2)),
    hectares: parseFloat(hectares.toFixed(2)),
    gunthas: parseFloat(gunthas.toFixed(1)),
    bigha: parseFloat(bigha.toFixed(2)),
    formatted,
    perimeter,
    centroid: { lat: centerLat || refLat, lon: centerLon || refLon },
  };
};

/**
 * Converts array of Lat/Lon points to GeoJSON Feature<Polygon>
 */
export const polygonToGeoJSON = (points = [], properties = {}) => {
  if (!points || points.length < 3) return null;
  const coordinates = points.map((p) => [p.lng ?? p.lon, p.lat]);
  // Close polygon
  coordinates.push([points[0].lng ?? points[0].lon, points[0].lat]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
    properties: {
      timestamp: new Date().toISOString(),
      ...properties,
    },
  };
};

/**
 * Format latitude/longitude into human readable degrees string
 */
export const formatCoordinates = (lat, lon) => {
  if (lat == null || lon == null) return '—';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lon).toFixed(5)}° ${lonDir}`;
};
