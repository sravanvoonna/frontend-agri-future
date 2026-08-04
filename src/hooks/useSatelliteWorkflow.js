import { useState, useCallback } from 'react';
import { getPolygonArea } from '../utils/gisUtils';
import { searchLocationCoordinates } from '../services/mapService';
import { fetchEOSFieldAnalytics, fetchEOSScenes } from '../services/eosApi';

export const STEPS = [
  { id: 1, title: 'Farm Details', subtitle: 'Enter farm profile & crop details' },
  { id: 2, title: 'Select Location', subtitle: 'Locate field via search or GPS' },
  { id: 3, title: 'Draw Farm', subtitle: 'Mark boundary & measure size' },
  { id: 4, title: 'Satellite Analysis', subtitle: 'AI remote sensing processing' },
  { id: 5, title: 'Farm Report', subtitle: 'Interactive satellite intelligence' },
];

export const INITIAL_FARM_DETAILS = {
  farmerName: 'Ramesh Patel',
  mobileNumber: '',
  farmName: 'Green Valley Farm',
  cropType: 'Cotton',
  season: 'Kharif (Monsoon)',
  irrigationType: 'Drip Irrigation',
};

export const ANALYSIS_STEPS = [
  { message: 'Locating satellite imagery...', duration: 900 },
  { message: 'Fetching latest Sentinel-2 & Landsat observations...', duration: 1100 },
  { message: 'Analyzing vegetation chlorophyll & biomass...', duration: 1200 },
  { message: 'Detecting crop condition & growth stage...', duration: 1000 },
  { message: 'Calculating NDVI, EVI, NDRE & soil moisture indices...', duration: 1100 },
  { message: 'Synthesizing agricultural intelligence report...', duration: 900 },
];

export function useSatelliteWorkflow(initialLat = 19.7515, initialLon = 75.7139) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Farm Details State
  const [farmDetails, setFarmDetails] = useState(INITIAL_FARM_DETAILS);

  // Step 2: Location Selection State
  const [locationState, setLocationState] = useState({
    lat: initialLat,
    lon: initialLon,
    address: 'Aurangabad District, Maharashtra, India',
    searchType: 'village', // 'village' | 'city' | 'district' | 'state' | 'pincode' | 'landmark' | 'gps'
    searchQuery: '',
    countryCode: 'in',
    loading: false,
    error: '',
  });

  // Step 3: Map Boundary Drawing State
  const [drawPoints, setDrawPoints] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeLayer, setActiveLayer] = useState('TRUE_COLOR');
  const [measureMode, setMeasureMode] = useState(null); // null | 'distance' | 'area'

  // Step 4 & 5: Analysis & Report State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [historicalScenes, setHistoricalScenes] = useState([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Live Field Calculation
  const fieldAreaStats = getPolygonArea(drawPoints);

  // Update Farm details helper
  const updateFarmDetails = (key, value) => {
    setFarmDetails((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Location Search
  const handleLocationSearch = async (queryOverride, searchTypeOverride) => {
    const query = queryOverride || locationState.searchQuery;
    const type = searchTypeOverride || locationState.searchType;

    if (!query && type !== 'gps') return;

    setLocationState((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      if (type === 'gps') {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser.');
        }

        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const latVal = parseFloat(pos.coords.latitude.toFixed(6));
              const lonVal = parseFloat(pos.coords.longitude.toFixed(6));
              setLocationState((prev) => ({
                ...prev,
                lat: latVal,
                lon: lonVal,
                address: `Current GPS Location (${latVal}, ${lonVal})`,
                loading: false,
              }));
              resolve();
            },
            (err) => reject(new Error('Unable to retrieve GPS location. Please allow location access.')),
            { timeout: 10000, enableHighAccuracy: true }
          );
        });
        return;
      }

      const res = await searchLocationCoordinates(query, locationState.countryCode);
      setLocationState((prev) => ({
        ...prev,
        lat: res.lat,
        lon: res.lon,
        address: res.address,
        loading: false,
      }));
    } catch (err) {
      setLocationState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Location search failed. Try entering a nearby district or city.',
      }));
    }
  };

  // Polygon Drawing Actions
  const addDrawPoint = useCallback((pt) => {
    setDrawPoints((prev) => {
      setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      return [...prev, pt];
    });
  }, []);

  const updateDrawPoint = useCallback((index, newPt) => {
    setDrawPoints((prev) => {
      setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      const next = [...prev];
      next[index] = newPt;
      return next;
    });
  }, []);

  const clearPolygon = useCallback(() => {
    setDrawPoints((prev) => {
      if (prev.length > 0) setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      return [];
    });
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      const lastState = prevUndo[prevUndo.length - 1];
      setRedoStack((r) => [...r, drawPoints]);
      setDrawPoints(lastState);
      return prevUndo.slice(0, prevUndo.length - 1);
    });
  }, [drawPoints]);

  const handleRedo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const nextState = prevRedo[prevRedo.length - 1];
      setUndoStack((u) => [...u, drawPoints]);
      setDrawPoints(nextState);
      return prevRedo.slice(0, prevRedo.length - 1);
    });
  }, [drawPoints]);

  const autoClosePolygon = useCallback(() => {
    if (drawPoints.length >= 3) {
      setIsDrawing(false);
    }
  }, [drawPoints]);

  // Run Satellite Analysis Workflow (Step 4 -> Step 5)
  const runSatelliteAnalysis = async () => {
    setCurrentStep(4);
    setIsAnalyzing(true);
    setAnalysisProgress(5);
    setAnalysisStepIndex(0);

    const stepTotal = ANALYSIS_STEPS.length;
    let accumulatedProgress = 10;

    for (let i = 0; i < stepTotal; i++) {
      setAnalysisStepIndex(i);
      const stepDuration = ANALYSIS_STEPS[i].duration;
      const stepIncrement = Math.round(85 / stepTotal);
      
      // Animate progress smoothly within step
      const startTime = Date.now();
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(1, elapsed / stepDuration);
          const currentProgress = Math.min(95, Math.round(accumulatedProgress + pct * stepIncrement));
          setAnalysisProgress(currentProgress);

          if (elapsed >= stepDuration) {
            clearInterval(interval);
            accumulatedProgress += stepIncrement;
            resolve();
          }
        }, 50);
      });
    }

    // Fetch LIVE API Data — no fallbacks, errors propagate to UI
    try {
      const polygonCoords = drawPoints.length >= 3 ? drawPoints : null;

      console.log('%c[WORKFLOW] Starting live EOS API calls...', 'color:#10b981;font-weight:bold', {
        lat: locationState.lat, lon: locationState.lon, polygonPoints: polygonCoords?.length || 0
      });

      const analytics = await fetchEOSFieldAnalytics({
        lat: locationState.lat,
        lon: locationState.lon,
        polygon: polygonCoords,
      });

      let scenes = [];
      try {
        scenes = await fetchEOSScenes({
          lat: locationState.lat,
          lon: locationState.lon,
          polygon: polygonCoords,
        });
      } catch (sceneErr) {
        console.error('[WORKFLOW] Scene search failed (non-fatal):', sceneErr.message);
      }

      console.log('%c[WORKFLOW] Live analysis complete ✓', 'color:#10b981;font-weight:bold', analytics);
      setReportData(analytics);
      setHistoricalScenes(scenes);
      setAnalysisError(null);
    } catch (err) {
      console.error('%c[WORKFLOW] EOS API ERROR ✗', 'color:#ef4444;font-weight:bold', err);
      setAnalysisError(err.message || 'Satellite analysis failed. Check your API key and network connection.');
      setReportData(null);
      setHistoricalScenes([]);
    }

    setAnalysisProgress(100);
    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentStep(5);
    }, 400);
  };

  // Step Navigation Handlers
  const nextStep = () => {
    if (currentStep === 3) {
      runSatelliteAnalysis();
    } else if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1 && !isAnalyzing) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (stepNum) => {
    if (!isAnalyzing && stepNum >= 1 && stepNum <= 5) {
      if (stepNum === 4 || stepNum === 5) {
        if (!reportData) {
          runSatelliteAnalysis();
          return;
        }
      }
      setCurrentStep(stepNum);
    }
  };

  return {
    currentStep,
    setCurrentStep: goToStep,
    nextStep,
    prevStep,
    farmDetails,
    updateFarmDetails,
    locationState,
    setLocationState,
    handleLocationSearch,
    drawPoints,
    setDrawPoints,
    addDrawPoint,
    updateDrawPoint,
    clearPolygon,
    handleUndo,
    handleRedo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    autoClosePolygon,
    isDrawing,
    setIsDrawing,
    activeLayer,
    setActiveLayer,
    measureMode,
    setMeasureMode,
    fieldAreaStats,
    isAnalyzing,
    analysisProgress,
    analysisStepIndex,
    reportData,
    analysisError,
    historicalScenes,
    activeSceneIndex,
    setActiveSceneIndex,
    runSatelliteAnalysis,
  };
}

export default useSatelliteWorkflow;
