import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw,
  Play,
  Pause,
  Activity,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { EOS_LAYERS } from '../../services/eosApi';
import EOSGISMap from '../map/EOSGISMap';

/**
 * Displays ONLY live API data. Zero hardcoded or placeholder values.
 * If the API failed, shows a clear error message.
 * If a metric is null (not returned by the API), shows "N/A".
 */
const Step5FarmReport = ({
  farmDetails = {},
  locationState = {},
  drawPoints = [],
  areaStats = {},
  reportData = null,
  analysisError = null,
  historicalScenes = [],
  activeSceneIndex = 0,
  setActiveSceneIndex,
  onResetWorkflow,
}) => {
  const [activeLayer, setActiveLayer] = useState('TRUE_COLOR');
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const timelineTimerRef = React.useRef(null);

  const toggleTimelinePlay = () => {
    if (isPlayingTimeline) {
      clearInterval(timelineTimerRef.current);
      setIsPlayingTimeline(false);
    } else {
      setIsPlayingTimeline(true);
      timelineTimerRef.current = setInterval(() => {
        setActiveSceneIndex((prev) => (prev + 1) % (historicalScenes.length || 1));
      }, 2000);
    }
  };

  const handlePrintPdf = () => window.print();

  // Helper to safely format a value — returns "N/A" if null/undefined
  const fmt = (val, decimals = 2, suffix = '') => {
    if (val == null) return 'N/A';
    return typeof val === 'number' ? `${val.toFixed(decimals)}${suffix}` : `${val}${suffix}`;
  };

  const fmtInt = (val, suffix = '') => {
    if (val == null) return 'N/A';
    return typeof val === 'number' ? `${Math.round(val)}${suffix}` : `${val}${suffix}`;
  };

  // ─── ERROR STATE ────────────────────────────────────────────────────────
  if (analysisError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-center">
        <div className="bg-white rounded-3xl border border-red-200 p-10 shadow-sm space-y-5">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900">Satellite Analysis Failed</h2>
          <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            The live EOS satellite API returned an error. No data could be retrieved for this location.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 max-w-lg mx-auto">
            <p className="text-xs font-mono text-red-700 break-words">{analysisError}</p>
          </div>
          <button
            type="button"
            onClick={onResetWorkflow}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-sm shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again with a Different Location</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── NO DATA STATE ──────────────────────────────────────────────────────
  if (!reportData || reportData.noData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-center">
        <div className="bg-white rounded-3xl border border-amber-200 p-10 shadow-sm space-y-5">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900">No Satellite Data Available</h2>
          <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            {reportData?.message || 'No satellite observations were found for this location and date range. Try a different field or extend the analysis period.'}
          </p>
          <button
            type="button"
            onClick={onResetWorkflow}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-sm shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Analyze Another Location</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Status badge color helper ──────────────────────────────────────────
  const statusColor = (s) => {
    if (!s) return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    if (s === 'Healthy') return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
    if (s === 'Moderate') return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
    if (s === 'Warning') return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
    return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
  };

  const sc = statusColor(reportData.status);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-left">
      {/* Top Bar — Live badge + info */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
              🛰️ Live Satellite Report
            </span>
            {reportData.isLive && (
              <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-green-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span>LIVE API Data</span>
              </span>
            )}
            <span className={`${sc.bg} ${sc.text} text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${sc.border}`}>
              Status: {reportData.status || 'Unknown'}
            </span>
          </div>

          <h2 className="text-2xl font-black text-gray-900">
            {farmDetails.farmerName ? `${farmDetails.farmerName}'s` : ''} Farm Intelligence Report
          </h2>

          <p className="text-xs text-gray-500 font-semibold">
            Field: <strong className="text-gray-800">{farmDetails.farmName || 'Selected Parcel'}</strong> | Crop:{' '}
            <strong className="text-emerald-700">{farmDetails.cropType || 'N/A'}</strong> ({farmDetails.season || 'N/A'}) | Size:{' '}
            <strong className="text-gray-800">{areaStats.formatted || 'N/A'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onResetWorkflow}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Analyze New Farm</span>
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map + Layer Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-gray-800 flex items-center space-x-2">
                  <span>🗺️ Field Boundary & Spectral Imagery</span>
                </h3>
                <p className="text-[10px] text-gray-400">
                  Capture Date: {reportData.captureDate || 'N/A'} | Source: {reportData.imagerySource || 'N/A'} | Scene: {reportData.sceneId || 'N/A'}
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Layer: {EOS_LAYERS[activeLayer]?.name || activeLayer}</span>
              </div>
            </div>

            <EOSGISMap
              mapId="report-field-gis-map"
              height={420}
              mapLat={locationState.lat}
              mapLon={locationState.lon}
              setMapLat={() => {}}
              setMapLon={() => {}}
              activeLayer={activeLayer}
              setActiveLayer={setActiveLayer}
              drawPoints={drawPoints}
              setDrawPoints={() => {}}
              scenesList={historicalScenes}
              activeSceneIndex={activeSceneIndex}
              setActiveSceneIndex={setActiveSceneIndex}
              isPlaying={isPlayingTimeline}
              toggleTimelinePlay={toggleTimelinePlay}
            />
          </div>

          {/* Timeline Player */}
          {historicalScenes.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-700 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Historical Satellite Scene Timeline</span>
                </span>
                <button
                  type="button"
                  onClick={toggleTimelinePlay}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 cursor-pointer shadow-sm"
                >
                  {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingTimeline ? 'Pause' : 'Play'}</span>
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                {historicalScenes.map((sc, idx) => (
                  <button
                    key={sc.sceneId || idx}
                    type="button"
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      activeSceneIndex === idx
                        ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <p className="text-[10px] font-black text-gray-800">{sc.date}</p>
                    <p className="text-[9px] text-gray-400 font-bold">☁️ {sc.cloudCover}% cloud</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spectral Layer Picker */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-gray-800 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Select Spectral Layer</span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Click any index to render live satellite view</p>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
            {Object.keys(EOS_LAYERS).map((key) => {
              const layer = EOS_LAYERS[key];
              const isSelected = activeLayer === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveLayer(key)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <p className="text-xs font-black flex items-center space-x-1">
                    <span>{layer.icon}</span>
                    <span>{layer.name}</span>
                  </p>
                  <p className={`text-[9px] mt-1 line-clamp-2 ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                    {layer.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LIVE VEGETATION INDEX CARDS — all values from API only
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* NDVI Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">🌿 NDVI</span>
          <p className="text-3xl font-black">{reportData.ndviMean != null ? reportData.ndviMean.toFixed(3) : 'N/A'}</p>
          <div className="text-[10px] font-bold text-emerald-100 space-y-0.5">
            <p>Min: {fmt(reportData.ndviMin, 3)} | Max: {fmt(reportData.ndviMax, 3)}</p>
            <p>Std: {fmt(reportData.ndviStd, 4)} | Median: {fmt(reportData.ndviMedian, 3)}</p>
          </div>
          {reportData.ndviScore != null && (
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div className="h-2 rounded-full bg-white transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, reportData.ndviScore))}%` }} />
            </div>
          )}
        </div>

        {/* EVI Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span>EVI</span>
          </span>
          <p className="text-3xl font-black text-green-700">{fmt(reportData.eviMean, 3)}</p>
          <p className="text-[10px] text-gray-400 font-bold">Min: {fmt(reportData.eviMin, 3)} | Max: {fmt(reportData.eviMax, 3)}</p>
        </div>

        {/* NDRE Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-yellow-600" />
            <span>NDRE</span>
          </span>
          <p className="text-3xl font-black text-yellow-700">{fmt(reportData.ndreMean, 3)}</p>
          <p className="text-[10px] text-gray-400 font-bold">Min: {fmt(reportData.ndreMin, 3)} | Max: {fmt(reportData.ndreMax, 3)}</p>
        </div>

        {/* Vegetation Status Card */}
        <div className={`rounded-3xl border p-5 shadow-sm space-y-1.5 ${sc.bg} ${sc.border}`}>
          <span className={`text-[10px] font-black uppercase tracking-wider ${sc.text} flex items-center space-x-1`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overall Status</span>
          </span>
          <p className={`text-2xl font-black ${sc.text}`}>{reportData.status || 'Unknown'}</p>
          <p className={`text-[10px] font-bold ${sc.text} opacity-80`}>{reportData.vegetationStress || ''}</p>
          <p className={`text-[10px] font-bold ${sc.text} opacity-60`}>{reportData.cropGrowthStage || ''}</p>
        </div>
      </div>

      {/* NDVI Timeline (if multiple scenes returned) */}
      {reportData.allScenes && reportData.allScenes.length > 1 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-800 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>📈 NDVI Timeline (Live API Data)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-bold text-gray-600">Date</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600">Scene ID</th>
                  <th className="px-3 py-2 text-right font-bold text-emerald-700">NDVI</th>
                  <th className="px-3 py-2 text-right font-bold text-green-700">EVI</th>
                  <th className="px-3 py-2 text-right font-bold text-yellow-700">NDRE</th>
                </tr>
              </thead>
              <tbody>
                {reportData.allScenes.map((scene, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i === 0 ? 'bg-emerald-50/50' : ''}`}>
                    <td className="px-3 py-2 font-bold text-gray-800">{scene.date}</td>
                    <td className="px-3 py-2 text-gray-400 font-mono text-[10px]">{(scene.sceneId || '').substring(0, 30)}...</td>
                    <td className="px-3 py-2 text-right font-black text-emerald-700">{fmt(scene.ndviMean, 3)}</td>
                    <td className="px-3 py-2 text-right font-black text-green-700">{fmt(scene.eviMean, 3)}</td>
                    <td className="px-3 py-2 text-right font-black text-yellow-700">{fmt(scene.ndreMean, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Source Provenance */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-center">
        <p className="text-[10px] text-gray-400 font-bold">
          All values above are live from {reportData.imagerySource || 'EOSDA API Connect'}. Capture: {reportData.captureDate || 'N/A'}. Scene: {reportData.sceneId || 'N/A'}. No simulated or placeholder data.
        </p>
      </div>
    </div>
  );
};

export default Step5FarmReport;
