/**
 * EOS Map Component
 * Leaflet map wrapper providing EOS satellite tile layers, marker dragging,
 * polygon drawing, and field boundary editing.
 */

import React, { useEffect, useRef } from 'react';
import { createEOSTileLayer } from '../../services/mapService';

const EOSMap = ({
  mapId = 'sat-visualizer-map',
  height = 450,
  mapLat,
  mapLon,
  setMapLat,
  setMapLon,
  mapProvider = 'copernicus',
  activeLayer = 'TRUE_COLOR',
  isDrawing = false,
  drawPoints = [],
  setDrawPoints,
  boundaryEnabled = false,
}) => {
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);
  const cornerMarkersRef = useRef([]);

  // Initialize Map
  useEffect(() => {
    let map = null;

    const initMap = () => {
      const el = document.getElementById(mapId);
      if (!el || !window.L) return;

      const L = window.L;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      map = L.map(mapId, { zoomControl: true }).setView([mapLat, mapLon], 14);
      mapInstanceRef.current = map;

      // Base EOS tile layer
      const initialLayer = createEOSTileLayer(L, activeLayer, mapProvider);
      initialLayer.addTo(map);
      tileLayerRef.current = initialLayer;

      // Tractor Pin Marker
      const farmerIcon = L.divIcon({
        html: `<div class="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 border-2 border-white text-white text-base shadow-xl">🚜</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([mapLat, mapLon], { icon: farmerIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.bindPopup(`
        <div class="text-xs font-semibold p-1">
          <p class="font-bold text-sm text-blue-700">🚜 Your Farm Pin</p>
          <p class="text-gray-500 mt-1">Drag me onto your exact field and click Apply to analyze!</p>
          <p class="text-[10px] text-gray-400 mt-0.5">Lat: ${mapLat.toFixed(4)}, Lon: ${mapLon.toFixed(4)}</p>
        </div>
      `).openPopup();

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        if (setMapLat) setMapLat(pos.lat);
        if (setMapLon) setMapLon(pos.lng);
      });

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
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

  // Sync Map view and Marker when mapLat/mapLon change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([mapLat, mapLon], 14);
      if (markerRef.current) {
        markerRef.current.setLatLng([mapLat, mapLon]);
      }
    }
  }, [mapLat, mapLon]);

  // Update Layer when activeLayer or mapProvider changes
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

  // Click handler for polygon drawing mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      if (isDrawing && setDrawPoints) {
        setDrawPoints((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
      }
    };

    if (isDrawing) {
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', handleMapClick);
    } else {
      map.getContainer().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing, setDrawPoints]);

  // Render Polygon and Corner markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    // Clear previous corner markers
    cornerMarkersRef.current.forEach((m) => m.remove());
    cornerMarkersRef.current = [];

    // Clear previous polygon
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    if (drawPoints.length >= 3) {
      polygonRef.current = L.polygon(drawPoints, {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.25,
        weight: 3,
      }).addTo(mapInstanceRef.current);

      drawPoints.forEach((pt, idx) => {
        const dotIcon = L.divIcon({
          html: `<div class="h-5 w-5 rounded-full bg-red-600 border-2 border-white shadow-lg cursor-move flex items-center justify-center text-[10px] font-black text-white">${idx + 1}</div>`,
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
    } else if (boundaryEnabled) {
      const delta = 0.004;
      polygonRef.current = L.polygon(
        [
          [mapLat - delta * 0.5, mapLon - delta * 0.8],
          [mapLat - delta * 0.4, mapLon + delta * 0.7],
          [mapLat + delta * 0.6, mapLon + delta * 0.6],
          [mapLat + delta * 0.5, mapLon - delta * 0.7],
        ],
        { color: '#10b981', fillColor: '#22c55e', fillOpacity: 0.25, weight: 3 }
      ).addTo(mapInstanceRef.current);
    }
  }, [drawPoints, boundaryEnabled, mapLat, mapLon, setDrawPoints]);

  return (
    <div className="bg-white rounded-3xl border-4 border-white shadow-xl relative overflow-hidden">
      <div id={mapId} style={{ height }} className="w-full z-10" />
    </div>
  );
};

export default EOSMap;
