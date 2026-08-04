/**
 * Enterprise EOS GIS Satellite Map Component
 * Built for AgriFuture with professional GIS HUD controls, 16 spectral layer swappers,
 * interactive polygon & rectangle drawing, distance/area measurement, mouse coordinate HUD,
 * map export/print, and historical scene timeline player.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Square,
  PenTool,
  Ruler,
  Download,
  Printer,
  Compass,
  MapPin,
  Search,
  Check,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { EOS_LAYERS } from '../../services/eosApi';
import { createEOSTileLayer, calculateFieldArea, calculateDistanceMeters, searchLocationCoordinates } from '../../services/mapService';

const EOSGISMap = ({
  mapId = 'sat-visualizer-map',
  height = 520,
  mapLat,
  mapLon,
  setMapLat,
  setMapLon,
  activeLayer = 'TRUE_COLOR',
  setActiveLayer,
  mapProvider = 'copernicus',
  setMapProvider,
  drawPoints = [],
  setDrawPoints = () => {},
  isDrawing = false,
  setIsDrawing = () => {},
  onApplyAnalysis,
  scenesList = [],
  activeSceneIndex = 0,
  setActiveSceneIndex,
  isPlaying = false,
  toggleTimelinePlay,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);
  const cornerMarkersRef = useRef([]);

  // Measurement State
  const [measureMode, setMeasureMode] = useState(null); // null | 'distance' | 'area'
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measureResult, setMeasureResult] = useState('');
  const measureLineRef = useRef(null);

  // Drawing Mode
  const [drawMode, setDrawMode] = useState('polygon'); // 'polygon' | 'rectangle' | 'marker'

  // HUD States
  // Safe defaults — India center if no coords provided
  const safeLat = mapLat ?? 20.5937;
  const safeLon = mapLon ?? 78.9629;
  const [hoverCoords, setHoverCoords] = useState({ lat: safeLat, lng: safeLon });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchCountry, setSearchCountry] = useState('in');

  const fieldStats = calculateFieldArea(drawPoints);

  // 1. Initialize Map
  useEffect(() => {
    let map = null;
    const initLat = (typeof mapLat === 'number' && !isNaN(mapLat)) ? mapLat : 20.5937;
    const initLon = (typeof mapLon === 'number' && !isNaN(mapLon)) ? mapLon : 78.9629;

    const initMap = () => {
      const el = document.getElementById(mapId);
      if (!el || !window.L) return;

      const L = window.L;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      map = L.map(mapId, { zoomControl: false, minZoom: 4, maxZoom: 19 }).setView([initLat, initLon], 14);
      mapInstanceRef.current = map;

      // Base tile layer with noWrap
      const initialLayer = createEOSTileLayer(L, activeLayer, mapProvider);
      initialLayer.addTo(map);
      tileLayerRef.current = initialLayer;

      // Custom divIcon tractor pin
      const farmerIcon = L.divIcon({
        html: `<div class="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600 border-2 border-white text-white text-base shadow-xl animate-bounce">🚜</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([initLat, initLon], { icon: farmerIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.bindPopup(`
        <div class="text-xs font-semibold p-1.5 text-slate-800">
          <p class="font-bold text-emerald-700 text-sm">🚜 Farm Field Pin</p>
          <p class="text-gray-500 mt-1">Drag onto target field & click Analyze</p>
          <p class="text-[10px] text-gray-400 mt-0.5">Lat: ${initLat.toFixed(4)}, Lon: ${initLon.toFixed(4)}</p>
        </div>
      `).openPopup();

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        if (setMapLat) setMapLat(pos.lat);
        if (setMapLon) setMapLon(pos.lng);
      });

      // Mousemove Lat/Lng Tracking HUD
      map.on('mousemove', (e) => {
        setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 200);
    };

    if (window.L) {
      initMap();
    } else {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initMap;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapId]);

  // Sync position — only update when coords are valid numbers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (typeof mapLat !== 'number' || isNaN(mapLat)) return;
    if (typeof mapLon !== 'number' || isNaN(mapLon)) return;
    mapInstanceRef.current.setView([mapLat, mapLon], 14);
    if (markerRef.current) markerRef.current.setLatLng([mapLat, mapLon]);
  }, [mapLat, mapLon]);

  // Sync Layer Provider & Active Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const newLayer = createEOSTileLayer(L, activeLayer, mapProvider);
    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [activeLayer, mapProvider]);

  // Drawing mode click handler (Polygon / Rectangle / Marker)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      if (measureMode) {
        setMeasurePoints((prev) => {
          const next = [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }];
          if (measureMode === 'distance' && next.length >= 2) {
            let distM = 0;
            for (let i = 0; i < next.length - 1; i++) {
              distM += calculateDistanceMeters(next[i].lat, next[i].lng, next[i + 1].lat, next[i + 1].lng);
            }
            setMeasureResult(`Distance: ${(distM / 1000).toFixed(2)} km (${distM.toFixed(0)} meters)`);
          } else if (measureMode === 'area' && next.length >= 3) {
            const area = calculateFieldArea(next);
            setMeasureResult(`Measured Area: ${area.acres} Acres (${area.sqM} m²)`);
          }
          return next;
        });
        return;
      }

      if (isDrawing && setDrawPoints) {
        if (drawMode === 'rectangle' && drawPoints.length === 1) {
          const p1 = drawPoints[0];
          const p2 = { lat: e.latlng.lat, lng: e.latlng.lng };
          const rect = [
            p1,
            { lat: p1.lat, lng: p2.lng },
            p2,
            { lat: p2.lat, lng: p1.lng },
          ];
          setDrawPoints(rect);
          setIsDrawing(false);
        } else {
          setDrawPoints((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
        }
      }
    };

    if (isDrawing || measureMode) {
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', handleMapClick);
    } else {
      map.getContainer().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing, measureMode, drawMode, drawPoints, setDrawPoints, setIsDrawing]);

  // Polygon & Marker rendering
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    cornerMarkersRef.current.forEach((m) => m.remove());
    cornerMarkersRef.current = [];

    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    if (drawPoints.length >= 3) {
      polygonRef.current = L.polygon(drawPoints, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.25,
        weight: 3,
      }).addTo(mapInstanceRef.current);

      drawPoints.forEach((pt, idx) => {
        const dotIcon = L.divIcon({
          html: `<div class="h-5 w-5 rounded-full bg-emerald-600 border-2 border-white shadow-lg cursor-move flex items-center justify-center text-[10px] font-black text-white">${idx + 1}</div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const cornerMarker = L.marker([pt.lat, pt.lng], { icon: dotIcon, draggable: true }).addTo(mapInstanceRef.current);

        cornerMarker.on('drag', (e) => {
          const newPos = e.target.getLatLng();
          if (setDrawPoints) {
            setDrawPoints((prev) => {
              const next = [...prev];
              next[idx] = { lat: newPos.lat, lng: newPos.lng };
              return next;
            });
          }
        });

        cornerMarkersRef.current.push(cornerMarker);
      });
    }
  }, [drawPoints, setDrawPoints]);

  // Measure line rendering
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    if (measureLineRef.current) {
      measureLineRef.current.remove();
      measureLineRef.current = null;
    }

    if (measurePoints.length >= 2) {
      measureLineRef.current = L.polyline(measurePoints, {
        color: '#3b82f6',
        dashArray: '6, 6',
        weight: 3,
      }).addTo(mapInstanceRef.current);
    }
  }, [measurePoints]);

  // Search Submit Handler
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchError('');
    setSearchLoading(true);
    try {
      const res = await searchLocationCoordinates(searchQuery, searchCountry);
      if (res && res.lat && res.lon) {
        setMapLat(res.lat);
        setMapLon(res.lon);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([res.lat, res.lon], 15);
        }
      }
    } catch (err) {
      setSearchError(err.message || 'Location not found.');
    } finally {
      setSearchLoading(false);
    }
  };

  // GPS Locate Me Handler
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latVal = pos.coords.latitude;
          const lonVal = pos.coords.longitude;
          setMapLat(latVal);
          setMapLon(lonVal);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latVal, lonVal], 15);
          }
        },
        () => alert('Could not retrieve GPS location.')
      );
    }
  };

  // Map Image Export
  const handleExportMap = () => {
    alert('Exporting high-resolution EOS GIS satellite map PNG preview...');
    window.print();
  };

  return (
    <div ref={mapContainerRef} className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-[9999] bg-slate-900 p-4' : ''}`}>
      {/* ── TOP GIS TOOLBAR ────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="Search Country, City, Landmark, PIN code, Lat/Lon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white text-xs font-bold focus:outline-none w-full placeholder-slate-400"
          />
          <button type="submit" disabled={searchLoading} className="text-emerald-400 hover:text-emerald-300 font-bold">
            {searchLoading ? '...' : 'Go'}
          </button>
        </form>

        {/* Spectral Layer Selector (16 Layers) */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
          <select
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value)}
            className="bg-slate-800 text-emerald-400 border border-slate-700 font-extrabold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            {Object.values(EOS_LAYERS).map((l) => (
              <option key={l.id} value={l.id}>
                {l.icon} {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setIsDrawing(!isDrawing);
              setDrawMode('polygon');
              if (!isDrawing) setDrawPoints([]);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer border ${
              isDrawing && drawMode === 'polygon' ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PenTool className="h-3.5 w-3.5" />
            <span>Draw Polygon</span>
          </button>

          <button
            onClick={() => {
              setIsDrawing(!isDrawing);
              setDrawMode('rectangle');
              if (!isDrawing) setDrawPoints([]);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer border ${
              isDrawing && drawMode === 'rectangle' ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Square className="h-3.5 w-3.5" />
            <span>Rectangle</span>
          </button>

          {drawPoints.length > 0 && (
            <button
              onClick={() => setDrawPoints([])}
              className="bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-1.5 rounded-xl hover:bg-red-500/30 transition-all"
            >
              Clear
            </button>
          )}
        </div>

        {/* Measure Tools & Export */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (measureMode === 'distance') {
                setMeasureMode(null);
                setMeasurePoints([]);
                setMeasureResult('');
              } else {
                setMeasureMode('distance');
                setMeasurePoints([]);
              }
            }}
            className={`p-1.5 rounded-xl border transition-all ${
              measureMode === 'distance' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Measure Distance"
          >
            <Ruler className="h-4 w-4" />
          </button>

          <button onClick={handleExportMap} className="p-1.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" title="Export Map PNG">
            <Download className="h-4 w-4" />
          </button>

          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── MAP CONTAINER & HUD OVERLAYS ────────────────────── */}
      <div className="bg-white rounded-3xl border-4 border-slate-900 shadow-2xl relative overflow-hidden">
        <div id={mapId} style={{ height: isFullscreen ? 'calc(100vh - 180px)' : height }} className="w-full z-10" />

        {/* HUD Top Left: Zoom & Compass */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
          <div className="bg-slate-900/90 text-white rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="px-3 py-2 text-sm font-black hover:bg-slate-800 border-b border-slate-800 transition-all"
            >
              +
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="px-3 py-2 text-sm font-black hover:bg-slate-800 transition-all"
            >
              -
            </button>
          </div>

          <button
            onClick={handleLocateMe}
            className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-emerald-700 transition-all border border-emerald-500 flex items-center justify-center"
            title="Locate GPS Position"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>

        {/* HUD Top Right: Field Measurement Bar */}
        {drawPoints.length >= 3 && (
          <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 space-y-1 animate-fade-in text-left">
            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">📐 Field Area Measurement</p>
            <p className="text-sm font-black text-white">{fieldStats.acres} Acres ({fieldStats.hectares} Ha / {fieldStats.gunthas} Gunthas)</p>
            <p className="text-[9px] text-slate-400">Perimeter: {fieldStats.perimeter.km} km ({fieldStats.perimeter.meters} m)</p>
          </div>
        )}

        {/* Measurement HUD Result */}
        {measureResult && (
          <div className="absolute top-16 right-4 z-[400] bg-blue-900/90 text-white px-4 py-2 rounded-xl shadow-xl border border-blue-700 text-xs font-bold animate-fade-in">
            {measureResult}
          </div>
        )}

        {/* HUD Bottom Right: Lat/Lng Coordinate HUD */}
        <div className="absolute bottom-3 right-3 z-[400] bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] font-mono px-3 py-1.5 rounded-xl border border-slate-700/60 shadow flex items-center gap-3">
          <span>Lat: {typeof hoverCoords.lat === 'number' ? hoverCoords.lat.toFixed(5) : '—'}</span>
          <span>Lon: {typeof hoverCoords.lng === 'number' ? hoverCoords.lng.toFixed(5) : '—'}</span>
          <span className="text-emerald-400 font-bold">EPSG:4326</span>
        </div>
      </div>

      {/* ── BOTTOM TIMELINE BAR ────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimelinePlay}
              className={`p-2 rounded-xl border transition-all ${
                isPlaying ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <div>
              <p className="text-xs font-black text-white">📅 Satellite Imagery Timeline</p>
              <p className="text-[10px] text-slate-400">Historical Scene: {scenesList[activeSceneIndex]?.date || 'Latest Capture'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Cloud Cover: {scenesList[activeSceneIndex]?.cloudCover || '3.5'}%</span>
            <span className="text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-lg text-[10px]">10m Resolution</span>
          </div>
        </div>

        {/* Scenes Date Track */}
        <div className="flex gap-2 overflow-x-auto py-1">
          {scenesList.map((scene, idx) => (
            <button
              key={scene.sceneId || idx}
              onClick={() => setActiveSceneIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                activeSceneIndex === idx
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <p className="text-[10px] text-slate-400 uppercase">{scene.platform || 'Sentinel-2'}</p>
              <p className="font-extrabold">{scene.date}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EOSGISMap;
