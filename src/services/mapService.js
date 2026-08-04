/**
 * GIS Map Service for Leaflet & EOS Satellite Integration
 * Provides perimeter calculation, distance measurement, polygon & rectangle drawing,
 * map export, and geocoding search resolution.
 */

import axios from 'axios';
import { getEOSTileUrl, EOS_LAYERS } from './eosApi';

/**
 * Calculates geodesic distance between two Lat/Lon points in meters
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
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
 * Calculates perimeter of a closed field polygon in meters and kilometers
 */
export const calculateFieldPerimeter = (points) => {
  if (!points || points.length < 2) return { meters: 0, km: 0 };
  let totalDist = 0;
  for (let i = 0; i < points.length; i++) {
    const nextIdx = (i + 1) % points.length;
    totalDist += calculateDistanceMeters(
      points[i].lat,
      points[i].lng || points[i].lon,
      points[nextIdx].lat,
      points[nextIdx].lng || points[nextIdx].lon
    );
  }
  return {
    meters: parseFloat(totalDist.toFixed(1)),
    km: parseFloat((totalDist / 1000).toFixed(2)),
  };
};

/**
 * Calculates accurate field polygon surface area & centroid
 */
export const calculateFieldArea = (points) => {
  if (!points || points.length < 3) {
    return { sqM: 0, acres: 0, hectares: 0, gunthas: 0, perimeter: { meters: 0, km: 0 } };
  }

  const refLat = points[0].lat;
  const refLon = points[0].lng || points[0].lon;
  const R_LAT = 111320;
  const R_LON = 111320 * Math.cos((refLat * Math.PI) / 180);

  const projected = points.map((p) => ({
    x: ((p.lng || p.lon) - refLon) * R_LON,
    y: (p.lat - refLat) * R_LAT,
  }));

  let area = 0;
  let cx = 0;
  let cy = 0;
  const numPoints = projected.length;

  for (let i = 0; i < numPoints; i++) {
    const j = (i + 1) % numPoints;
    const factor = projected[i].x * projected[j].y - projected[j].x * projected[i].y;
    area += factor;
    cx += (projected[i].x + projected[j].x) * factor;
    cy += (projected[i].y + projected[j].y) * factor;
  }

  const sqM = Math.abs(area) / 2.0;
  const acres = sqM / 4046.86;
  const hectares = sqM / 10000;
  const gunthas = sqM / 101.17;
  const perimeter = calculateFieldPerimeter(points);

  const centerLon = refLon + (sqM !== 0 ? cx / (6 * (area / 2.0)) / R_LON : 0);
  const centerLat = refLat + (sqM !== 0 ? cy / (6 * (area / 2.0)) / R_LAT : 0);

  return {
    sqM: parseFloat(sqM.toFixed(2)),
    acres: parseFloat(acres.toFixed(2)),
    hectares: parseFloat(hectares.toFixed(2)),
    gunthas: parseFloat(gunthas.toFixed(0)),
    perimeter,
    center: { lat: centerLat || refLat, lon: centerLon || refLon },
  };
};

/**
 * Resolves search queries (Village, City, Landmark, State, District, PIN Code) to Lat/Lon
 */
export const searchLocationCoordinates = async (query, countryCode = 'in') => {
  if (!query || !query.trim()) {
    throw new Error('Please enter a location query.');
  }

  const isPincode = /^\d{6}$/.test(query.trim());

  if (isPincode) {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(query.trim())}&countrycodes=${countryCode}&format=json`,
        { headers: { 'User-Agent': 'AgriFutureEOSMap/1.0' }, timeout: 6000 }
      );
      if (res.data && res.data.length > 0) {
        return {
          lat: parseFloat(res.data[0].lat),
          lon: parseFloat(res.data[0].lon),
          address: res.data[0].display_name,
        };
      }
    } catch (e) {
      console.warn('Direct postal code search failed, trying fallback search...', e.message);
    }

    if (countryCode === 'in') {
      const postRes = await axios.get(`https://api.postalpincode.in/pincode/${query.trim()}`);
      if (postRes.data && postRes.data[0] && postRes.data[0].Status === 'Success') {
        const po = postRes.data[0].PostOffice[0];
        const combinedQuery = `${po.Name}, ${po.District}, ${po.State}, India`;
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(combinedQuery)}&format=json`,
          { headers: { 'User-Agent': 'AgriFutureEOSMap/1.0' }, timeout: 6000 }
        );
        if (res.data && res.data.length > 0) {
          return {
            lat: parseFloat(res.data[0].lat),
            lon: parseFloat(res.data[0].lon),
            address: `${query.trim()} - ${po.Name}, ${po.District}, ${po.State}`,
          };
        }
      }
    }
  }

  const res = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&countrycodes=${countryCode}&format=json&limit=1`,
    { headers: { 'User-Agent': 'AgriFutureEOSMap/1.0' }, timeout: 6000 }
  );

  if (res.data && res.data.length > 0) {
    return {
      lat: parseFloat(res.data[0].lat),
      lon: parseFloat(res.data[0].lon),
      address: res.data[0].display_name,
    };
  }

  throw new Error('Location not found. Please try entering a more specific place or district name.');
};

/**
 * Creates Leaflet Tile Layer for EOS spectral indices or Esri base imagery.
 *
 * Tile layers are loaded as <img> tags by Leaflet — they bypass CORS.
 * So EOS tile URLs (with api_key param) can be called directly from the browser.
 *
 * Layer strategy:
 *   - TRUE_COLOR / NATURAL_COLOR / STREET_MAP → ESRI World Imagery (best quality base)
 *   - NDVI, EVI, NDRE, MSAVI, NDWI, etc. → EOS render.eos.com spectral tiles
 *   - HYBRID → EOX Sentinel-2 cloudless mosaic
 */
export const createEOSTileLayer = (L, layerId = 'TRUE_COLOR', mapProvider = 'copernicus') => {
  const EOS_API_KEY =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EOS_API_KEY) || '';

  // ESRI forced provider
  if (mapProvider === 'esri') {
    return L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Esri World Imagery', maxZoom: 19, maxNativeZoom: 19, noWrap: true }
    );
  }

  // EOX Sentinel-2 cloudless provider
  if (mapProvider === 'eox' || layerId === 'HYBRID') {
    return L.tileLayer(
      'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg',
      { attribution: '&copy; EOX IT Services | Sentinel-2 Cloudless', maxZoom: 19, maxNativeZoom: 14, noWrap: true }
    );
  }

  // Base visual layers → use ESRI high-res imagery (better quality than EOS True Color tiles)
  const BASE_LAYERS = ['TRUE_COLOR', 'NATURAL_COLOR', 'STREET_MAP', 'ELEVATION', 'TERRAIN'];
  if (BASE_LAYERS.includes(layerId)) {
    return L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri World Imagery | AgriFuture GIS',
        maxZoom: 19,
        maxNativeZoom: 19,
        noWrap: true,
      }
    );
  }

  // Spectral index layers (NDVI, EVI, NDRE, MSAVI, NDWI, etc.) → EOS Live Tile API
  const layer = EOS_LAYERS[layerId] || EOS_LAYERS.NDVI;
  const eosUrl = EOS_API_KEY
    ? `https://render.eos.com/api/render/${layer.eosBand}/{z}/{x}/{y}?api_key=${EOS_API_KEY}&colormap=RdYlGn`
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  return L.tileLayer(eosUrl, {
    attribution: `EOS Data Analytics | ${layer.name}`,
    maxZoom: 18,
    maxNativeZoom: 14,
    noWrap: true,
    opacity: 0.9,
    // Fallback to ESRI if EOS tile fails to load
    errorTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/4/6/10',
  });
};
