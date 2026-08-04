import React, { useEffect, useRef, useState } from 'react';
import {
  PenTool,
  RotateCcw,
  RotateCw,
  Trash2,
  CheckCircle2,
  Ruler,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Info,
  Compass,
} from 'lucide-react';
import { getPolygonArea } from '../../utils/gisUtils';
import { EOS_LAYERS } from '../../services/eosApi';

const Step3DrawFarm = ({
  locationState,
  drawPoints,
  setDrawPoints,
  addDrawPoint,
  updateDrawPoint,
  clearPolygon,
  handleUndo,
  handleRedo,
  canUndo,
  canRedo,
  autoClosePolygon,
  isDrawing,
  setIsDrawing,
  activeLayer,
  setActiveLayer,
  onContinue,
  onBack,
}) => {
  const safeLat = locationState?.lat ?? 20.5937;
  const safeLon = locationState?.lon ?? 78.9629;
  const areaStats = getPolygonArea(drawPoints);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonRef = useRef(null);
  const markersRef = useRef([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverCoords, setHoverCoords] = useState({ lat: safeLat, lon: safeLon });

  // Initialize Full GIS Interactive Map — retries until Leaflet is ready
  useEffect(() => {
    const initLat = (typeof safeLat === 'number' && !isNaN(safeLat)) ? safeLat : 20.5937;
    const initLon = (typeof safeLon === 'number' && !isNaN(safeLon)) ? safeLon : 78.9629;

    const doInit = () => {
      const el = mapContainerRef.current;
      if (!el || !window.L) return false;
      const L = window.L;

      if (mapInstanceRef.current) return true; // already init

      const map = L.map(el, {
        zoomControl: false,
        minZoom: 4,
        maxZoom: 19,
      }).setView([initLat, initLon], 16);

      // Base Satellite Tile Layer
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Esri World Imagery | AgriFuture GIS', maxZoom: 19 }
      ).addTo(map);

      // Track Mouse Coordinates
      map.on('mousemove', (e) => {
        setHoverCoords({
          lat: parseFloat(e.latlng.lat.toFixed(5)),
          lon: parseFloat(e.latlng.lng.toFixed(5)),
        });
      });

      // Handle map click when in Drawing mode
      map.on('click', (e) => {
        const pt = {
          lat: parseFloat(e.latlng.lat.toFixed(6)),
          lng: parseFloat(e.latlng.lng.toFixed(6)),
        };
        addDrawPoint(pt);
      });

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
      return true;
    };

    if (!doInit()) {
      // Leaflet not yet ready — poll until it loads
      const interval = setInterval(() => {
        if (doInit()) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [safeLat, safeLon, addDrawPoint]);

  // Sync Polygon & Draggable Vertex Handles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Clear previous polygon
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    // Draw Polygon if at least 2 points
    if (drawPoints.length >= 2) {
      const latLngs = drawPoints.map((p) => [p.lat, p.lng ?? p.lon]);
      polygonRef.current = L.polygon(latLngs, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.35,
        weight: 3.5,
        dashArray: isDrawing ? '6, 6' : undefined,
      }).addTo(map);

      if (drawPoints.length >= 3) {
        polygonRef.current.bindTooltip(
          `<div class="text-xs font-black p-1 text-emerald-900 bg-white shadow-md rounded-lg">
            🌾 Field Size: ${areaStats.acres.toFixed(2)} Acres (${areaStats.sqM.toFixed(0)} m²)
           </div>`,
          { permanent: true, direction: 'center', className: 'custom-map-tooltip' }
        );
      }
    }

    // Render Draggable Vertex Markers
    drawPoints.forEach((pt, index) => {
      const isFirst = index === 0;
      const vertexIcon = L.divIcon({
        html: `<div class="h-6 w-6 rounded-full ${
          isFirst ? 'bg-amber-500 ring-4 ring-amber-300' : 'bg-emerald-600 ring-2 ring-white'
        } shadow-2xl cursor-move flex items-center justify-center text-[10px] font-black text-white hover:scale-125 transition-transform">
                ${index + 1}
               </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const vertexMarker = L.marker([pt.lat, pt.lng ?? pt.lon], {
        icon: vertexIcon,
        draggable: true,
      }).addTo(map);

      // Auto-close on clicking 1st point if >= 3 points
      if (isFirst && drawPoints.length >= 3) {
        vertexMarker.on('click', () => {
          autoClosePolygon();
        });
      }

      vertexMarker.on('drag', (e) => {
        const newPos = e.target.getLatLng();
        updateDrawPoint(index, {
          lat: parseFloat(newPos.lat.toFixed(6)),
          lng: parseFloat(newPos.lng.toFixed(6)),
        });
      });

      markersRef.current.push(vertexMarker);
    });
  }, [drawPoints, isDrawing, autoClosePolygon, updateDrawPoint, areaStats]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  };

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 flex flex-col justify-between'
          : 'max-w-5xl mx-auto space-y-4 animate-fade-in text-left'
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100 p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Left Toolbar Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsDrawing((prev) => !prev)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
              isDrawing
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 animate-pulse'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>{isDrawing ? 'Drawing Boundary...' : 'Draw Polygon'}</span>
          </button>

          {drawPoints.length >= 3 && (
            <button
              type="button"
              onClick={autoClosePolygon}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2.5 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Polygon</span>
            </button>
          )}

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

          {/* Undo / Redo */}
          <button
            type="button"
            disabled={!canUndo}
            onClick={handleUndo}
            title="Undo last point"
            className="p-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={!canRedo}
            onClick={handleRedo}
            title="Redo point"
            className="p-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={drawPoints.length === 0}
            onClick={clearPolygon}
            title="Clear all points"
            className="p-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Live Size Readout Badge */}
        <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-2xl">
          <Ruler className="w-4 h-4 text-emerald-600" />
          <div className="text-xs text-emerald-900 font-extrabold">
            <span>Area: </span>
            <span className="text-emerald-700 text-sm font-black">{areaStats.formatted}</span>
            <span className="text-gray-400 font-normal ml-2">({areaStats.perimeter.text})</span>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <span>Run Satellite Analysis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Map Container Canvas */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-slate-900 flex-1 min-h-[500px]">
        {/* Map Div */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

        {/* Floating Instructions Banner */}
        <div className="absolute top-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md text-white border border-slate-700/60 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-2xl max-w-md flex items-center space-x-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <p className="font-extrabold text-emerald-300">Click on the map to place boundary corner vertices.</p>
            <p className="text-[10px] text-slate-300">
              Drag vertex numbers (1, 2, 3...) to edit shape. Click point #1 to close.
            </p>
          </div>
        </div>

        {/* Floating HUD Coordinate Indicator */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md text-white border border-slate-700/60 px-3.5 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center space-x-2 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span>
            {typeof hoverCoords.lat === 'number' ? hoverCoords.lat.toFixed(5) : '—'}° N,{' '}
            {typeof hoverCoords.lon === 'number' ? hoverCoords.lon.toFixed(5) : '—'}° E
          </span>
        </div>

        {/* Live Area HUD Card Bottom-Right */}
        <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-2xl text-left space-y-1.5 w-64">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
            <span>Field Boundary Metrics</span>
            <span className="text-emerald-600 font-bold">Live</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-gray-800">
            <div className="bg-gray-50 rounded-xl p-2">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Acres</p>
              <p className="text-base font-black text-emerald-700">{areaStats.acres.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Hectares</p>
              <p className="text-base font-black text-blue-700">{areaStats.hectares.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 pt-1">
            <span>Perimeter: {areaStats.perimeter.text}</span>
            <span>Gunthas: {areaStats.gunthas.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Step Actions Bar */}
      {!isFullscreen && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold px-6 py-3.5 rounded-2xl text-sm transition-all flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Select Location</span>
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <span>Run Satellite Analysis</span>
            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Step3DrawFarm;
