/**
 * Enterprise EOS Farm Report Dashboard
 * Renders 15+ agricultural intelligence indicators with AgriFuture green branding.
 */

import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  CloudRain,
  Compass,
  Droplet,
  FileText,
  Layers,
  MapPin,
  Printer,
  ShieldAlert,
  Sparkles,
  Sprout,
  Sun,
  Thermometer,
  TrendingUp,
  Zap,
} from 'lucide-react';

export const EOSEnterpriseReport = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center space-y-3">
        <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-gray-600">Generating Enterprise EOS Satellite Intelligence Report...</p>
        <p className="text-xs text-gray-400">Processing Sentinel-2 multi-spectral bands & zonal statistics</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* ── 1. EXECUTIVE HEALTH SUMMARY HEADER ───────────────── */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                🛰️ EOS Satellite Analytics
              </span>
              <span className="text-xs font-bold opacity-80">{report.imagerySource}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mt-2 tracking-tight flex items-center gap-2">
              <span>{report.locationName}</span>
            </h2>
            <p className="text-xs opacity-75 mt-0.5">Report Date: {report.reportDate} | Lat: {report.coordinates.lat?.toFixed(4)}, Lon: {report.coordinates.lon?.toFixed(4)}</p>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Export PDF Report</span>
          </button>
        </div>

        {/* Top Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-80">🌿 NDVI Vigor Score</p>
            <p className="text-4xl font-black mt-1">{report.ndviScore}<span className="text-sm font-normal">/100</span></p>
            <p className="text-xs font-bold mt-1 opacity-90">{report.healthStatus}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-80">🌱 EVI Index</p>
            <p className="text-4xl font-black mt-1">{report.eviScore}</p>
            <p className="text-xs font-bold mt-1 opacity-90">Enhanced Canopy</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-80">💧 Moisture Index</p>
            <p className="text-4xl font-black mt-1">{report.moistureIndex}</p>
            <p className="text-xs font-bold mt-1 opacity-90">{report.waterStress.level}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-80">🩺 VHI Stress Score</p>
            <p className="text-4xl font-black mt-1">{report.vegetationIndex}</p>
            <p className="text-xs font-bold mt-1 opacity-90">{report.vegetationStress}</p>
          </div>
        </div>
      </div>

      {/* ── 2. CROP ZONES & WATER STRESS CARDS ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Field Zone Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center justify-between">
            <span>🗺️ Crop Health Zone Breakdown</span>
            <span className="text-xs text-gray-400 font-bold">Total: {report.fieldArea.acres} Acres</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-black mb-1">
                <span className="text-emerald-700">Healthy Crop Zone</span>
                <span className="text-emerald-700">{report.zones.healthyPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${report.zones.healthyPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-black mb-1">
                <span className="text-amber-700">Stressed Crop Zone</span>
                <span className="text-amber-700">{report.zones.stressedPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${report.zones.stressedPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-black mb-1">
                <span className="text-red-700">Damaged Zone</span>
                <span className="text-red-700">{report.zones.damagedPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${report.zones.damagedPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Water-Stress & Precision Irrigation */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center justify-between">
              <span>💧 Water-Stress & Irrigation Advisory</span>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                {report.waterStress.level}
              </span>
            </h3>
            <p className="text-xs text-gray-600 font-bold mt-3 leading-relaxed">
              {report.waterStress.recommendation}
            </p>
          </div>

          {report.waterStress.overwateringWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs font-bold text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Overwatering Risk: Suspend irrigation to protect root aeration.</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. PEST WARNING, FERTILIZER & YIELD ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pest & Disease Early Warning */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800">🐛 Pest & Disease Advisory</h3>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${report.pestWarning.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              Risk: {report.pestWarning.risk}
            </span>
          </div>
          <p className="text-sm font-black text-slate-900">{report.pestWarning.warnings[0]?.disease}</p>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">{report.pestWarning.warnings[0]?.recommendation}</p>
        </div>

        {/* Zone-Wise Fertilizer Advisory */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-800">🌾 Zone-Wise Fertilizer Plan</h3>
          <p className="text-xs font-bold text-emerald-800 leading-relaxed">{report.fertilizerAdvisory.lowGrowthZoneDose}</p>
          <p className="text-[10px] text-gray-400 font-semibold">{report.fertilizerAdvisory.soilTestStatus}</p>
        </div>

        {/* Crop Stage & Yield Estimation */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-800">🚜 Crop Stage & Production</h3>
          <p className="text-sm font-black text-slate-900">{report.cropStage.stage}</p>
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
            <p className="text-[10px] font-black uppercase text-emerald-600">Predicted Yield</p>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">{report.cropStage.totalProductionQuintals} Quintals</p>
            <p className="text-[10px] text-emerald-700 font-bold">~{report.cropStage.estimatedYieldPerAcre} Qtl/Acre | Date: {report.cropStage.harvestDate}</p>
          </div>
        </div>
      </div>

      {/* ── 4. INSURANCE & MARKET PROCUREMENT ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geo-Tagged Insurance Claim Support */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <span>Satellite Crop Insurance Claims</span>
            </h3>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${report.insuranceClaimData.claimEligible ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
              {report.insuranceClaimData.claimEligible ? 'Claim Recommended' : 'Field Intact'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <p><strong className="text-white">Evidence:</strong> {report.insuranceClaimData.damageAssessmentPct}</p>
            <p><strong className="text-white">Pre-Disaster NDVI:</strong> {report.insuranceClaimData.preDisasterNDVI} | <strong className="text-white">Post:</strong> {report.insuranceClaimData.postDisasterNDVI}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-2">Geo-Tag: {report.insuranceClaimData.geoTaggedCoordinates} | Confidence: {report.insuranceClaimData.evidenceConfidence}</p>
          </div>
        </div>

        {/* Market & Procurement Support */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <span>Market & Mandi Procurement</span>
            </h3>
            <span className="text-xs font-black bg-emerald-700 text-white px-2.5 py-1 rounded-lg">
              {report.marketSupport.expectedMandiPrice}
            </span>
          </div>

          <div className="space-y-1 text-xs text-emerald-100">
            <p className="text-lg font-black text-white">Estimated Revenue: {report.marketSupport.estimatedTotalRevenue}</p>
            <p><strong className="text-white">Nearby FPO:</strong> {report.marketSupport.nearbyFPO}</p>
            <p><strong className="text-white">Transport:</strong> {report.marketSupport.transportProvider}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EOSEnterpriseReport;
