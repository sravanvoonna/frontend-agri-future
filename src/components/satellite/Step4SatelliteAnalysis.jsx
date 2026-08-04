import React from 'react';
import { Satellite, CheckCircle2, Sparkles, Loader2, Activity, Cpu } from 'lucide-react';
import { ANALYSIS_STEPS } from '../../hooks/useSatelliteWorkflow';

const Step4SatelliteAnalysis = ({
  progress = 0,
  stepIndex = 0,
  farmDetails = {},
  areaStats = {},
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in text-center py-8">
      {/* Animated Pulsing Satellite Visual */}
      <div className="relative inline-flex items-center justify-center">
        {/* Outer Orbit Rings */}
        <div className="absolute h-48 w-48 rounded-full border-2 border-emerald-500/20 animate-ping" />
        <div className="absolute h-36 w-36 rounded-full border-2 border-teal-500/40 animate-pulse" />

        {/* Central Glowing Icon */}
        <div className="h-28 w-28 bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 rounded-3xl shadow-2xl flex items-center justify-center text-white relative z-10 border-4 border-emerald-200/40">
          <Satellite className="w-14 h-14 animate-bounce-subtle text-emerald-100" />
        </div>
      </div>

      {/* Main Title & Status */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-black">
          <Cpu className="w-3.5 h-3.5 animate-spin" />
          <span>AgriFuture Satellite Engine v4.2</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Analyzing {farmDetails.cropType || 'Farm'} Parcel
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-medium">
          Processing multi-spectral Sentinel-2 satellite imagery for{' '}
          <strong className="text-gray-800">{farmDetails.farmerName || 'Farmer'}</strong>'s{' '}
          <span className="text-emerald-600 font-bold">{areaStats.formatted || 'Field'}</span>
        </p>
      </div>

      {/* Main Progress Bar Container */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-lg max-w-xl mx-auto space-y-6 text-left">
        {/* Progress % Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-gray-700">
            <span>Satellite Computation Progress</span>
            <span className="text-emerald-600 font-black text-sm">{progress}%</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-200/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step-by-Step Checklist */}
        <div className="space-y-3 pt-2">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isDone = idx < stepIndex;
            const isCurrent = idx === stepIndex;
            const isPending = idx > stepIndex;

            return (
              <div
                key={step.message}
                className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-200 shadow-sm scale-[1.02]'
                    : isDone
                    ? 'bg-gray-50/60 border-gray-100 opacity-90'
                    : 'bg-white border-transparent opacity-40'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>

                <span
                  className={`text-xs font-extrabold ${
                    isCurrent ? 'text-emerald-900 text-sm' : isDone ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step.message}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info Badge */}
      <p className="text-[11px] text-gray-400 font-semibold flex items-center justify-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Calibrating NDVI, EVI, NDRE, moisture, temperature & crop stress profiles</span>
      </p>
    </div>
  );
};

export default Step4SatelliteAnalysis;
