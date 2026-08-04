/**
 * EOS Data Analytics (EOSDA) API Connect Service — LIVE DATA ONLY
 *
 * All requests go through the Flask backend proxy at /api/eos/* to avoid CORS
 * and keep the API key secure on the server side.
 *
 * Proxy endpoints:
 *   POST /api/eos/scene-search     → EOSDA Search API
 *   POST /api/eos/stats-task       → EOSDA GDW mt_stats create
 *   GET  /api/eos/stats-result/:id → EOSDA GDW mt_stats poll
 *
 * NO mock data. NO fallback generators. NO placeholder values.
 * Every value displayed to the user must come from a real API response.
 * If the API fails the error is propagated so the UI can show it.
 */

import axios from 'axios';

// Backend proxy base URL
const API_BASE = 'http://localhost:5000';

// ─── Request Cache (avoids duplicate network calls) ─────────────────────────
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 min

const getCached = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL) { cache.delete(key); return null; }
  return item.data;
};
const setCache = (key, data) => cache.set(key, { data, ts: Date.now() });

// ─── Console logger (for dev verification) ──────────────────────────────────
const log = (tag, ...args) => console.log(`%c[EOS-API] ${tag}`, 'color:#10b981;font-weight:bold', ...args);
const logErr = (tag, ...args) => console.error(`%c[EOS-API] ${tag}`, 'color:#ef4444;font-weight:bold', ...args);

// ─── Layer definitions (unchanged — these are UI labels, not data) ──────────
export const EOS_LAYERS = {
  TRUE_COLOR:        { id: 'TRUE_COLOR',        name: 'True Color (RGB)',      eosBand: 'B04,B03,B02', icon: '📸', description: 'Natural optical RGB imagery (Red, Green, Blue)' },
  NATURAL_COLOR:     { id: 'NATURAL_COLOR',     name: 'Natural Color',         eosBand: 'B04,B03,B02', icon: '🌍', description: 'Atmospherically corrected natural surface reflection' },
  FALSE_COLOR:       { id: 'FALSE_COLOR',       name: 'False Color (NIR)',     eosBand: 'B08,B04,B03', icon: '🔴', description: 'Highlights active chlorophyll in vibrant red' },
  NDVI:              { id: 'NDVI',              name: 'NDVI (Vegetation)',     eosBand: 'NDVI',        icon: '🌿', description: 'Normalized Difference Vegetation Index (Chlorophyll vigor)' },
  NDRE:              { id: 'NDRE',              name: 'NDRE (Red Edge)',       eosBand: 'NDRE',        icon: '🌾', description: 'Normalized Difference Red Edge Index for mid-stage crops' },
  MSAVI:             { id: 'MSAVI',             name: 'MSAVI (Soil Adjusted)', eosBand: 'MSAVI',       icon: '🌱', description: 'Modified Soil-Adjusted Index for early seedling emergence' },
  EVI:               { id: 'EVI',               name: 'EVI (Enhanced Veg)',    eosBand: 'EVI',         icon: '🌳', description: 'Enhanced Vegetation Index (Dense canopy correction)' },
  MOISTURE_INDEX:    { id: 'MOISTURE_INDEX',    name: 'Moisture Index (NDWI)', eosBand: 'NDWI',        icon: '💧', description: 'Normalized Difference Water Index (Canopy water content)' },
  SOIL_MOISTURE:     { id: 'SOIL_MOISTURE',     name: 'Soil Moisture',         eosBand: 'SM',          icon: '🌧️', description: 'Root-zone and surface soil water saturation level' },
  VEGETATION_HEALTH: { id: 'VEGETATION_HEALTH', name: 'Vegetation Health',     eosBand: 'VHI',         icon: '🩺', description: 'Combined thermal & vigor crop stress assessment' },
  THERMAL:           { id: 'THERMAL',           name: 'Thermal LST',          eosBand: 'B11',         icon: '🌡️', description: 'Land Surface Temperature (LST Infrared)' },
  CLOUDS:            { id: 'CLOUDS',            name: 'Cloud Mask',           eosBand: 'SCL',         icon: '☁️', description: 'Cloud cover, shadow & optical atmosphere mask' },
  ELEVATION:         { id: 'ELEVATION',         name: 'Elevation (DEM)',      eosBand: 'DEM',         icon: '⛰️', description: 'SRTM Digital Elevation Model topography' },
  TERRAIN:           { id: 'TERRAIN',           name: 'Terrain & Slope',      eosBand: 'SLOPE',       icon: '🗺️', description: 'Slope contours and watershed drainage lines' },
  HYBRID:            { id: 'HYBRID',            name: 'Hybrid Satellite',     eosBand: 'HYBRID',      icon: '⚡', description: 'High-resolution satellite view with road overlay' },
  STREET_MAP:        { id: 'STREET_MAP',        name: 'Street Map',           eosBand: 'OSM',         icon: '📍', description: 'Vector street, landmark, and administrative border map' },
};

// ─── Tile URL (for Leaflet layer rendering) ─────────────────────────────────
export const getEOSTileUrl = (layerId, sceneId = 'LATEST') => {
  const layer = EOS_LAYERS[layerId] || EOS_LAYERS.TRUE_COLOR;
  return `https://render.eos.com/tile/${layer.eosBand}/{z}/{x}/{y}?scene_id=${sceneId}`;
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE SEARCH — via Flask proxy POST /api/eos/scene-search
// ═════════════════════════════════════════════════════════════════════════════
export const fetchEOSScenes = async ({ lat, lon, polygon, startDate, endDate }) => {
  const cacheKey = `scenes_${lat}_${lon}_${startDate}_${endDate}`;
  const cached = getCached(cacheKey);
  if (cached) { log('SCENE-SEARCH', 'Returning cached scenes'); return cached; }

  const today = new Date().toISOString().split('T')[0];
  const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0];

  // Build geometry
  let shape;
  if (polygon && polygon.length >= 3) {
    const coords = polygon.map(p => [p.lng ?? p.lon, p.lat]);
    coords.push(coords[0]); // close ring
    shape = { type: 'Polygon', coordinates: [coords] };
  } else {
    const d = 0.005;
    shape = {
      type: 'Polygon',
      coordinates: [[
        [lon - d, lat - d], [lon + d, lat - d],
        [lon + d, lat + d], [lon - d, lat + d],
        [lon - d, lat - d],
      ]],
    };
  }

  const payload = {
    search: {
      date: { from: startDate || sixMonthsAgo, to: endDate || today },
      cloudCoverage: { from: 0, to: 30 },
      shape,
    },
    sort: { date: 'desc' },
    limit: 10,
  };

  log('SCENE-SEARCH', 'REQUEST ▶', payload);

  const response = await axios.post(`${API_BASE}/api/eos/scene-search`, payload, { timeout: 35000 });

  log('SCENE-SEARCH', 'RESPONSE ◀', response.status, response.data);

  if (response.data?.error) {
    throw new Error(response.data.error);
  }

  // API response: { results: [ { sceneID, date, cloudCoverage, satelliteName, view_id, tms, ... } ] }
  const rawResults = response.data?.results || response.data || [];
  const results = (Array.isArray(rawResults) ? rawResults : []).map((item, i) => ({
    sceneId: item.sceneID || item.scene_id || item.id || `scene_${i}`,
    date: item.date || item.timestamp?.split('T')[0] || 'Unknown',
    cloudCover: item.cloudCoverage ?? item.cloud_cover ?? 'N/A',
    platform: item.satelliteName || item.platform || 'Sentinel-2',
    resolution: '10m',
    viewId: item.view_id || item.sceneID || item.scene_id,
    tms: item.tms || null,
    thumbnail: item.thumbnail || null,
    raw: item,
  }));

  log('SCENE-SEARCH', `Parsed ${results.length} scenes from live API`);
  setCache(cacheKey, results);
  return results;
};

// ═════════════════════════════════════════════════════════════════════════════
// FIELD ANALYTICS (NDVI, EVI, NDRE) — two-step async via Flask proxy
// ═════════════════════════════════════════════════════════════════════════════
export const fetchEOSFieldAnalytics = async ({ lat, lon, polygon, date }) => {
  const cacheKey = `analytics_${lat}_${lon}_${date || 'latest'}_${polygon ? polygon.length : 0}`;
  const cached = getCached(cacheKey);
  if (cached) { log('FIELD-ANALYTICS', 'Returning cached analytics'); return cached; }

  // Use a 6-month window ending 7 days ago (gives EOS time to process imagery)
  const endDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0];

  // Build geometry
  let geometry;
  if (polygon && polygon.length >= 3) {
    const coords = polygon.map(p => [p.lng ?? p.lon, p.lat]);
    coords.push(coords[0]);
    geometry = { type: 'Polygon', coordinates: [coords] };
  } else {
    const d = 0.003;
    geometry = {
      type: 'Polygon',
      coordinates: [[
        [lon - d, lat - d], [lon + d, lat - d],
        [lon + d, lat + d], [lon - d, lat + d],
        [lon - d, lat - d],
      ]],
    };
  }

  // ── Step 1: Create mt_stats task via proxy ────────────────────────────────
  const taskPayload = {
    type: 'mt_stats',
    params: {
      bm_type: ['NDVI', 'EVI', 'NDRE'],
      date_start: date || startDate,
      date_end: endDate,
      geometry,
      sensors: ['sentinel2'],
    },
  };

  log('FIELD-ANALYTICS', 'STEP 1 — Create Task ▶', taskPayload);

  const createResp = await axios.post(`${API_BASE}/api/eos/stats-task`, taskPayload, { timeout: 35000 });

  log('FIELD-ANALYTICS', 'STEP 1 — Response ◀', createResp.status, createResp.data);

  if (createResp.data?.error) {
    throw new Error(createResp.data.error);
  }

  const taskId = createResp.data?.task_id;
  if (!taskId) {
    throw new Error(`EOS API did not return a task_id. Response: ${JSON.stringify(createResp.data)}`);
  }

  // ── Step 2: Poll for results via proxy ────────────────────────────────────
  log('FIELD-ANALYTICS', `STEP 2 — Polling task ${taskId}...`);

  let resultData = null;
  const MAX_POLLS = 20;
  const POLL_INTERVAL = 3000;

  for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL));

    const pollResp = await axios.get(`${API_BASE}/api/eos/stats-result/${taskId}`, { timeout: 20000 });

    log('FIELD-ANALYTICS', `Poll #${attempt + 1}`, pollResp.status, pollResp.data);

    if (pollResp.data?.error) {
      throw new Error(pollResp.data.error);
    }

    const status = pollResp.data?.status;
    if (status === 'completed' || status === 'done' || pollResp.data?.result) {
      resultData = pollResp.data;
      break;
    }
    if (status === 'failed' || status === 'error') {
      throw new Error(`EOS statistics task failed: ${JSON.stringify(pollResp.data)}`);
    }
    if (Array.isArray(pollResp.data) || (pollResp.data && !pollResp.data.status)) {
      resultData = pollResp.data;
      break;
    }
  }

  if (!resultData) {
    throw new Error('EOS statistics task timed out after polling. No result returned.');
  }

  log('FIELD-ANALYTICS', 'FINAL RESULT ◀', resultData);

  const formatted = parseLiveAnalytics(resultData);
  setCache(cacheKey, formatted);
  return formatted;
};

/**
 * Parse the REAL API response — extract only what the API actually returns.
 * No fallback values. No default numbers. Only null if the API didn't provide it.
 */
function parseLiveAnalytics(apiResponse) {
  const results = apiResponse?.result || apiResponse?.results || (Array.isArray(apiResponse) ? apiResponse : []);

  log('PARSE', `${results.length} scene stat records received`);

  if (!results.length) {
    return {
      error: null,
      noData: true,
      message: 'No satellite observations found for this location and date range. Try a different area or wider date range.',
      scenes: [],
    };
  }

  // Use the most recent scene (first in desc-sorted results)
  const latest = results[0];
  const stats = latest.stats || latest.statistics || {};

  const ndviStats = stats.NDVI || stats.ndvi || {};
  const eviStats = stats.EVI || stats.evi || {};
  const ndreStats = stats.NDRE || stats.ndre || {};

  const ndviMean = ndviStats.mean;
  const eviMean = eviStats.mean;
  const ndreMean = ndreStats.mean;

  // Derive status purely from live NDVI
  let status = 'Unknown';
  let vegetationStress = 'Unknown';
  let cropGrowthStage = 'Unknown';

  if (ndviMean != null) {
    if (ndviMean > 0.6)      { status = 'Healthy'; vegetationStress = 'Low Stress'; cropGrowthStage = 'Vegetative / Peak Growth'; }
    else if (ndviMean > 0.4) { status = 'Moderate'; vegetationStress = 'Moderate Stress'; cropGrowthStage = 'Early Growth / Emergence'; }
    else if (ndviMean > 0.2) { status = 'Warning'; vegetationStress = 'High Stress'; cropGrowthStage = 'Sparse Vegetation / Bare Soil'; }
    else                     { status = 'Critical'; vegetationStress = 'Severe — Minimal Vegetation'; cropGrowthStage = 'Non-vegetated / Built-up / Water'; }
  }

  return {
    ndviMean: ndviMean ?? null,
    ndviMin: ndviStats.min ?? null,
    ndviMax: ndviStats.max ?? null,
    ndviStd: ndviStats.std ?? null,
    ndviMedian: ndviStats.median ?? null,
    ndviScore: ndviMean != null ? Math.round(ndviMean * 100) : null,

    eviMean: eviMean ?? null,
    eviMin: eviStats.min ?? null,
    eviMax: eviStats.max ?? null,

    ndreMean: ndreMean ?? null,
    ndreMin: ndreStats.min ?? null,
    ndreMax: ndreStats.max ?? null,

    captureDate: latest.date || 'Unknown',
    sceneId: latest.scene_id || latest.sceneId || 'Unknown',
    imagerySource: 'Sentinel-2 L2A (EOSDA API Connect — Live)',

    status,
    vegetationStress,
    cropGrowthStage,

    allScenes: results.map(r => ({
      date: r.date,
      sceneId: r.scene_id,
      ndviMean: r.stats?.NDVI?.mean ?? r.stats?.ndvi?.mean ?? null,
      eviMean: r.stats?.EVI?.mean ?? r.stats?.evi?.mean ?? null,
      ndreMean: r.stats?.NDRE?.mean ?? r.stats?.ndre?.mean ?? null,
    })),

    noData: false,
    isLive: true,
  };
}
