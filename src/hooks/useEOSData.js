/**
 * Custom React Hook for Managing EOS Enterprise Satellite Data, Timeline Animation & Drawing History
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchEOSScenes, fetchEOSFieldAnalytics, EOS_LAYERS } from '../services/eosApi';
import { generateEOSFarmReport } from '../services/reportGenerator';

export const useEOSData = (initialLat, initialLon) => {
  const [lat, setLat] = useState(initialLat);
  const [lon, setLon] = useState(initialLon);
  const [polygon, setPolygon] = useState([]);

  // Drawing Undo/Redo Stacks
  const [drawHistory, setDrawHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [activeLayer, setActiveLayer] = useState('TRUE_COLOR');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [rawAnalytics, setRawAnalytics] = useState(null);
  const [farmReport, setFarmReport] = useState(null);
  const [scenesList, setScenesList] = useState([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // Push new draw point state to undo history
  const pushDrawState = useCallback((newPoints) => {
    setDrawHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, newPoints];
    });
    setHistoryIndex((prev) => prev + 1);
    setPolygon(newPoints);
  }, [historyIndex]);

  const undoDraw = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setPolygon(drawHistory[prevIdx]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setPolygon([]);
    }
  }, [drawHistory, historyIndex]);

  const redoDraw = useCallback(() => {
    if (historyIndex < drawHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setPolygon(drawHistory[nextIdx]);
    }
  }, [drawHistory, historyIndex]);

  // Load EOS data & scenes list
  const loadEOSData = useCallback(async (targetLat = lat, targetLon = lon, targetPolygon = polygon, targetDate = selectedDate) => {
    if (!targetLat || !targetLon) return;
    setLoading(true);
    setError(null);

    try {
      const analyticsData = await fetchEOSFieldAnalytics({
        lat: targetLat,
        lon: targetLon,
        polygon: targetPolygon,
        date: targetDate,
      });

      const scenes = await fetchEOSScenes({
        lat: targetLat,
        lon: targetLon,
        polygon: targetPolygon,
      });

      const report = generateEOSFarmReport({
        eosData: analyticsData,
        lat: targetLat,
        lon: targetLon,
        polygon: targetPolygon,
      });

      setRawAnalytics(analyticsData);
      setScenesList(scenes);
      setFarmReport(report);
      if (scenes.length > 0) {
        setActiveSceneIndex(0);
        setSelectedDate(scenes[0].date);
      }
    } catch (err) {
      console.error('Error fetching EOS data:', err);
      setError(err.message || 'Failed to load EOS satellite imagery.');
    } finally {
      setLoading(false);
    }
  }, [lat, lon, polygon, selectedDate]);

  // Timeline auto-play effect
  useEffect(() => {
    if (isPlaying && scenesList.length > 0) {
      playTimerRef.current = setInterval(() => {
        setActiveSceneIndex((prev) => {
          const next = (prev + 1) % scenesList.length;
          setSelectedDate(scenesList[next].date);
          return next;
        });
      }, 2000);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, scenesList]);

  const toggleTimelinePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const switchLayer = useCallback((layerId) => {
    if (EOS_LAYERS[layerId]) {
      setActiveLayer(layerId);
    }
  }, []);

  const updateCoordinates = useCallback((newLat, newLon, newPolygon = []) => {
    setLat(newLat);
    setLon(newLon);
    setPolygon(newPolygon);
  }, []);

  return {
    lat,
    lon,
    polygon,
    setPolygon,
    pushDrawState,
    undoDraw,
    redoDraw,
    canUndo: historyIndex >= 0,
    canRedo: historyIndex < drawHistory.length - 1,
    activeLayer,
    selectedDate,
    loading,
    error,
    rawAnalytics,
    farmReport,
    scenesList,
    activeSceneIndex,
    setActiveSceneIndex,
    isPlaying,
    toggleTimelinePlay,
    switchLayer,
    setSelectedDate,
    updateCoordinates,
    loadEOSData,
    EOS_LAYERS,
  };
};

export default useEOSData;
