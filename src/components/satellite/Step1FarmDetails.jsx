import React from 'react';
import { User, Phone, Sprout, Calendar, Droplets, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const CROP_OPTIONS = [
  'Cotton',
  'Rice / Paddy',
  'Wheat',
  'Sugarcane',
  'Maize / Corn',
  'Soyabean',
  'Groundnut',
  'Red Gram (Tur / Arhar)',
  'Turmeric',
  'Red Chillies',
  'Onion',
  'Tomato',
  'Fruit Orchard (Pomegranate / Citrus)',
  'Banana',
  'Tea / Coffee',
  'Other Crop',
];

const SEASON_OPTIONS = [
  'Kharif (Monsoon / Autumn)',
  'Rabi (Winter / Spring)',
  'Zaid (Summer)',
  'Perennial / Year-round',
];

const IRRIGATION_OPTIONS = [
  'Drip Irrigation',
  'Micro Sprinkler',
  'Canal / Flood Irrigation',
  'Borewell / Tube Well',
  'Rainfed (Rain-dependent)',
];

const Step1FarmDetails = ({ farmDetails, updateFarmDetails, onContinue }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onContinue) onContinue();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
      {/* Banner / AI Assistant Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-700/50">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <Sprout className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-200">
              AgriFuture AI Assistant
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Let's analyze your farm using live satellite intelligence.
          </h2>

          <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
            Provide your basic farm details below so our remote sensing engine can calibrate field crop models, soil indices, and vegetation health metrics tailored specifically to your cultivation cycle.
          </p>

          <div className="pt-2 flex items-center space-x-4 text-xs font-semibold text-emerald-300">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Copernicus & Sentinel-2 Powered</span>
            </span>
            <span>•</span>
            <span>100% Confidential & Secure</span>
          </div>
        </div>
      </div>

      {/* Main Farm Details Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center space-x-2">
            <span>📋 Farm & Crop Profile</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Fill in your farm details to customize the satellite analysis report.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farmer Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Farmer Name <span className="text-emerald-600">*</span></span>
            </label>
            <input
              type="text"
              required
              value={farmDetails.farmerName}
              onChange={(e) => updateFarmDetails('farmerName', e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile Number <span className="text-gray-400 font-normal">(Optional)</span></span>
            </label>
            <input
              type="tel"
              value={farmDetails.mobileNumber}
              onChange={(e) => updateFarmDetails('mobileNumber', e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Farm Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>Farm / Plot Name <span className="text-gray-400 font-normal">(Optional)</span></span>
            </label>
            <input
              type="text"
              value={farmDetails.farmName}
              onChange={(e) => updateFarmDetails('farmName', e.target.value)}
              placeholder="e.g. North Plot #4 / Green Valley"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Crop Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>Primary Crop Type <span className="text-emerald-600">*</span></span>
            </label>
            <select
              value={farmDetails.cropType}
              onChange={(e) => updateFarmDetails('cropType', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
            >
              {CROP_OPTIONS.map((crop) => (
                <option key={crop} value={crop}>
                  🌾 {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Season */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Crop Season <span className="text-emerald-600">*</span></span>
            </label>
            <select
              value={farmDetails.season}
              onChange={(e) => updateFarmDetails('season', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
            >
              {SEASON_OPTIONS.map((season) => (
                <option key={season} value={season}>
                  📅 {season}
                </option>
              ))}
            </select>
          </div>

          {/* Irrigation Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-600" />
              <span>Irrigation Type <span className="text-emerald-600">*</span></span>
            </label>
            <select
              value={farmDetails.irrigationType}
              onChange={(e) => updateFarmDetails('irrigationType', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
            >
              {IRRIGATION_OPTIONS.map((irrigation) => (
                <option key={irrigation} value={irrigation}>
                  💧 {irrigation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Action Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-8 py-4 rounded-2xl text-base shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 cursor-pointer group"
          >
            <span>Continue to Select Location</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1FarmDetails;
