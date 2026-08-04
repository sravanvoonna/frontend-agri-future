import React, { useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const LOCATION_SEARCH_TYPES = [
  { id: 'village', label: 'Search Village', icon: '🏡', placeholder: 'e.g. Ralegan Siddhi / Khed' },
  { id: 'city', label: 'Search City', icon: '🏙️', placeholder: 'e.g. Nashik, Aurangabad, Guntur' },
  { id: 'district', label: 'Search District', icon: '🗺️', placeholder: 'e.g. Bathinda, Anantapur, Bareilly' },
  { id: 'state', label: 'Search State', icon: '🚩', placeholder: 'e.g. Punjab, Telangana, Gujarat' },
  { id: 'pincode', label: 'Search Pincode', icon: '📮', placeholder: 'e.g. 422001, 522002, 141001' },
  { id: 'landmark', label: 'Search Landmark', icon: '📍', placeholder: 'e.g. Godavari River Dam / APMC Market' },
  { id: 'gps', label: 'GPS Location', icon: '📡', placeholder: 'Detect live device coordinates' },
];

const Step2SelectLocation = ({
  locationState,
  setLocationState,
  onSearch,
  onContinue,
  onBack,
}) => {
  const miniMapContainerRef = useRef(null);
  const miniMapRef = useRef(null);
  const markerRef = useRef(null);

  const activeTypeObj = LOCATION_SEARCH_TYPES.find((t) => t.id === locationState.searchType) || LOCATION_SEARCH_TYPES[0];

  // Initialize & Sync Mini Leaflet Map Preview
  useEffect(() => {
    const el = miniMapContainerRef.current;
    if (!el || !window.L) return;
    const L = window.L;

    if (!miniMapRef.current) {
      const map = L.map(el, { zoomControl: false, minZoom: 4, maxZoom: 18 }).setView(
        [locationState.lat, locationState.lon],
        14
      );

      // Base Satellite Tile Layer
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Esri World Imagery', maxZoom: 19 }
      ).addTo(map);

      // Draggable Marker
      const customPinIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
                <div class="h-9 w-9 bg-gradient-to-tr from-emerald-700 to-emerald-500 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white font-black text-sm">📍</div>
               </div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([locationState.lat, locationState.lon], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        const newLat = parseFloat(newPos.lat.toFixed(6));
        const newLon = parseFloat(newPos.lng.toFixed(6));

        setLocationState((prev) => ({
          ...prev,
          lat: newLat,
          lon: newLon,
          address: `Pinned Location (${newLat}, ${newLon})`,
        }));
      });

      miniMapRef.current = map;
      markerRef.current = marker;
    } else {
      miniMapRef.current.setView([locationState.lat, locationState.lon], 14);
      if (markerRef.current) {
        markerRef.current.setLatLng([locationState.lat, locationState.lon]);
      }
    }
  }, [locationState.lat, locationState.lon]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locationState.searchType === 'gps') {
      onSearch(null, 'gps');
    } else {
      onSearch(locationState.searchQuery, locationState.searchType);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center space-x-2">
              <span>📍 Select Farm Location</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Choose your preferred search mode or use GPS to locate your farm parcel.
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 w-fit">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Interactive Map Centering</span>
          </div>
        </div>

        {/* Search Mode Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {LOCATION_SEARCH_TYPES.map((t) => {
            const isActive = locationState.searchType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setLocationState((prev) => ({
                    ...prev,
                    searchType: t.id,
                    error: '',
                  }));
                  if (t.id === 'gps') {
                    onSearch(null, 'gps');
                  }
                }}
                className={`py-2.5 px-3.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {locationState.searchType !== 'gps' ? (
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={locationState.searchQuery}
                  onChange={(e) =>
                    setLocationState((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  placeholder={activeTypeObj.placeholder}
                  className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
              </div>
            ) : (
              <div className="flex-1 bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 flex items-center space-x-3 text-xs text-emerald-800 font-bold">
                <Navigation className="w-5 h-5 text-emerald-600 animate-spin" />
                <span>
                  Locating device via GPS satellites. Ensure location permissions are enabled.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={locationState.loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-6 py-3.5 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
            >
              {locationState.loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{locationState.loading ? 'Searching...' : 'Locate Farm'}</span>
            </button>
          </div>

          {locationState.error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center space-x-2.5 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{locationState.error}</span>
            </div>
          )}
        </form>

        {/* Resolved Address Card & Lat/Lon Readout */}
        <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Detected Field Center</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400">
              Drag marker on map to fine-tune
            </span>
          </div>

          <p className="text-sm font-extrabold text-gray-900 leading-snug">
            {locationState.address}
          </p>

          <div className="flex items-center space-x-4 text-xs font-mono font-bold text-emerald-800 pt-1">
            <span>Lat: {locationState.lat.toFixed(5)}°</span>
            <span>Lon: {locationState.lon.toFixed(5)}°</span>
          </div>
        </div>

        {/* Mini Preview Map Container */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
            🗺️ Live Satellite Location Preview
          </label>
          <div
            ref={miniMapContainerRef}
            className="w-full h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative z-0"
          />
        </div>

        {/* Step Navigation Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold px-6 py-3.5 rounded-2xl text-sm transition-all flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Farm Details</span>
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <span>Continue to Draw Boundary</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2SelectLocation;
