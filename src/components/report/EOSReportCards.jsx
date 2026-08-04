/**
 * EOS Report Cards Component
 * Renders 10-point agricultural intelligence metrics fitting seamlessly into existing card slots.
 */

import React from 'react';

export const EOSReportCards = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
        <p className="text-xs font-bold text-gray-400 animate-pulse">Loading EOS Satellite Analysis & Agricultural Intelligence...</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-4 text-left animate-fade-in">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`col-span-2 bg-gradient-to-br from-${report.healthBadgeColor}-500 to-${report.healthBadgeColor}-600 rounded-2xl p-5 text-white shadow-md`}>
          <p className="text-xs font-black uppercase tracking-wider opacity-80">🌿 EOS NDVI Crop Health Score</p>
          <div className="flex items-baseline gap-3 mt-2">
            <p className="text-5xl font-black">{report.ndviScore}</p>
            <p className="text-sm font-bold opacity-90">EVI: {report.eviScore}</p>
          </div>
          <p className="text-sm font-bold mt-1">{report.healthStatus} — {report.vegetationStress}</p>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="h-2 rounded-full bg-white transition-all duration-700" style={{ width: `${report.ndviScore}%` }} />
          </div>
          <p className="text-[10px] opacity-70 mt-2">Source: {report.imagerySource} | Date: {report.reportDate}</p>
        </div>

        {/* Zone Breakdown Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400">🗺️ Crop Zone Breakdown</p>
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-600">Healthy:</span>
              <span>{report.zones.healthyPct}%</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-600">Stressed:</span>
              <span>{report.zones.stressedPct}%</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-red-600">Damaged:</span>
              <span>{report.zones.damagedPct}%</span>
            </div>
          </div>
        </div>

        {/* Water Stress & Irrigation Advisory */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400">💧 Water-Stress & Irrigation</p>
          <p className="text-sm font-black text-blue-700 mt-1">{report.waterStress.level}</p>
          <p className="text-[10px] text-gray-600 mt-1 line-clamp-3">{report.waterStress.recommendation}</p>
        </div>
      </div>

      {/* Feature Grid: Pest Warning, Fertilizer, Yield, Insurance, Market */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pest & Disease Early Warning */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-gray-400">🐛 Pest & Disease Early Warning</p>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${report.pestWarning.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              Risk: {report.pestWarning.risk}
            </span>
          </div>
          <p className="text-xs font-black text-slate-800">{report.pestWarning.warnings[0]?.disease}</p>
          <p className="text-[10px] text-gray-500">{report.pestWarning.warnings[0]?.recommendation}</p>
        </div>

        {/* Zone-Wise Fertilizer Advisory */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
          <p className="text-[10px] font-black uppercase text-gray-400">🌾 Zone-Wise Fertilizer Advisory</p>
          <p className="text-xs font-bold text-emerald-700">{report.fertilizerAdvisory.lowGrowthZoneDose}</p>
          <p className="text-[9px] text-gray-400">{report.fertilizerAdvisory.soilTestStatus}</p>
        </div>

        {/* Crop Stage & Yield Estimation */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
          <p className="text-[10px] font-black uppercase text-gray-400">🚜 Crop Stage & Yield Estimation</p>
          <p className="text-xs font-black text-slate-800">{report.cropStage.stage}</p>
          <div className="flex justify-between text-xs text-gray-600 font-bold">
            <span>Predicted Production:</span>
            <span className="text-blue-700">{report.cropStage.totalProductionQuintals} Qtl</span>
          </div>
          <p className="text-[9px] text-gray-400">Harvest Date: {report.cropStage.harvestDate} (~{report.cropStage.daysToHarvest} days)</p>
        </div>
      </div>

      {/* Disaster, Insurance Claims & Market Procurement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Geo-Tagged Insurance Claim Support */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-slate-400">📋 Satellite Crop Insurance Claims</p>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${report.insuranceClaimData.claimEligible ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {report.insuranceClaimData.claimEligible ? 'Claim Recommended' : 'Field Intact'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200">Satellite Evidence: {report.insuranceClaimData.damageAssessmentPct}</p>
          <p className="text-[10px] text-slate-400">Coordinates: {report.insuranceClaimData.geoTaggedCoordinates} | Confidence: {report.insuranceClaimData.evidenceConfidence}</p>
        </div>

        {/* Market & Procurement Support */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-4 text-white shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-emerald-300">🏪 Market & Mandi Procurement</p>
            <span className="text-[9px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-full">
              {report.marketSupport.expectedMandiPrice}
            </span>
          </div>
          <p className="text-xs font-bold text-white">Estimated Revenue: {report.marketSupport.estimatedTotalRevenue}</p>
          <p className="text-[10px] text-emerald-200">{report.marketSupport.nearbyFPO} | Transport: {report.marketSupport.transportProvider}</p>
        </div>
      </div>
    </div>
  );
};

export default EOSReportCards;
