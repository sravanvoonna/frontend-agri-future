import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import AuthPage from './AuthPage';
import UserProfile from './UserProfile';
import {
  Sprout,
  MapPin,
  Search,
  Activity,
  ShieldAlert,
  Database,
  UserCheck,
  Bot,
  Upload,
  RefreshCw,
  Trash2,
  Edit2,
  Plus,
  Info,
  Check,
  AlertTriangle,
  Layers,
  ChevronRight,
  X,
  FileText,
  Newspaper,
  Thermometer,
  Droplet,
  TrendingUp,
  Sliders,
  Sparkles,
  HelpCircle,
  Menu,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000/api'
    : 'https://agrifuture.azurewebsites.net/api');

const STATE_COORDINATES = {
  "Andhra Pradesh": { lat: 15.9129, lon: 79.7400 },
  "Arunachal Pradesh": { lat: 28.2180, lon: 94.7278 },
  "Assam": { lat: 26.2006, lon: 92.9376 },
  "Bihar": { lat: 25.0961, lon: 85.3131 },
  "Chhattisgarh": { lat: 21.2787, lon: 81.8661 },
  "Goa": { lat: 15.2993, lon: 74.1240 },
  "Gujarat": { lat: 22.2587, lon: 71.1924 },
  "Haryana": { lat: 29.0588, lon: 76.0856 },
  "Himachal Pradesh": { lat: 31.1048, lon: 77.1734 },
  "Jharkhand": { lat: 23.6102, lon: 85.2799 },
  "Karnataka": { lat: 15.3173, lon: 75.7139 },
  "Kerala": { lat: 10.8505, lon: 76.2711 },
  "Madhya Pradesh": { lat: 22.9734, lon: 78.6569 },
  "Maharashtra": { lat: 19.7515, lon: 75.7139 },
  "Manipur": { lat: 24.6637, lon: 93.9063 },
  "Meghalaya": { lat: 25.4670, lon: 91.3662 },
  "Mizoram": { lat: 23.1645, lon: 92.9376 },
  "Nagaland": { lat: 26.1584, lon: 94.5624 },
  "Odisha": { lat: 20.9517, lon: 85.0985 },
  "Punjab": { lat: 31.1471, lon: 75.3412 },
  "Rajasthan": { lat: 27.0238, lon: 74.2179 },
  "Sikkim": { lat: 27.5330, lon: 88.5122 },
  "Tamil Nadu": { lat: 11.1271, lon: 78.6569 },
  "Telangana": { lat: 18.1124, lon: 79.0193 },
  "Tripura": { lat: 23.9408, lon: 91.9882 },
  "Uttar Pradesh": { lat: 26.8467, lon: 80.9462 },
  "Uttarakhand": { lat: 30.0668, lon: 79.0193 },
  "West Bengal": { lat: 22.9868, lon: 87.8550 },
  "Jammu & Kashmir": { lat: 33.7782, lon: 76.5762 },
  "Puducherry": { lat: 11.9416, lon: 79.8083 }
};

const getWeatherDescription = (code, isDay = 1) => {
  const isNight = isDay === 0;
  const codes = {
    0: { desc: isNight ? 'Clear night' : 'Clear sky', icon: isNight ? '🌙' : '☀️' },
    1: { desc: isNight ? 'Mainly clear night' : 'Mainly clear', icon: isNight ? '🌙' : '🌤️' },
    2: { desc: isNight ? 'Partly cloudy night' : 'Partly cloudy', icon: isNight ? '☁️🌙' : '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌧️' },
    53: { desc: 'Moderate drizzle', icon: '🌧️' },
    55: { desc: 'Dense drizzle', icon: '🌧️' },
    56: { desc: 'Light freezing drizzle', icon: '🌧️' },
    57: { desc: 'Dense freezing drizzle', icon: '🌧️' },
    61: { desc: 'Slight rain', icon: '🌧️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    66: { desc: 'Light freezing rain', icon: '🌧️' },
    67: { desc: 'Heavy freezing rain', icon: '🌧️' },
    71: { desc: 'Slight snow fall', icon: '❄️' },
    73: { desc: 'Moderate snow fall', icon: '❄️' },
    75: { desc: 'Heavy snow fall', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '❄️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌦️' },
    82: { desc: 'Violent rain showers', icon: '🌦️' },
    85: { desc: 'Slight snow showers', icon: '🌨️' },
    86: { desc: 'Heavy snow showers', icon: '🌨️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm with light hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
  };
  return codes[code] || { desc: 'Unknown weather', icon: '🌡️' };
};

const getWeatherGradient = (code, isDay = 1) => {
  const isNight = isDay === 0;
  if (isNight) {
    if ([0, 1, 2].includes(code)) {
      return 'from-slate-900 via-indigo-950 to-slate-900';
    }
    return 'from-slate-950 via-blue-950 to-zinc-900';
  }
  if (code === undefined || code === null) return 'from-sky-500 via-blue-600 to-indigo-700';
  if ([0, 1, 2].includes(code)) {
    return 'from-amber-500 via-orange-500 to-amber-600';
  }
  if ([3, 45, 48].includes(code)) {
    return 'from-slate-400 via-gray-500 to-slate-600';
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
    return 'from-sky-600 via-blue-700 to-slate-800';
  }
  return 'from-sky-500 via-blue-600 to-indigo-700';
};

export default function App() {
  // ── Auth State ──────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agri_user')); } catch { return null; }
  });
  const [profileOpen, setProfileOpen] = useState(false);

  // ── Idle Auto-Signout (15 min inactivity) ───────────────────
  const IDLE_TIMEOUT_MS = 15 * 60 * 1000;  // 15 minutes
  const WARN_BEFORE_MS = 1 * 60 * 1000;  // warn 1 min before
  const [idleWarning, setIdleWarning] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(60);
  const idleTimerRef = React.useRef(null);
  const warnTimerRef = React.useRef(null);
  const countdownRef = React.useRef(null);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    // Force a complete browser reload to clear all in-memory React states and start fresh on the dashboard
    window.location.reload();
  };

  const handleSignOut = () => {
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    setCurrentUser(null);
    setProfileOpen(false);
    setIdleWarning(false);
    // Force a complete browser reload to clear all in-memory React states between different user sessions
    window.location.reload();
  };

  const clearIdleTimers = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const resetIdleTimer = React.useCallback(() => {
    if (!localStorage.getItem('agri_token')) return; // not logged in
    clearIdleTimers();
    setIdleWarning(false);
    setIdleCountdown(60);

    // Warn at 14 min
    warnTimerRef.current = setTimeout(() => {
      setIdleWarning(true);
      setIdleCountdown(60);
      // Tick countdown every second
      countdownRef.current = setInterval(() => {
        setIdleCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);

    // Sign out at 15 min
    idleTimerRef.current = setTimeout(() => {
      handleSignOut();
    }, IDLE_TIMEOUT_MS);
  }, []);

  // Start / stop idle tracking based on login state
  useEffect(() => {
    if (!currentUser) { clearIdleTimers(); return; }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer(); // start immediately on login

    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
      clearIdleTimers();
    };
  }, [currentUser, resetIdleTimer]);

  // Verify stored token on mount (silently clear if expired)
  useEffect(() => {
    const token = localStorage.getItem('agri_token');
    if (token) {
      axios.get(
        `${API_BASE_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => {
        setCurrentUser(r.data);
      }).catch((err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleSignOut();
        }
      });
    }
  }, []);

  // Silent activity logger — fires and forgets, no UI disruption
  const logUserActivity = (action_type, description, extra) => {
    const token = localStorage.getItem('agri_token');
    if (!token) return;
    axios.post(`${API_BASE_URL}/auth/activity`, { action_type, description, extra },
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch((err) => {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        handleSignOut();
      }
    });
  };


  // Language & Translation Helpers
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');
  const language = voiceLanguage.split('-')[0];
  const { t, i18n } = useTranslation();

  // Language change handler - changes i18n language for whole site
  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    // Also sync voice language
    const voiceLangMap = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN', mr: 'mr-IN' };
    setVoiceLanguage(voiceLangMap[langCode] || 'en-IN');
  };

  const handleGlowMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cropSubTab, setCropSubTab] = useState('catalog'); // 'catalog' or 'states'
  const [healthSubTab, setHealthSubTab] = useState('diseases'); // 'diseases' or 'chemicals'

  // Core Data States
  const [states, setStates] = useState([]);
  const [crops, setCrops] = useState([]);
  const [soils, setSoils] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [chemicals, setChemicals] = useState([]);

  // Dashboard & System States
  const [apiStats, setApiStats] = useState({
    total_states: 0,
    total_crops: 0,
    total_soils: 0,
    total_diseases: 0,
    total_chemicals: 0,
    activity_logs: []
  });
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Module Specific States
  // 1. State Selection Module
  const [selectedStateId, setSelectedStateId] = useState('');
  const [stateDetail, setStateDetail] = useState(null);
  const [stateSearchText, setStateSearchText] = useState('');
  const [stateDetailsCache, setStateDetailsCache] = useState({});
  const [weatherCache, setWeatherCache] = useState({});

  // 2. Crop Information Module
  const [cropFilterSeason, setCropFilterSeason] = useState('All');
  const [cropSearchText, setCropSearchText] = useState('');
  const [selectedCropDetail, setSelectedCropDetail] = useState(null);

  // 2b. {t('govtMsp')} Support Module
  const [mspSearchText, setMspSearchText] = useState('');
  const [mspFilterSeason, setMspFilterSeason] = useState('All');

  // 3. Soil Information Module
  const [soilSearchText, setSoilSearchText] = useState('');

  // 4. Disease Management Module
  const [diseaseSearchText, setDiseaseSearchText] = useState('');
  const [selectedDiseaseDetail, setSelectedDiseaseDetail] = useState(null);

  // 5. Chemical Module
  const [chemicalSearchText, setChemicalSearchText] = useState('');
  const [chemicalFilterType, setChemicalFilterType] = useState('All');

  // 6. Advanced Search Module
  const [advSearchQuery, setAdvSearchQuery] = useState('');
  const [advSearchCategory, setAdvSearchCategory] = useState('All');

  // 7. Crop Disease Finder Wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardStateId, setWizardStateId] = useState('');
  const [wizardCropId, setWizardCropId] = useState('');
  const [wizardDiseaseId, setWizardDiseaseId] = useState('');
  const [wizardCrops, setWizardCrops] = useState([]);
  const [wizardDiseases, setWizardDiseases] = useState([]);
  const [wizardChemicals, setWizardChemicals] = useState([]);

  // 8. Admin Panel CRUD States
  const [adminActiveSubTab, setAdminActiveSubTab] = useState('states');
  const [crudModalOpen, setCrudModalOpen] = useState(false);
  const [crudMode, setCrudMode] = useState('add'); // 'add' or 'edit'
  const [crudItem, setCrudItem] = useState(null); // Item being edited
  const [crudError, setCrudError] = useState('');

  // CRUD Form States
  const [stateForm, setStateForm] = useState({ state_name: '', climate: '', description: '' });
  const [cropForm, setCropForm] = useState({ crop_name: '', scientific_name: '', season: 'Kharif', water_requirement: 'Medium', yield: '', msp: '', state_ids: [], image_url: '', soil_ids: [] });
  const [soilForm, setSoilForm] = useState({ soil_name: '', characteristics: '', ph_range: '' });
  const [diseaseForm, setDiseaseForm] = useState({ disease_name: '', symptoms: '', causes: '', prevention: '', crop_id: '', image_url: '' });
  const [chemicalForm, setChemicalForm] = useState({ chemical_name: '', chemical_type: 'Fungicide', dosage: '', application_method: '', safety_precautions: '', disease_id: '' });

  // 9. AI Module States
  const [aiImageFile, setAiImageFile] = useState(null);
  const [aiImagePreview, setAiImagePreview] = useState(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiProgressText, setAiProgressText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSelectedCropId, setAiSelectedCropId] = useState('');
  const [aiError, setAiError] = useState('');

  // 10. Gemini Chat States
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', parts: ['Namaste! I am CropCare AI. Ask me any farming questions, or ask about soil health, fertilizers, and crop diseases!'] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [geminiApiKeyMissing, setGeminiApiKeyMissing] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // 11. MSP Year Selection & Prediction States
  const [selectedMspYear, setSelectedMspYear] = useState(2026);
  const [mspPredictionsData, setMspPredictionsData] = useState(null);
  const [mspPredictionsLoading, setMspPredictionsLoading] = useState(false);
  const [selectedMspChartCropId, setSelectedMspChartCropId] = useState(null);

  // Admin Authentication States
  const [adminPasswordModalOpen, setAdminPasswordModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState('');

  // Smart Scheduler States
  const [schedulerForm, setSchedulerForm] = useState({
    soil_type: '',
    crop_type: '',
    acres: '1',
    irrigation_type: 'Drip Irrigation',
    state_name: '',
    previous_crop: '',
    previous_yield: '',
    expected_yield: ''
  });
  const [schedulerResult, setSchedulerResult] = useState(null);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [schedulerError, setSchedulerError] = useState('');

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [welcomeTransitioning, setWelcomeTransitioning] = useState(false);
  const canvasRef = React.useRef(null);

  // 12. Weather, Mandi Prices, Profit Calculator & Soil Analyzer States
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [dashboardWeather, setDashboardWeather] = useState(null);
  const [dashboardWeatherLoading, setDashboardWeatherLoading] = useState(false);

  const [mandiPrices, setMandiPrices] = useState({});
  const [calcAcres, setCalcAcres] = useState('1');
  const [calcCostPerAcre, setCalcCostPerAcre] = useState('15000');

  const [soilAnalPh, setSoilAnalPh] = useState('6.8');
  const [soilAnalN, setSoilAnalN] = useState('Medium');
  const [soilAnalP, setSoilAnalP] = useState('Medium');
  const [soilAnalK, setSoilAnalK] = useState('Medium');

  const [isDragging, setIsDragging] = useState(false);

  // Govt Schemes Wizard States
  const [schemeStep, setSchemeStep] = useState(1);
  const [schemeLandSize, setSchemeLandSize] = useState('Marginal');
  const [schemeCropsType, setSchemeCropsType] = useState('Foodgrains');
  const [schemeIrrigation, setSchemeIrrigation] = useState('Rainfed');
  const [schemeDemographic, setSchemeDemographic] = useState('General');
  const [schemeIsTaxpayer, setSchemeIsTaxpayer] = useState(false);
  const [schemeSolarInterest, setSchemeSolarInterest] = useState(false);
  const [schemeMachineryInterest, setSchemeMachineryInterest] = useState(false);
  const [schemeDroneInterest, setSchemeDroneInterest] = useState(false);
  const [schemeResidueInterest, setSchemeResidueInterest] = useState(false);
  const [schemeChcInterest, setSchemeChcInterest] = useState(false);
  const [schemeStateId, setSchemeStateId] = useState('');
  // News Updates States
  const [news, setNews] = useState([]);
  const [newsSearchText, setNewsSearchText] = useState('');
  const [newsFilterCategory, setNewsFilterCategory] = useState('All');
  const [selectedNewsDetail, setSelectedNewsDetail] = useState(null);
  const [newsSyncing, setNewsSyncing] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', category: 'Scheme', source: '', image_url: '' });

  // ── Smart Farm Tools Constants & State Variables ──
  const CROP_PRESETS = {
    rice: { name: 'Paddy / Rice', seedTestWeight: 25, defaultRow: 20, defaultPlant: 15, optimalNPK: { N: 50, P: 25, K: 25 }, defaultPrice: 2300, growthDuration: 16 },
    wheat: { name: 'Wheat', seedTestWeight: 40, defaultRow: 22.5, defaultPlant: 10, optimalNPK: { N: 60, P: 30, K: 20 }, defaultPrice: 2400, growthDuration: 18 },
    maize: { name: 'Maize / Corn', seedTestWeight: 250, defaultRow: 60, defaultPlant: 20, optimalNPK: { N: 60, P: 30, K: 30 }, defaultPrice: 2200, growthDuration: 16 },
    cotton: { name: 'Cotton', seedTestWeight: 100, defaultRow: 90, defaultPlant: 45, optimalNPK: { N: 40, P: 20, K: 20 }, defaultPrice: 7000, growthDuration: 24 }
  };

  const [toolsTab, setToolsTab] = useState('calculators'); // 'calculators' | 'diagnostics' | 'predictor'
  const [toolsCalcSubTab, setToolsCalcSubTab] = useState('seed'); // 'seed' | 'npk' | 'water'

  // Seed Rate Calculator States
  const [seedCrop, setSeedCrop] = useState('rice');
  const [seedAcres, setSeedAcres] = useState('1');
  const [seedRowSpacing, setSeedRowSpacing] = useState('20');
  const [seedPlantSpacing, setSeedPlantSpacing] = useState('15');
  const [seedGermination, setSeedGermination] = useState('85');

  // NUE/NPK Calculator States
  const [nueCrop, setNueCrop] = useState('rice');
  const [nueYield, setNueYield] = useState('20');
  const [nueUreaBags, setNueUreaBags] = useState('2');
  const [nueSspBags, setNueSspBags] = useState('2.5');
  const [nueMopBags, setNueMopBags] = useState('1');

  // Irrigation Calculator States
  const [waterStage, setWaterStage] = useState('vegetative');
  const [waterTemp, setWaterTemp] = useState('28');
  const [waterSoil, setWaterSoil] = useState('loam');
  const [waterAcres, setWaterAcres] = useState('1');

  // Soil Diagnostics States
  const [soilDiagPh, setSoilDiagPh] = useState('6.8');
  const [soilDiagEc, setSoilDiagEc] = useState('0.8');
  const [soilDiagOc, setSoilDiagOc] = useState('0.6');
  const [soilDiagN, setSoilDiagN] = useState('Medium');
  const [soilDiagP, setSoilDiagP] = useState('Medium');
  const [soilDiagK, setSoilDiagK] = useState('Medium');

  // Yield Predictor States
  const [predCrop, setPredCrop] = useState('rice');
  const [predAcres, setPredAcres] = useState('1');
  const [predExpectedPrice, setPredExpectedPrice] = useState('2300');
  const [predCultCost, setPredCultCost] = useState('15000');
  const [predWeeks, setPredWeeks] = useState('12');

  // ── Browser History / Back Button Support ──
  const isPopStateRef = React.useRef(false);

  useEffect(() => {
    const initialState = {
      activeTab: 'dashboard',
      profileOpen: false,
      cropDetail: null,
      diseaseDetail: null,
      newsDetail: null,
      stateDetail: null,
      chatbotOpen: false,
      adminPasswordModalOpen: false,
      toolsTab: 'calculators',
      toolsCalcSubTab: 'seed'
    };
    window.history.replaceState(initialState, '');

    const handlePopState = (event) => {
      if (event.state) {
        isPopStateRef.current = true;
        const state = event.state;
        
        setActiveTab(state.activeTab || 'dashboard');
        setProfileOpen(state.profileOpen || false);
        setSelectedCropDetail(state.cropDetail || null);
        setSelectedDiseaseDetail(state.diseaseDetail || null);
        setSelectedNewsDetail(state.newsDetail || null);
        setStateDetail(state.stateDetail || null);
        setChatbotOpen(state.chatbotOpen || false);
        setAdminPasswordModalOpen(state.adminPasswordModalOpen || false);
        setToolsTab(state.toolsTab || 'calculators');
        setToolsCalcSubTab(state.toolsCalcSubTab || 'seed');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    const currentState = {
      activeTab,
      profileOpen,
      cropDetail: selectedCropDetail,
      diseaseDetail: selectedDiseaseDetail,
      newsDetail: selectedNewsDetail,
      stateDetail,
      chatbotOpen,
      adminPasswordModalOpen,
      toolsTab,
      toolsCalcSubTab
    };

    const historyState = window.history.state;
    const isDifferent = !historyState ||
      historyState.activeTab !== currentState.activeTab ||
      historyState.profileOpen !== currentState.profileOpen ||
      (historyState.cropDetail?.id !== currentState.cropDetail?.id) ||
      (historyState.diseaseDetail?.id !== currentState.diseaseDetail?.id) ||
      (historyState.newsDetail?.id !== currentState.newsDetail?.id) ||
      (historyState.stateDetail?.id !== currentState.stateDetail?.id) ||
      historyState.chatbotOpen !== currentState.chatbotOpen ||
      historyState.adminPasswordModalOpen !== currentState.adminPasswordModalOpen ||
      historyState.toolsTab !== currentState.toolsTab ||
      historyState.toolsCalcSubTab !== currentState.toolsCalcSubTab;

    if (isDifferent) {
      window.history.pushState(currentState, '');
    }
  }, [activeTab, profileOpen, selectedCropDetail, selectedDiseaseDetail, selectedNewsDetail, stateDetail, chatbotOpen, adminPasswordModalOpen, toolsTab, toolsCalcSubTab]);

  const handleCloseDetail = (type) => {
    const state = window.history.state;
    if (state && (
      (type === 'crop' && state.cropDetail) ||
      (type === 'disease' && state.diseaseDetail) ||
      (type === 'news' && state.newsDetail) ||
      (type === 'profile' && state.profileOpen) ||
      (type === 'chatbot' && state.chatbotOpen) ||
      (type === 'adminPassword' && state.adminPasswordModalOpen)
    )) {
      window.history.back();
    } else {
      if (type === 'crop') setSelectedCropDetail(null);
      if (type === 'disease') setSelectedDiseaseDetail(null);
      if (type === 'news') setSelectedNewsDetail(null);
      if (type === 'profile') setProfileOpen(false);
      if (type === 'chatbot') setChatbotOpen(false);
      if (type === 'adminPassword') setAdminPasswordModalOpen(false);
    }
  };

  // Agricultural Loading Phrases
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const loadingPhrases = [
    "Ploughing the virtual fields...",
    "Sowing the seeds of crop data...",
    "Watering the soil databases...",
    "Nurturing the disease registries...",
    "Sunny rays reaching the advisory server...",
    "Waking up the Cerevyn Research container..."
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const fetchWeatherForState = async (stateName) => {
    if (!stateName) return;
    if (weatherCache[stateName]) {
      setWeatherData(weatherCache[stateName]);
      return;
    }
    const coords = STATE_COORDINATES[stateName] || { lat: 28.6139, lon: 79.7400 };
    setWeatherLoading(true);
    try {
      const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`);
      if (res.data && res.data.current_weather) {
        const wData = {
          ...res.data.current_weather,
          stateName: stateName
        };
        setWeatherCache(prev => ({ ...prev, [stateName]: wData }));
        setWeatherData(wData);
      }
    } catch (err) {
      console.error(`Error fetching weather for state ${stateName}:`, err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardWeather = async () => {
      setDashboardWeatherLoading(true);
      try {
        const lat = 28.6139; // New Delhi
        const lon = 77.2090;
        const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (res.data && res.data.current_weather) {
          setDashboardWeather(res.data.current_weather);
        }
      } catch (err) {
        console.error("Error fetching dashboard weather:", err);
      } finally {
        setDashboardWeatherLoading(false);
      }
    };
    fetchDashboardWeather();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMandiPrices(prev => {
        const updated = { ...prev };
        crops.forEach(crop => {
          if (!crop.msp || crop.msp === 'N/A') return;
          const basePriceMatch = crop.msp.match(/\d+[\d,.]*/);
          const basePrice = basePriceMatch ? parseFloat(basePriceMatch[0].replace(/,/g, '')) : 2000;

          if (!updated[crop.id]) {
            updated[crop.id] = [
              { mandi: 'Azadpur Mandi (Delhi)', price: Math.round(basePrice * 1.05), change: 0, trend: 'stable' },
              { mandi: 'Vashi Mandi (Mumbai)', price: Math.round(basePrice * 1.08), change: 0, trend: 'stable' },
              { mandi: 'Kalyan Mandi (Kolkata)', price: Math.round(basePrice * 1.02), change: 0, trend: 'stable' },
              { mandi: 'Guntur Mandi (AP)', price: Math.round(basePrice * 1.04), change: 0, trend: 'stable' }
            ];
          } else {
            updated[crop.id] = updated[crop.id].map(m => {
              const delta = Math.floor(Math.random() * 31) - 15;
              const newPrice = Math.max(Math.round(basePrice * 0.9), m.price + delta);
              let trend = 'stable';
              if (delta > 3) trend = 'up';
              else if (delta < -3) trend = 'down';
              return {
                ...m,
                price: newPrice,
                change: delta,
                trend: trend === 'stable' ? m.trend : trend
              };
            });
          }
        });
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [crops]);

  const getCalculationResults = (crop) => {
    if (!crop) return null;
    const mspMatch = crop.msp ? crop.msp.match(/\d+[\d,.]*/) : null;
    const mspPerQuintal = mspMatch ? parseFloat(mspMatch[0].replace(/,/g, '')) : 2000;

    const yieldMatches = crop.yield ? crop.yield.match(/\d+[\d,.]*/g) : null;
    let avgYieldTonsPerHectare = 3.5;
    if (yieldMatches) {
      if (yieldMatches.length >= 2) {
        avgYieldTonsPerHectare = (parseFloat(yieldMatches[0]) + parseFloat(yieldMatches[1])) / 2;
      } else {
        avgYieldTonsPerHectare = parseFloat(yieldMatches[0]);
      }
    }

    const yieldTonsPerAcre = avgYieldTonsPerHectare / 2.47;
    const yieldQuintalsPerAcre = yieldTonsPerAcre * 10;

    const acres = parseFloat(calcAcres) || 0;
    const costPerAcre = parseFloat(calcCostPerAcre) || 0;

    const totalYieldQuintals = yieldQuintalsPerAcre * acres;
    const totalCost = costPerAcre * acres;
    const totalRevenue = totalYieldQuintals * mspPerQuintal;
    const netProfit = totalRevenue - totalCost;
    const profitMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 105 : 0;

    return {
      yieldPerAcre: yieldQuintalsPerAcre.toFixed(1),
      totalYield: totalYieldQuintals.toFixed(1),
      totalCost: Math.round(totalCost),
      totalRevenue: Math.round(totalRevenue),
      netProfit: Math.round(netProfit),
      profitMarginPct: Math.min(100, Math.max(0, Math.round(profitMarginPct)))
    };
  };

  const getSoilRecommendations = () => {
    const ph = parseFloat(soilAnalPh) || 7.0;

    let ureaBags = 2.0;
    if (soilAnalN === 'Low') ureaBags = 3.0;
    else if (soilAnalN === 'High') ureaBags = 1.0;

    let sspBags = 2.5;
    if (soilAnalP === 'Low') sspBags = 4.0;
    else if (soilAnalP === 'High') sspBags = 1.0;

    let mopBags = 1.0;
    if (soilAnalK === 'Low') mopBags = 1.5;
    else if (soilAnalK === 'High') mopBags = 0.5;

    let amendment = "";
    let colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (ph < 6.0) {
      amendment = "Highly acidic. Apply Lime (Calcium Carbonate) at 1.5 - 2.0 tons per acre to neutralize acidity and improve nutrient uptake.";
      colorClass = "text-amber-800 bg-amber-50 border-amber-200";
    } else if (ph > 8.5) {
      amendment = "Highly alkaline/sodic. Apply Gypsum (Calcium Sulfate) at 1.5 - 2.5 tons per acre to replace sodium with calcium and improve soil structure.";
      colorClass = "text-rose-800 bg-rose-50 border-rose-200";
    } else if (ph > 7.5) {
      amendment = "Mildly alkaline. Use acid-forming fertilizers like Ammonium Sulfate instead of Urea. Keep organic carbon high with crop residues.";
      colorClass = "text-blue-800 bg-blue-50 border-blue-200";
    } else {
      amendment = "Optimal pH range. Maintain organic carbon levels using well-rotted Farmyard Manure (FYM) or green manuring.";
      colorClass = "text-emerald-800 bg-emerald-50 border-emerald-200";
    }

    return {
      urea: ureaBags,
      ssp: sspBags,
      mop: mopBags,
      amendment,
      colorClass
    };
  };

  // Fetch all basic data on mount and when voiceLanguage changes
  useEffect(() => {
    setStateDetailsCache({});
    fetchCoreData();
  }, [voiceLanguage]);

  // Fetch MSP predictions from the backend linear regression model
  const fetchMspPredictions = async (year) => {
    setMspPredictionsLoading(true);
    const lang = voiceLanguage.split('-')[0];
    try {
      const res = await axios.get(`${API_BASE_URL}/predict-msp?year=${year}&lang=${lang}`);
      setMspPredictionsData(res.data);
      // Automatically select the first crop for chart representation if not set yet
      if (res.data.predictions && res.data.predictions.length > 0 && !selectedMspChartCropId) {
        setSelectedMspChartCropId(res.data.predictions[0].crop_id);
      }
    } catch (err) {
      console.error('Error fetching MSP predictions:', err);
    } finally {
      setMspPredictionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gov-msp') {
      fetchMspPredictions(selectedMspYear);
    }
  }, [activeTab, selectedMspYear, voiceLanguage]);

  // Dynamically update welcome message when voice language changes
  useEffect(() => {
    if (chatMessages.length <= 1) {
      let welcomeMsg = 'Namaste! I am CropCare AI. Ask me any farming questions, or ask about soil health, fertilizers, and crop diseases!';
      if (voiceLanguage === 'hi-IN') {
        welcomeMsg = 'नमस्ते! मैं क्रॉपकेयर एआई (CropCare AI) हूँ। मुझसे खेती से जुड़ा कोई भी सवाल पूछें, या मिट्टी की सेहत, उर्वरकों और फसल के रोगों के बारे में जानकारी पाएं!';
      } else if (voiceLanguage === 'te-IN') {
        welcomeMsg = 'నమస్తే! నేను క్రాప్‌కేర్ AI (CropCare AI). నన్ను వ్యవసాయానికి సంబంధించిన ఏవైనా ప్రశ్నలు అడగండి, లేదా నేల ఆరోగ్యం, ఎరువులు మరియు పంట తెగుళ్ల గురించి తెలుసుకోండి!';
      } else if (voiceLanguage === 'mr-IN') {
        welcomeMsg = 'नमस्कार! मी क्रॉपकेअर एआय (CropCare AI) आहे. मला शेतीशी संबंधित कोणताही प्रश्न विचारा, किंवा मातीचे आरोग्य, खते आणि पिकांच्या रोगांबद्दल माहिती मिळवा!';
      }
      setChatMessages([{ role: 'model', parts: [welcomeMsg] }]);
    }
  }, [voiceLanguage]);

  // Fetch admin stats and details
  const fetchCoreData = async () => {
    setLoading(true);
    setErrorMessage('');
    const lang = voiceLanguage.split('-')[0];
    try {
      // Test backend connection
      const healthRes = await axios.get(API_BASE_URL.replace('/api', ''));
      if (healthRes.data && healthRes.data.status === 'online') {
        setApiOnline(true);
      }

      // Load core data
      const [statesRes, cropsRes, soilsRes, diseasesRes, chemicalsRes, statsRes, newsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/states?lang=${lang}`),
        axios.get(`${API_BASE_URL}/crops?lang=${lang}`),
        axios.get(`${API_BASE_URL}/soils?lang=${lang}`),
        axios.get(`${API_BASE_URL}/diseases?lang=${lang}`),
        axios.get(`${API_BASE_URL}/chemicals?lang=${lang}`),
        axios.get(`${API_BASE_URL}/admin/stats`),
        axios.get(`${API_BASE_URL}/news?lang=${lang}`)
      ]);

      setStates(statesRes.data);
      setCrops(cropsRes.data);
      setSoils(soilsRes.data);
      setDiseases(diseasesRes.data);
      setChemicals(chemicalsRes.data);
      setApiStats(statsRes.data);
      setNews(newsRes.data);

      try {
        localStorage.setItem('cached_states', JSON.stringify(statesRes.data));
        localStorage.setItem('cached_crops', JSON.stringify(cropsRes.data));
        localStorage.setItem('cached_soils', JSON.stringify(soilsRes.data));
        localStorage.setItem('cached_diseases', JSON.stringify(diseasesRes.data));
        localStorage.setItem('cached_chemicals', JSON.stringify(chemicalsRes.data));
        localStorage.setItem('cached_stats', JSON.stringify(statsRes.data));
        localStorage.setItem('cached_news', JSON.stringify(newsRes.data));
      } catch (storageErr) {
        console.error('Failed to write to localStorage cache:', storageErr);
      }

      // Default selections
      if (statesRes.data.length > 0) {
        setSelectedStateId(statesRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching API data, trying offline cache:', err);

      const cachedStates = localStorage.getItem('cached_states');
      const cachedCrops = localStorage.getItem('cached_crops');
      const cachedSoils = localStorage.getItem('cached_soils');
      const cachedDiseases = localStorage.getItem('cached_diseases');
      const cachedChemicals = localStorage.getItem('cached_chemicals');
      const cachedStats = localStorage.getItem('cached_stats');
      const cachedNews = localStorage.getItem('cached_news');

      if (cachedStates && cachedCrops) {
        setStates(JSON.parse(cachedStates));
        setCrops(JSON.parse(cachedCrops));
        setSoils(JSON.parse(cachedSoils));
        setDiseases(JSON.parse(cachedDiseases));
        setChemicals(JSON.parse(cachedChemicals));
        if (cachedStats) setApiStats(JSON.parse(cachedStats));
        if (cachedNews) setNews(JSON.parse(cachedNews));

        setApiOnline(false);
        setErrorMessage('Offline Mode - Serving locally cached agricultural database.');

        const parsedStates = JSON.parse(cachedStates);
        if (parsedStates.length > 0) {
          setSelectedStateId(parsedStates[0].id.toString());
        }
      } else {
        setApiOnline(false);
        setErrorMessage('Could not connect to the Python Flask REST API server and no offline cache is available.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch stats and list data after admin updates
  const refreshData = async () => {
    const lang = voiceLanguage.split('-')[0];
    try {
      const [statesRes, cropsRes, soilsRes, diseasesRes, chemicalsRes, statsRes, newsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/states?lang=${lang}`),
        axios.get(`${API_BASE_URL}/crops?lang=${lang}`),
        axios.get(`${API_BASE_URL}/soils?lang=${lang}`),
        axios.get(`${API_BASE_URL}/diseases?lang=${lang}`),
        axios.get(`${API_BASE_URL}/chemicals?lang=${lang}`),
        axios.get(`${API_BASE_URL}/admin/stats`),
        axios.get(`${API_BASE_URL}/news?lang=${lang}`)
      ]);

      setStates(statesRes.data);
      setCrops(cropsRes.data);
      setSoils(soilsRes.data);
      setDiseases(diseasesRes.data);
      setChemicals(chemicalsRes.data);
      setApiStats(statsRes.data);
      setNews(newsRes.data);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const handleSyncNews = async () => {
    setNewsSyncing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/news/sync`);
      if (res.data && res.data.success) {
        alert(res.data.message);
        await refreshData();
      }
    } catch (err) {
      console.error("Failed to sync news:", err);
      alert("Error checking for updates. Make sure the backend server is running.");
    } finally {
      setNewsSyncing(false);
    }
  };

  // Track Active Tab changes for logging MSP & News views
  useEffect(() => {
    if (activeTab === 'gov-msp') {
      logUserActivity('msp_viewed', 'Looked up Govt MSP prices & forecasts', { tab: 'gov-msp' });
    } else if (activeTab === 'news-updates') {
      logUserActivity('news_viewed', 'Read latest agricultural news alerts', { tab: 'news-updates' });
    }
  }, [activeTab]);

  // 1. Fetch State Detail & Weather (Optimized Parallel Loading with Cache)
  useEffect(() => {
    if (!selectedStateId) return;

    const lang = voiceLanguage.split('-')[0];
    // A. Handle State Detail (Cache lookup or HTTP Fetch)
    if (stateDetailsCache[selectedStateId]) {
      setStateDetail(stateDetailsCache[selectedStateId]);
    } else {
      axios.get(`${API_BASE_URL}/states/${selectedStateId}?lang=${lang}`)
        .then(res => {
          setStateDetailsCache(prev => ({ ...prev, [selectedStateId]: res.data }));
          setStateDetail(res.data);
        })
        .catch(err => console.error(err));
    }

    // B. Handle Weather Fetch (Parallel and Instant)
    const foundState = states.find(st => st.id.toString() === selectedStateId.toString());
    if (foundState && foundState.state_name) {
      fetchWeatherForState(foundState.state_name);
    }
  }, [selectedStateId, states, voiceLanguage]);

  // Handle Crop Click
  const handleCropClick = (cropId) => {
    const lang = voiceLanguage.split('-')[0];
    axios.get(`${API_BASE_URL}/crops/${cropId}?lang=${lang}`)
      .then(res => {
        setSelectedCropDetail(res.data);
        logUserActivity('crop_viewed', `Viewed details for crop: ${res.data.crop_name}`, { crop_id: cropId });
      })
      .catch(err => console.error(err));
  };

  // Handle Disease Click
  const handleDiseaseClick = (diseaseId) => {
    const lang = voiceLanguage.split('-')[0];
    axios.get(`${API_BASE_URL}/diseases/${diseaseId}?lang=${lang}`)
      .then(res => {
        setSelectedDiseaseDetail(res.data);
        logUserActivity('disease_viewed', `Looked up disease details for: ${res.data.disease_name}`, { disease_id: diseaseId });
      })
      .catch(err => console.error(err));
  };

  // Wizard Logic Changes
  useEffect(() => {
    if (wizardStateId) {
      // Filter crops matching this state
      const stateCrops = crops.filter(c => c.state_ids && c.state_ids.includes(parseInt(wizardStateId)));
      setWizardCrops(stateCrops);
      setWizardCropId('');
      setWizardDiseaseId('');
      setWizardChemicals([]);
    }
  }, [wizardStateId, crops]);

  useEffect(() => {
    if (wizardCropId) {
      const lang = voiceLanguage.split('-')[0];
      // Fetch crop details to get its diseases
      axios.get(`${API_BASE_URL}/crops/${wizardCropId}?lang=${lang}`)
        .then(res => {
          setWizardDiseases(res.data.diseases || []);
          setWizardDiseaseId('');
          setWizardChemicals([]);
        })
        .catch(err => console.error(err));
    }
  }, [wizardCropId, voiceLanguage]);

  useEffect(() => {
    if (wizardDiseaseId) {
      const lang = voiceLanguage.split('-')[0];
      // Fetch disease details to get chemicals
      axios.get(`${API_BASE_URL}/diseases/${wizardDiseaseId}?lang=${lang}`)
        .then(res => {
          setWizardChemicals(res.data.chemicals || []);
        })
        .catch(err => console.error(err));
    }
  }, [wizardDiseaseId, voiceLanguage]);

  const resetWizard = () => {
    setWizardStep(1);
    setWizardStateId('');
    setWizardCropId('');
    setWizardDiseaseId('');
    setWizardCrops([]);
    setWizardDiseases([]);
    setWizardChemicals([]);
  };

  // CRUD Actions
  const openAddModal = (type) => {
    setCrudMode('add');
    setCrudItem(null);
    setCrudError('');

    // Clear forms
    setStateForm({ state_name: '', climate: '', description: '' });
    setCropForm({ crop_name: '', scientific_name: '', season: 'Kharif', water_requirement: 'Medium', yield: '', msp: '', state_ids: states[0] ? [states[0].id] : [], image_url: '', soil_ids: [] });
    setSoilForm({ soil_name: '', characteristics: '', ph_range: '' });
    setDiseaseForm({ disease_name: '', symptoms: '', causes: '', prevention: '', crop_id: crops[0]?.id || '', image_url: '' });
    setChemicalForm({ chemical_name: '', chemical_type: 'Fungicide', dosage: '', application_method: '', safety_precautions: '', disease_id: diseases[0]?.id || '' });
    setNewsForm({ title: '', content: '', category: 'Scheme', source: '', image_url: '' });

    setCrudModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setCrudMode('edit');
    setCrudItem(item);
    setCrudError('');

    if (type === 'states') {
      setStateForm({
        state_name: item.state_name,
        climate: item.climate,
        description: item.description
      });
    } else if (type === 'crops') {
      // Find matching soil IDs from soil names
      const matchedSoilIds = soils
        .filter(s => item.soils.includes(s.soil_name))
        .map(s => s.id);

      setCropForm({
        crop_name: item.crop_name,
        scientific_name: item.scientific_name,
        season: item.season,
        water_requirement: item.water_requirement,
        yield: item.yield,
        msp: item.msp || '',
        state_ids: item.state_ids || (item.state_id ? [item.state_id] : []),
        image_url: item.image_url || '',
        soil_ids: matchedSoilIds
      });
    } else if (type === 'soils') {
      setSoilForm({
        soil_name: item.soil_name,
        characteristics: item.characteristics,
        ph_range: item.ph_range
      });
    } else if (type === 'diseases') {
      setDiseaseForm({
        disease_name: item.disease_name,
        symptoms: item.symptoms,
        causes: item.causes,
        prevention: item.prevention,
        crop_id: item.crop_id,
        image_url: item.image_url || ''
      });
    } else if (type === 'chemicals') {
      setChemicalForm({
        chemical_name: item.chemical_name,
        chemical_type: item.chemical_type,
        dosage: item.dosage,
        application_method: item.application_method,
        safety_precautions: item.safety_precautions,
        disease_id: item.disease_id
      });
    } else if (type === 'news') {
      setNewsForm({
        title: item.title,
        content: item.content,
        category: item.category,
        source: item.source || '',
        image_url: item.image_url || ''
      });
    }

    setCrudModalOpen(true);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/${type}/${id}`);
      refreshData();
    } catch (err) {
      alert(`Error deleting item: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleCrudSubmit = async (e) => {
    e.preventDefault();
    setCrudError('');
    let url = `${API_BASE_URL}/${adminActiveSubTab}`;
    let method = 'POST';
    let payload = {};

    if (crudMode === 'edit') {
      url = `${API_BASE_URL}/${adminActiveSubTab}/${crudItem.id}`;
      method = 'PUT';
    }

    // Assign payloads
    if (adminActiveSubTab === 'states') {
      payload = stateForm;
      if (!payload.state_name) return setCrudError('State name is required');
    } else if (adminActiveSubTab === 'crops') {
      payload = cropForm;
      if (!payload.crop_name || (!payload.state_ids || payload.state_ids.length === 0)) return setCrudError('Crop name and State locations are required');
    } else if (adminActiveSubTab === 'soils') {
      payload = soilForm;
      if (!payload.soil_name) return setCrudError('Soil name is required');
    } else if (adminActiveSubTab === 'diseases') {
      payload = diseaseForm;
      if (!payload.disease_name || !payload.crop_id) return setCrudError('Disease name and Crop are required');
    } else if (adminActiveSubTab === 'chemicals') {
      payload = chemicalForm;
      if (!payload.chemical_name || !payload.disease_id) return setCrudError('Chemical name and Target Disease are required');
    } else if (adminActiveSubTab === 'news') {
      payload = newsForm;
      if (!payload.title || !payload.content) return setCrudError('News title and content are required');
    }

    try {
      if (method === 'POST') {
        await axios.post(url, payload);
      } else {
        await axios.put(url, payload);
      }
      setCrudModalOpen(false);
      refreshData();
    } catch (err) {
      setCrudError(err.response?.data?.error || err.message);
    }
  };

  const handleSchedulerSubmit = async (e) => {
    e.preventDefault();
    setSchedulerLoading(true);
    setSchedulerError('');
    setSchedulerResult(null);

    const lang = voiceLanguage.split('-')[0];
    try {
      const response = await axios.post(`${API_BASE_URL}/gemini/schedule?lang=${lang}`, schedulerForm);
      setSchedulerResult(response.data);
      logUserActivity('scheduler_used', `Generated cultivation schedule for ${schedulerForm.crop_type} in ${schedulerForm.soil_type} soil`, { crop_type: schedulerForm.crop_type, soil_type: schedulerForm.soil_type });
    } catch (err) {
      console.error(err);
      setSchedulerError(err.response?.data?.error || err.message || 'Failed to generate cultivation schedule.');
    } finally {
      setSchedulerLoading(false);
    }
  };

  const downloadSchedulerPdf = () => {
    if (!schedulerResult) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert("Please allow popups to download the PDF report.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AgriFuture Cultivation Advisory Report</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1f2937;
            line-height: 1.5;
            padding: 40px;
            background-color: #ffffff;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #059669;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title-area h1 {
            color: #065f46;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .title-area p {
            color: #059669;
            margin: 4px 0 0 0;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          .meta-info {
            text-align: right;
            font-size: 11px;
            color: #6b7280;
          }
          .summary-grid {
            display: grid;
            grid-template-cols: repeat(2, 1fr);
            gap: 15px;
            background: #f0fdfa;
            border: 1px solid #ccfbf1;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .summary-item {
            font-size: 13px;
          }
          .summary-item strong {
            color: #0f766e;
          }
          .section-title {
            color: #111827;
            font-size: 16px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 35px;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
          }
          .feasibility-box {
            background: #f8fafc;
            border-left: 4px solid #0284c7;
            padding: 15px 20px;
            border-radius: 4px 8px 8px 4px;
            margin-bottom: 25px;
          }
          .feasibility-status {
            font-weight: 800;
            font-size: 14px;
            color: #0369a1;
            text-transform: uppercase;
          }
          .feasibility-analysis {
            font-size: 13px;
            color: #334155;
            margin-top: 6px;
          }
          .timeline-stage {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .timeline-phase {
            font-size: 14px;
            font-weight: 800;
            color: #065f46;
          }
          .timeline-days {
            font-size: 11px;
            font-weight: 700;
            background: #ecfdf5;
            color: #059669;
            padding: 4px 10px;
            border-radius: 9999px;
            border: 1px solid #d1fae5;
          }
          .activities-list {
            margin: 0;
            padding-left: 20px;
            font-size: 13px;
            color: #4b5563;
          }
          .activities-list li {
            margin-bottom: 8px;
          }
          .advice-grid {
            display: grid;
            grid-template-cols: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #e5e7eb;
            font-size: 12px;
          }
          .advice-block strong {
            color: #0f766e;
            display: block;
            margin-bottom: 4px;
          }
          .tips-list {
            padding-left: 20px;
            font-size: 13px;
            color: #4b5563;
          }
          .tips-list li {
            margin-bottom: 8px;
          }
          .warning-box {
            background: #fffbeb;
            border: 1px solid #fef3c7;
            border-left: 4px solid #d97706;
            padding: 15px 20px;
            border-radius: 8px;
            margin-top: 25px;
            page-break-inside: avoid;
          }
          .warning-box h4 {
            margin: 0 0 6px 0;
            color: #92400e;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title-area">
            <h1>AgriFuture Cultivation Plan</h1>
            <p>Smart Advisory Report</p>
          </div>
          <div class="meta-info">
            Generated: ${new Date().toLocaleDateString('en-IN')}<br>
            Powered by Cerevyn AI
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-item"><strong>Target Crop:</strong> ${schedulerForm.crop_type}</div>
          <div class="summary-item"><strong>Soil Type:</strong> ${schedulerForm.soil_type}</div>
          <div class="summary-item"><strong>Farm Size:</strong> ${schedulerForm.acres} Acres</div>
          <div class="summary-item"><strong>Irrigation:</strong> ${schedulerForm.irrigation_type}</div>
          <div class="summary-item"><strong>Previous Crop:</strong> ${schedulerForm.previous_crop || 'N/A'}</div>
          <div class="summary-item"><strong>Previous Yield:</strong> ${schedulerForm.previous_yield ? `${schedulerForm.previous_yield} Quintals` : 'N/A'}</div>
          <div class="summary-item"><strong>{t('expectedYield')} Target:</strong> ${schedulerForm.expected_yield ? `${schedulerForm.expected_yield} Quintals` : 'N/A'}</div>
          <div class="summary-item"><strong>Location State:</strong> ${schedulerForm.state_name || 'N/A'}</div>
        </div>

        <div class="section-title">Target Yield Feasibility</div>
        <div class="feasibility-box">
          <div class="feasibility-status">${schedulerResult.target_yield_feasibility?.status || 'Advisory Generated'}</div>
          <div class="feasibility-analysis">${schedulerResult.target_yield_feasibility?.analysis || 'Feasibility analysis of yield target.'}</div>
        </div>

        <div class="section-title">Cultivation Timeline & Phases</div>
        ${schedulerResult.crop_schedule?.map((item) =>
      '<div class="timeline-stage">' +
      '  <div class="timeline-header">' +
      '    <span class="timeline-phase">' + item.phase + '</span>' +
      '    <span class="timeline-days">' + item.timeline + '</span>' +
      '  </div>' +
      '  <ul class="activities-list">' +
      (item.activities?.map(act => '<li>' + act + '</li>').join('') || '') +
      '  </ul>' +
      '  <div class="advice-grid">' +
      '    <div class="advice-block">' +
      '      <strong>Water Management Advice</strong>' +
      '      <span>' + item.irrigation_advice + '</span>' +
      '    </div>' +
      '    <div class="advice-block">' +
      '      <strong>Fertilizer & NPK Dosage</strong>' +
      '      <span>' + item.fertilizer_dosage + '</span>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    ).join('')}

        ${schedulerResult.soil_and_fertilizer_tips?.length ? `
          <div class="section-title">Soil & Fertilizer Management Tips</div>
          <ul class="tips-list">
            ${schedulerResult.soil_and_fertilizer_tips.map(tip => '<li>' + tip + '</li>').join('')}
          </ul>
        ` : ''}

        ${schedulerResult.general_suggestions?.length ? `
          <div class="section-title">General Suggestions</div>
          <ul class="tips-list">
            ${schedulerResult.general_suggestions.map(sug => '<li>' + sug + '</li>').join('')}
          </ul>
        ` : ''}

        ${schedulerResult.warnings?.length ? `
          <div class="warning-box">
            <h4>Potential Risks & Warnings</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${schedulerResult.warnings.map(warn => '<li>' + warn + '</li>').join('')}
            </ul>
          </div>
        ` : ''}

        <div class="footer">
          This cultivation advisory report is AI-generated for general guidance. Consult regional agricultural officers for local amendments.<br>
          © ${new Date().getFullYear()} AgriFuture Advisory System. All rights reserved.
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // AI Diagnostic Simulation
  const handleAiImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAiImageFile(file);
      setAiImagePreview(URL.createObjectURL(file));
      setAiResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setAiImageFile(file);
        setAiImagePreview(URL.createObjectURL(file));
        setAiResult(null);
        setAiError('');
      } else {
        setAiError('Please upload a valid image file (PNG, JPG, or JPEG).');
      }
    }
  };

  const runAiDiagnostics = () => {
    if (!aiImageFile) return;

    setAiAnalyzing(true);
    setAiProgress(10);
    setAiProgressText('Uploading leaf image to Cerevyn Research Azure AI server...');
    setGeminiApiKeyMissing(false);
    setAiError('');

    // Get suspected crop name
    const suspectedCrop = crops.find(c => c.id === parseInt(aiSelectedCropId))?.crop_name || 'unknown plant';

    // Set up progress simulation up to 90% while calling API
    const progressInterval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 200);

    const formData = new FormData();
    formData.append('image', aiImageFile);
    formData.append('crop_name', suspectedCrop);

    const lang = voiceLanguage.split('-')[0];
    axios.post(`${API_BASE_URL}/gemini/diagnose?lang=${lang}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        clearInterval(progressInterval);
        setAiProgress(100);
        setAiProgressText('Diagnosis report finalized!');
        setAiResult(res.data);
        setAiAnalyzing(false);
        logUserActivity('ai_diagnosis', `Diagnosed ${suspectedCrop} leaf image for potential diseases`, { crop_name: suspectedCrop });
      })
      .catch(err => {
        clearInterval(progressInterval);
        setAiAnalyzing(false);
        setAiProgress(0);

        const errorData = err.response?.data || {};
        if (errorData.code === 'API_KEY_MISSING') {
          setGeminiApiKeyMissing(true);
        } else {
          const errorMsg = errorData.error || err.message;
          if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota')) {
            setAiError('Cerevyn Research Azure AI rate limit or quota exceeded. Please wait a minute and try again.');
          } else {
            setAiError(`Diagnostics error: ${errorMsg}`);
          }
        }
      });
  };

  const detectLanguage = (text) => {
    if (!text) return 'en-IN';
    const teluguRegex = /[\u0c00-\u0c7f]/;
    const hindiRegex = /[\u0900-\u097f]/;

    if (teluguRegex.test(text)) {
      return 'te-IN';
    }
    if (hindiRegex.test(text)) {
      return 'hi-IN';
    }
    return 'en-IN';
  };

  const fallbackSpeakText = (text, lang) => {
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch (e) {
      console.error("Error cancelling/resuming SpeechSynthesis:", e);
    }

    const cleanText = text
      .replace(/[*#`_\-]/g, '')
      .replace(/\n+/g, ' ');

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;

      const voices = window.speechSynthesis.getVoices();

      const langVoices = voices.filter(v =>
        v.lang.toLowerCase() === lang.toLowerCase() ||
        v.lang.toLowerCase().startsWith(lang.toLowerCase().split('-')[0])
      );

      const femaleKeywords = [
        'female', 'lady', 'zira', 'samantha', 'karen', 'veena', 'moira', 'tessa',
        'hazel', 'heera', 'kalpana', 'shruti', 'swara', 'priya', 'neerja', 'lata',
        'victoria', 'susan', 'melody', 'kiana', 'sara', 'nora',
        'google हिन्दी', 'google తెలుగు'
      ];

      let matchedVoice = langVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        return femaleKeywords.some(keyword => nameLower.includes(keyword));
      });

      if (!matchedVoice && langVoices.length > 0) {
        matchedVoice = langVoices[0];
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        console.log(`SpeechSynthesis (Lady Voice Prioritized): Explicitly set voice "${matchedVoice.name}" (${matchedVoice.lang}) for language "${lang}".`);
      } else {
        console.warn(`SpeechSynthesis: No matching voice found for "${lang}". Defaulting to browser choice.`);
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        window.activeUtterance = null;
      };
      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error:", e.error, e);
        setIsSpeaking(false);
        window.activeUtterance = null;
      };

      window.activeUtterance = utterance;

      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Error speaking utterance:", e);
      }
    }, 100);
  };

  const speakText = async (text, lang) => {
    if (!text) return;

    stopSpeaking();
    setIsSpeaking(true);

    try {
      const cleanText = text
        .replace(/[*#`_\-]/g, '')
        .replace(/\n+/g, ' ');

      const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
        text: cleanText,
        speaker: 'ishita', // Sarvam AI female voice
        target_language_code: lang,
        model: 'bulbul:v3',
        pace: 1.0,
        enable_preprocessing: true
      }, {
        headers: {
          'api-subscription-key': 'sk_3mjur4e9_HLfe5OP7WqgZIV0fXi3ZZk36',
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.audios && response.data.audios.length > 0) {
        const audioBase64 = response.data.audios[0];
        const audioUrl = `data:audio/wav;base64,${audioBase64}`;

        const audio = new Audio(audioUrl);
        window.activeAudio = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          window.activeAudio = null;
        };
        audio.onerror = (e) => {
          console.error("Sarvam AI Audio playback error, falling back:", e);
          fallbackSpeakText(text, lang);
        };

        await audio.play();
      } else {
        throw new Error("Invalid audio response structure from Sarvam AI");
      }
    } catch (err) {
      console.error("Sarvam AI TTS call failed, using WebSpeech fallback:", err);
      fallbackSpeakText(text, lang);
    }
  };

  const stopSpeaking = () => {
    if (window.activeAudio) {
      try {
        window.activeAudio.pause();
        window.activeAudio = null;
      } catch (e) {
        console.error("Error pausing active audio:", e);
      }
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const triggerSeedBurst = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const seedColors = ['#b45309', '#ea580c', '#d97706', '#f59e0b', '#78350f'];

    // Create 70 particles
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      particles.push({
        x: clientX,
        y: clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1 + Math.random() * 4), // biased upwards
        radius: 3.5 + Math.random() * 4.5,
        color: seedColors[Math.floor(Math.random() * seedColors.length)],
        alpha: 1,
        life: 0.9 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.18
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyAlive = false;

      particles.forEach(p => {
        if (p.alpha <= 0) return;
        anyAlive = true;

        // Apply physics
        p.vy += 0.22; // gravity
        p.vx *= 0.975; // air friction
        p.vy *= 0.975;

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.016;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);

        // Draw main seed body (oval-like shape)
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius, p.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw small green sprout tail
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(p.radius * 0.75, 0, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      if (anyAlive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleAccessDashboard = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;

    triggerSeedBurst(x, y);
    setWelcomeTransitioning(true);
    setTimeout(() => {
      setHasStarted(true);
    }, 700);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      submitChatWithMessage(speechToText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const submitChatWithMessage = (messageText) => {
    if (!messageText.trim() || chatLoading) return;

    // Direct user interaction: play a silent sound/utterance to unlock SpeechSynthesis context
    if (window.speechSynthesis && autoSpeak) {
      const silentUtterance = new SpeechSynthesisUtterance("");
      silentUtterance.volume = 0;
      window.speechSynthesis.speak(silentUtterance);
    }

    const userMessage = { role: 'user', parts: [messageText] };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatLoading(true);
    setGeminiApiKeyMissing(false);
    setChatError('');

    axios.post(`${API_BASE_URL}/gemini/chat`, {
      message: messageText,
      history: chatMessages,
      language: voiceLanguage
    })
      .then(res => {
        const reply = res.data.reply;
        setChatMessages([...updatedMessages, { role: 'model', parts: [reply] }]);
        setChatLoading(false);

        if (autoSpeak) {
          speakText(reply, detectLanguage(reply));
        }
      })
      .catch(err => {
        setChatLoading(false);
        const errorData = err.response?.data || {};
        if (errorData.code === 'API_KEY_MISSING') {
          setGeminiApiKeyMissing(true);
        } else {
          const errorMsg = errorData.error || err.message;
          if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota')) {
            setChatError('Cerevyn Research Azure AI rate limit or quota exceeded. Please wait a minute and try again.');
          } else {
            setChatError(`Chatbot error: ${errorMsg}`);
          }
        }
      });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      logUserActivity('chat_message', `Asked: "${chatInput.trim().slice(0, 80)}"`, { query: chatInput.trim() });
    }
    submitChatWithMessage(chatInput);
    setChatInput('');
  };

  const handleAdminPasswordSubmit = (e) => {
    e.preventDefault();
    const CORRECT_PASSWORD = 'admin'; // Admin password
    if (adminPasswordInput === CORRECT_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAdminPasswordModalOpen(false);
      setActiveTab('admin-panel');
    } else {
      setAdminPasswordError('Incorrect password. Please try again.');
    }
  };

  // Filter lists based on inputs
  const filteredStates = states.filter(s =>
    s.state_name.toLowerCase().includes(stateSearchText.toLowerCase())
  );

  const filteredCropsList = crops.filter(c => {
    const matchSearch = c.crop_name.toLowerCase().includes(cropSearchText.toLowerCase()) ||
      c.scientific_name.toLowerCase().includes(cropSearchText.toLowerCase());
    const matchSeason = cropFilterSeason === 'All' || c.season.toLowerCase().includes(cropFilterSeason.toLowerCase());
    return matchSearch && matchSeason;
  });

  const filteredSoils = soils.filter(s =>
    s.soil_name.toLowerCase().includes(soilSearchText.toLowerCase()) ||
    s.characteristics.toLowerCase().includes(soilSearchText.toLowerCase())
  );

  const filteredDiseases = diseases.filter(d =>
    d.disease_name.toLowerCase().includes(diseaseSearchText.toLowerCase()) ||
    d.symptoms.toLowerCase().includes(diseaseSearchText.toLowerCase()) ||
    (d.crop_name && d.crop_name.toLowerCase().includes(diseaseSearchText.toLowerCase()))
  );

  const filteredChemicals = chemicals.filter(c => {
    const matchSearch = c.chemical_name.toLowerCase().includes(chemicalSearchText.toLowerCase()) ||
      c.safety_precautions.toLowerCase().includes(chemicalSearchText.toLowerCase()) ||
      (c.disease_name && c.disease_name.toLowerCase().includes(chemicalSearchText.toLowerCase()));
    const matchType = chemicalFilterType === 'All' || c.chemical_type === chemicalFilterType;
    return matchSearch && matchType;
  });

  // Advanced Search Results
  const getAdvSearchResults = () => {
    if (!advSearchQuery) return { states: [], crops: [], soils: [], diseases: [], chemicals: [] };
    const query = advSearchQuery.toLowerCase();

    return {
      states: states.filter(s => s.state_name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)),
      crops: crops.filter(c => c.crop_name.toLowerCase().includes(query) || c.scientific_name.toLowerCase().includes(query) || c.season.toLowerCase().includes(query)),
      soils: soils.filter(s => s.soil_name.toLowerCase().includes(query) || s.characteristics.toLowerCase().includes(query)),
      diseases: diseases.filter(d => d.disease_name.toLowerCase().includes(query) || d.symptoms.toLowerCase().includes(query)),
      chemicals: chemicals.filter(c => c.chemical_name.toLowerCase().includes(query) || c.chemical_type.toLowerCase().includes(query))
    };
  };

  const advResults = getAdvSearchResults();
  const advResultsCount = advResults.states.length + advResults.crops.length + advResults.soils.length + advResults.diseases.length + advResults.chemicals.length;

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (!hasStarted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden antialiased select-none transition-all duration-700 ease-in-out ${welcomeTransitioning ? 'opacity-0 scale-95 translate-y-4 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
        {/* Canvas for seed burst */}
        <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" />
        {/* Glow effect blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Top Header branding */}
        <header className="flex items-center justify-between relative z-10 font-sans w-full">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg border border-emerald-500/30">
              <Sprout className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-black text-xl text-white tracking-wide uppercase brand-typewriter">AgriFuture</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Cerevyn Research AI</p>
            </div>
          </div>
          {/* Top-right Language Selector - fixes i18n language for whole site */}
          <div className="relative">
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-emerald-800/60 backdrop-blur-md border border-emerald-700/50 text-emerald-100 rounded-xl px-4 py-2 text-xs md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-lg hover:bg-emerald-700/80 hover:text-white transition-all"
            >
              <option value="en" className="bg-emerald-950 text-white font-semibold">🇬🇧 English</option>
              <option value="te" className="bg-emerald-950 text-white font-semibold">🇮🇳 తెలుగు</option>
              <option value="hi" className="bg-emerald-950 text-white font-semibold">🇮🇳 हिंदी</option>
              <option value="mr" className="bg-emerald-950 text-white font-semibold">🇮🇳 मराठी</option>
            </select>
          </div>
        </header>

        {/* Main welcome block */}
        <main className="max-w-4xl mx-auto my-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Text details */}
          <div className="space-y-6 text-left">
            <span className="inline-block px-3.5 py-1.5 bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
              {t('smartSupportSystem')}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              {t('welcomeHeader')}
            </h2>
            <p className="text-sm text-emerald-100/70 leading-relaxed">
              {t('welcomeDesc')}
            </p>

            <div className="pt-2">
              <button
                onClick={handleAccessDashboard}
                className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3 text-base select-none border border-emerald-400/20"
              >
                <span>{t('accessAdvisoryDashboard')}</span>
                <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 text-emerald-200" />
              </button>
            </div>
          </div>

          {/* Right Card Grid showing core features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { titleKey: 'aiDiagnosticsTitle', descKey: 'aiDiagnosticsDesc', icon: Bot, color: "text-blue-400 border-blue-500/15" },
              { titleKey: 'stateWiseCropsTitle', descKey: 'stateWiseCropsDesc', icon: MapPin, color: "text-amber-400 border-amber-500/15" },
              { titleKey: 'smartSchedulerTitle', descKey: 'smartSchedulerDesc', icon: FileText, color: "text-emerald-400 border-emerald-500/15" },
              { titleKey: 'voiceAiBotTitle', descKey: 'voiceAiBotDesc', icon: MessageSquare, color: "text-purple-400 border-purple-500/15" }
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  onMouseMove={handleGlowMouseMove}
                  className="p-5 rounded-2xl glow-card space-y-3 transition-all duration-300 hover:scale-[1.03] shadow-md select-none"
                >
                  <div className="p-2.5 w-fit rounded-xl bg-white/5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{t(f.titleKey)}</h4>
                    <p className="text-[11px] text-emerald-100/50 leading-normal mt-1">{t(f.descKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Footer branding */}
        <footer className="text-center md:text-left text-[10px] text-emerald-500/60 font-semibold relative z-10 flex flex-col md:flex-row justify-between gap-2 border-t border-emerald-900/40 pt-6">
          <span>&copy; {new Date().getFullYear()} AgriFuture. All Rights Reserved.</span>
          <span>Powered by Cerevyn Research Azure AI Engine</span>
        </footer>
      </div>
    );
  }

  const filteredSearchCrops = crops.filter(c =>
    c.crop_name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    (c.scientific_name && c.scientific_name.toLowerCase().includes(globalSearchQuery.toLowerCase()))
  );
  const filteredSearchSoils = soils.filter(s =>
    s.soil_name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    (s.characteristics && s.characteristics.toLowerCase().includes(globalSearchQuery.toLowerCase()))
  );
  const filteredSearchDiseases = diseases.filter(d =>
    d.disease_name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    (d.symptoms && d.symptoms.toLowerCase().includes(globalSearchQuery.toLowerCase()))
  );
  const filteredSearchChemicals = chemicals.filter(c =>
    c.chemical_name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    (c.chemical_type && c.chemical_type.toLowerCase().includes(globalSearchQuery.toLowerCase()))
  );
  const totalSearchResults = filteredSearchCrops.length + filteredSearchSoils.length + filteredSearchDiseases.length + filteredSearchChemicals.length;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-emerald-50/25 via-white to-amber-50/15 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 bg-emerald-900 text-white flex flex-col shrink-0 transition-all z-20 md:static ${mobileMenuOpen ? 'fixed inset-0 h-screen' : 'h-auto md:h-screen'}`}>
        {/* Logo Section */}
        <div className="p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight brand-typewriter">AgriFuture</h1>
              <p className="text-xs text-emerald-300 font-medium">{t('advisorySystem')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (!isAdminAuthenticated) {
                  setAdminPasswordInput('');
                  setAdminPasswordError('');
                  setAdminPasswordModalOpen(true);
                } else {
                  setActiveTab('admin-panel');
                }
              }}
              title={t('adminPanel')}
              className="hidden md:flex text-emerald-300 hover:text-white p-1.5 rounded-lg hover:bg-emerald-800 transition-all"
            >
              <UserCheck className="h-5 w-5" />
            </button>
            {/* User Avatar button */}
            <button
              onClick={() => setProfileOpen(true)}
              title="My Profile & History"
              id="user-profile-btn"
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-black text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              {(currentUser?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </button>
            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', labelKey: 'dashboard', icon: Layers },
            { id: 'crop-info', labelKey: 'cropsDirectory', icon: Sprout },
            { id: 'gov-msp', labelKey: 'govtCropsMsp', icon: TrendingUp },
            { id: 'gov-subsidies', labelKey: 'govtSubsidies', icon: CheckCircle2 },
            { id: 'tools', labelKey: 'tools', icon: Sliders },
            { id: 'news-updates', labelKey: 'agriNewsAlerts', icon: Newspaper },
            { id: 'soil-info', labelKey: 'soilDetails', icon: Database },
            { id: 'disease-mgmt', labelKey: 'cropHealthHub', icon: ShieldAlert },
            { id: 'disease-finder', labelKey: 'advisoryDiseaseFinder', icon: HelpCircle },
            { id: 'smart-scheduler', labelKey: 'smartScheduler', icon: FileText },
            { id: 'ai-detection', labelKey: 'aiCropDiagnosis', icon: Bot }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'admin-panel' && !isAdminAuthenticated) {
                    setAdminPasswordInput('');
                    setAdminPasswordError('');
                    setAdminPasswordModalOpen(true);
                  } else {
                    setActiveTab(tab.id);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${activeTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                  }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeTab === tab.id ? 'text-emerald-300' : 'text-emerald-400'}`} />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        {/* Language Selector in Sidebar */}
        <div className="px-4 py-3 border-t border-emerald-800">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">{t('languageSelect')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { code: 'en', label: 'English', flag: '🇬🇧' },
              { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
              { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
              { code: 'mr', label: 'मराठी', flag: '🇮🇳' }
            ].map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${i18n.language === code
                    ? 'bg-emerald-500 text-white shadow-md ring-1 ring-emerald-300'
                    : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700 hover:text-white'
                  }`}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
        {/* Subtle Watermark Designs (Plant & Farmer theme) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          {/* Top-Left: Soft Plant/Sprout Watermark */}
          <div className="absolute top-10 left-10 text-emerald-600/35 transform -rotate-12 animate-pulse" style={{ animationDuration: '8s' }}>
            <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10"></path>
              <path d="M10 20V8a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v12"></path>
              <path d="M12 6a4 4 0 0 1-4-4h0a4 4 0 0 1 4 4Z"></path>
              <path d="M12 10a3 3 0 0 1-3-3h0a3 3 0 0 1 3 3Z"></path>
              <path d="M12 14a3 3 0 0 0 3-3h0a3 3 0 0 0-3 3Z"></path>
            </svg>
          </div>

          {/* Bottom-Right: Soft Farmer/Nature Watermark */}
          <div className="absolute bottom-10 right-10 text-emerald-600/35 transform rotate-6 animate-pulse" style={{ animationDuration: '12s' }}>
            <svg width="260" height="260" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M5 22v-3a7 7 0 0 1 10-6v0"></path>
              <path d="m18 10-2-2 4-4"></path>
              <path d="M16 8a4 4 0 0 1 4-4"></path>
            </svg>
          </div>

          {/* Center-Right: Floating Leaf Watermark */}
          <div className="absolute top-1/3 right-1/4 text-amber-600/30 transform rotate-45">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z"></path>
              <path d="M9 22v-4h4"></path>
            </svg>
          </div>
        </div>
        {/* Mobile Header */}
        <header className="md:hidden bg-emerald-900 text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-2">
            <Sprout className="h-5 w-5 text-emerald-400" />
            <span className="font-bold text-base">AgriFuture Advisory</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (!isAdminAuthenticated) {
                  setAdminPasswordInput('');
                  setAdminPasswordError('');
                  setAdminPasswordModalOpen(true);
                } else {
                  setActiveTab('admin-panel');
                }
              }}
              title={t('adminPanel')}
              className="text-emerald-300 hover:text-white p-1 rounded hover:bg-emerald-800 transition-all animate-fade-in"
            >
              <UserCheck className="h-5 w-5" />
            </button>
            <button onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 m-6 rounded shadow-sm flex items-start space-x-3 animate-fade-in shrink-0">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-800">{t('connectionTrouble')}</h3>
              <p className="text-xs text-rose-700 mt-1">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-rose-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Core Loading Overlay */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center max-w-md mx-auto">
            {/* Thematic Farmer / Crop Growing Animation Container */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Rotating Golden Sun */}
              <div className="absolute top-0 right-1 animate-spin" style={{ animationDuration: '10s' }}>
                <svg className="h-7 w-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" fill="currentColor" className="text-amber-300"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              </div>

              {/* Falling Rain/Water Droplets */}
              <div className="absolute top-4 left-6 flex space-x-1.5">
                <span className="w-1.5 h-3.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '1s' }}></span>
                <span className="w-1.5 h-4 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.35s', animationDuration: '1s' }}></span>
                <span className="w-1.5 h-3.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1s' }}></span>
              </div>

              {/* Growing Sprout from Soil */}
              <div className="absolute bottom-2.5 flex flex-col items-center">
                <div className="animate-bounce" style={{ animationDuration: '2s' }}>
                  <Sprout className="h-14 w-14 text-emerald-600 animate-pulse" />
                </div>
                {/* Soil Ground */}
                <div className="w-20 h-3 bg-amber-900 rounded-full shadow-inner mt-0.5 border border-amber-950"></div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Dynamic agricultural phrase */}
              <p className="text-emerald-800 font-extrabold text-base transition-all duration-500 animate-pulse">
                {loadingPhrases[loadingPhraseIndex]}
              </p>
            </div>
          </div>
        ) : (
          <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-fade-in">
            {/* 1. DASHBOARD MODULE */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('agricultureDashboard')}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {globalSearchQuery ? `${t('searchResultsFor')} "${globalSearchQuery}"` : t('realtimeStats')}
                    </p>
                  </div>
                  {/* Dashboard Quick Search */}
                  <div className="relative max-w-md w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Quick query..."
                      value={globalSearchQuery}
                      onChange={(e) => setGlobalSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    {globalSearchQuery && (
                      <button
                        onClick={() => setGlobalSearchQuery('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-650"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {globalSearchQuery ? (
                  <div className="space-y-6 animate-fade-in text-left">
                    <div className="flex justify-between items-center bg-emerald-50 border border-emerald-150 p-4 rounded-xl">
                      <span className="text-xs font-bold text-emerald-800">
                        🔍 Found {totalSearchResults} matching resources across categories.
                      </span>
                      <button
                        onClick={() => setGlobalSearchQuery('')}
                        className="text-xs text-emerald-700 hover:text-emerald-950 font-black flex items-center"
                      >
                        Clear Results
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Crops Results */}
                      {filteredSearchCrops.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <Sprout className="h-4 w-4 mr-1.5 text-emerald-600" /> Crops ({filteredSearchCrops.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSearchCrops.map(c => (
                              <div key={c.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center">
                                <div>
                                  <h4 className="font-extrabold text-base text-gray-900">{c.crop_name}</h4>
                                  <p className="text-xs text-gray-400 italic mt-0.5">{c.scientific_name}</p>
                                </div>
                                <button
                                  onClick={() => { handleCropClick(c.id); setCropSubTab('catalog'); setActiveTab('crop-info'); }}
                                  className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center shrink-0 ml-4"
                                >
                                  <span>View Crop Profile</span>
                                  <ChevronRight className="h-3 w-3 ml-0.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Soils Results */}
                      {filteredSearchSoils.length > 0 && (
                        <div className="space-y-2.5 border-t border-gray-100 pt-5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <Database className="h-4 w-4 mr-1.5 text-amber-600" /> Soils ({filteredSearchSoils.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSearchSoils.map(s => (
                              <div key={s.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <h4 className="font-extrabold text-base text-gray-900">{s.soil_name}</h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.characteristics}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                                    pH: {s.ph_range}
                                  </span>
                                  <button
                                    onClick={() => { setActiveTab('soil-info'); }}
                                    className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center shrink-0"
                                  >
                                    <span>View Soil Details</span>
                                    <ChevronRight className="h-3 w-3 ml-0.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diseases Results */}
                      {filteredSearchDiseases.length > 0 && (
                        <div className="space-y-2.5 border-t border-gray-100 pt-5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <ShieldAlert className="h-4 w-4 mr-1.5 text-red-655" /> Diseases ({filteredSearchDiseases.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSearchDiseases.map(d => (
                              <div key={d.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center">
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-base text-gray-900 truncate">{d.disease_name}</h4>
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">{d.symptoms}</p>
                                </div>
                                <button
                                  onClick={() => { handleDiseaseClick(d.id); setHealthSubTab('diseases'); setActiveTab('disease-mgmt'); }}
                                  className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center shrink-0 ml-4"
                                >
                                  <span>Advisory Details</span>
                                  <ChevronRight className="h-3 w-3 ml-0.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chemicals Results */}
                      {filteredSearchChemicals.length > 0 && (
                        <div className="space-y-2.5 border-t border-gray-100 pt-5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <Sliders className="h-4 w-4 mr-1.5 text-purple-600" /> Chemicals ({filteredSearchChemicals.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSearchChemicals.map(c => (
                              <div key={c.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-extrabold text-base text-gray-900">{c.chemical_name}</h4>
                                  <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded">
                                    {c.chemical_type}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mt-3 text-xs">
                                  <span className="text-gray-500">Dosage: <strong className="text-emerald-700 font-bold">{c.dosage}</strong></span>
                                  <button
                                    onClick={() => { handleDiseaseClick(c.disease_id); setHealthSubTab('diseases'); setActiveTab('disease-mgmt'); }}
                                    className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center"
                                  >
                                    <span>Target Disease</span>
                                    <ChevronRight className="h-3 w-3 ml-0.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {totalSearchResults === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-450 italic">
                          <Search className="h-10 w-10 mx-auto opacity-30 mb-3" />
                          No crops, soils, diseases, or chemical treatments matched "{globalSearchQuery}".
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Waving Farmer Mascot Card (Span 2) */}
                      <div className="lg:col-span-2 bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 rounded-2xl text-white shadow-md border border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group transition-all duration-300 hover:shadow-lg">
                        {/* Background decorative sprout detail */}
                        <div className="absolute -right-6 -bottom-6 text-emerald-700/10 transform rotate-12 pointer-events-none">
                          <Sprout className="h-44 w-44" />
                        </div>

                        <div className="space-y-4 max-w-md relative z-10 text-left">
                          <span className="inline-block px-3 py-1 bg-emerald-600/50 border border-emerald-500/30 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Advisory Companion AI
                          </span>
                          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            {t('namasteWelcome')}
                          </h3>
                          <p className="text-xs text-emerald-100/80 leading-relaxed">
                            {t('welcomeDashboardMsg')}
                          </p>
                          <div className="flex flex-wrap gap-2.5 pt-1">
                            <button
                              onClick={() => setActiveTab('smart-scheduler')}
                              className="text-[11px] font-extrabold bg-white text-emerald-950 px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-sm border border-white/20 active:scale-[0.98]"
                            >
                              <FileText className="h-3.5 w-3.5 text-emerald-700" />
                              <span>{t('cultivationSchedule')}</span>
                            </button>
                            <button
                              onClick={() => setChatbotOpen(true)}
                              className="text-[11px] font-extrabold bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-all border border-emerald-600/50 flex items-center gap-1.5 active:scale-[0.98]"
                            >
                              <Bot className="h-3.5 w-3.5 text-emerald-350" />
                              <span>{t('askCropCareAi')}</span>
                            </button>
                          </div>
                        </div>

                        {/* SVG Animated Waving Farmer */}
                        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center bg-emerald-900/40 rounded-2xl border border-emerald-700/30 p-2 overflow-hidden shadow-inner">
                          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Glow behind */}
                            <circle cx="100" cy="100" r="75" fill="url(#farmerGlow)" />
                            
                            {/* Farmer Body (Kurta) */}
                            <path d="M55 180 C 55 145, 145 145, 145 180 Z" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                            <path d="M75 145 L 100 165 L 125 145" stroke="#10b981" strokeWidth="2" fill="none" />
                            
                            {/* Green/Saffron Scarf (Neckerchief / Gamcha) */}
                            <path d="M70 142 C 85 148, 115 148, 130 142 C 135 155, 130 175, 120 180 C 100 170, 80 180, 70 142" fill="#f97316" opacity="0.9" />
                            <path d="M70 142 C 78 155, 75 175, 80 180" stroke="#ea580c" strokeWidth="2" />
                            
                            {/* Face */}
                            <circle cx="100" cy="105" r="32" fill="#fed7aa" stroke="#d97706" strokeWidth="2" />
                            
                            {/* Traditional Hat (Pagri/Turban) */}
                            <path d="M68 95 C 65 80, 80 72, 100 75 C 120 72, 135 80, 132 95 C 135 70, 65 70, 68 95" fill="#f59e0b" />
                            <path d="M64 88 C 80 65, 120 65, 136 88 C 145 92, 120 72, 100 80 C 80 72, 55 92, 64 88" fill="#ea580c" />
                            
                            {/* Eyes */}
                            <circle cx="90" cy="105" r="3" fill="#1e293b" />
                            <circle cx="110" cy="105" r="3" fill="#1e293b" />
                            
                            {/* Eyebrows */}
                            <path d="M84 98 C 88 95, 96 97, 96 97" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M116 98 C 112 95, 104 97, 104 97" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                            
                            {/* Mustache */}
                            <path d="M85 118 C 92 114, 100 118, 100 118 C 100 118, 108 114, 115 118 C 120 122, 112 122, 100 120 C 88 122, 80 122, 85 118 Z" fill="#1e293b" />
                            
                            {/* Smiling Mouth */}
                            <path d="M93 124 C 95 128, 105 128, 107 124" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Waving Hand & Arm */}
                            <g className="farmer-hand-wave" style={{ transformOrigin: '135px 145px' }}>
                              {/* Arm sleeve */}
                              <path d="M135 145 C 150 135, 160 120, 165 105" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
                              <path d="M135 145 C 150 135, 160 120, 165 105" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
                              {/* Hand/wrist */}
                              <path d="M165 105 L 170 95" stroke="#fed7aa" strokeWidth="10" strokeLinecap="round" />
                              {/* Palm/Fingers */}
                              <circle cx="170" cy="92" r="7" fill="#fed7aa" />
                              <path d="M166 90 L 164 80" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
                              <path d="M170 88 L 170 77" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
                              <path d="M174 89 L 176 78" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
                              <path d="M178 92 L 182 82" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
                              <path d="M164 94 L 156 90" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
                            </g>

                            <defs>
                              <radialGradient id="farmerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                              </radialGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>

                      {/* live Weather Card */}
                      {dashboardWeather && (
                        <div className={`p-6 rounded-2xl bg-gradient-to-br ${getWeatherGradient(dashboardWeather.weathercode, dashboardWeather.is_day)} text-white shadow-md border border-white/10 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-lg animate-fade-in relative overflow-hidden`}>
                          {/* Dynamic Weather Overlay */}
                          {(() => {
                            const code = dashboardWeather.weathercode;
                            const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
                            const isSun = [0, 1, 2].includes(code);
                            const isCloud = [3, 45, 48].includes(code);
                            return (
                              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                                {isRain && <div className="absolute inset-0 animate-rain-effect opacity-20"></div>}
                                {isSun && <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-400/5 to-yellow-300/10 mix-blend-screen animate-sun-beams opacity-35"></div>}
                                {isCloud && <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px] animate-clouds-drift opacity-25"></div>}
                              </div>
                            );
                          })()}
                          <div className="flex items-center gap-5 relative z-10 text-left">
                            <span className="text-4xl md:text-5xl">{getWeatherDescription(dashboardWeather.weathercode, dashboardWeather.is_day).icon}</span>
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-white/70 bg-white/15 px-2 py-0.5 rounded inline-block">NCR Weather</span>
                              <h3 className="text-2xl font-black">{dashboardWeather.temperature}°C</h3>
                              <p className="text-xs font-bold leading-none">{getWeatherDescription(dashboardWeather.weathercode, dashboardWeather.is_day).desc}</p>
                              <p className="text-[10px] text-white/80">Wind: {dashboardWeather.windspeed} km/h</p>
                            </div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-xl text-left relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Agricultural Advisory</h4>
                            <p className="text-[11px] text-white/90 leading-relaxed mt-1">
                              {[0, 1, 2].includes(dashboardWeather.weathercode) ? "Ideal conditions for pesticide application and sowing." :
                                [3, 45, 48].includes(dashboardWeather.weathercode) ? "Cool weather. Monitor crops for fungal pathogens." :
                                  "Rain expected. Delay irrigation & spraying. Ensure soil drainage."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      {[
                        { title: 'Total States', count: apiStats.total_states, icon: MapPin, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                        { title: 'Crops Cataloged', count: apiStats.total_crops, icon: Sprout, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                        { title: 'Soil Types', count: apiStats.total_soils, icon: Database, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                        { title: 'Crop Diseases', count: apiStats.total_diseases, icon: ShieldAlert, color: 'text-red-600 bg-red-50 border-red-100' },
                        { title: 'Chemical Recs', count: apiStats.total_chemicals, icon: Sliders, color: 'text-purple-600 bg-purple-50 border-purple-100' }
                      ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={idx}
                            className="p-5 rounded-xl bg-white border shadow-sm flex items-center space-x-4 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'forwards' }}
                          >
                            <div className={`p-3 rounded-lg ${stat.color} border shrink-0`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                              <p className="text-2xl font-black text-gray-900 mt-1">{stat.count}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Info Charts & Updates Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Statistics overview */}
                      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900">Database Breakdown</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Proportional weight of stored agricultural entities.</p>

                          <div className="space-y-4 mt-6">
                            {[
                              { name: 'Crops (Advisory mapping coverage)', current: apiStats.total_crops, max: 100, color: 'bg-emerald-600' },
                              { name: 'Diseases (Known pathogens registered)', current: apiStats.total_diseases, max: 150, color: 'bg-red-500' },
                              { name: 'Chemical Recommendations (Pesticides/Fungicides)', current: apiStats.total_chemicals, max: 150, color: 'bg-purple-600' },
                              { name: 'Soil Suitability Mappings', current: apiStats.total_soils, max: 30, color: 'bg-amber-500' }
                            ].map((bar, index) => {
                              const pct = Math.min((bar.current / bar.max) * 100, 100).toFixed(0);
                              return (
                                <div key={index} className="space-y-1.5">
                                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                                    <span>{bar.name}</span>
                                    <span className="text-gray-500">{bar.current} / {bar.max} ({pct}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${bar.color}`} style={{ width: `${pct}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-emerald-50 rounded-xl p-4 mt-6 flex items-start space-x-3.5 border border-emerald-100">
                          <Sparkles className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">AI Recommendation Assistant</h4>
                            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                              Farmers can diagnostic plant leaves for diseases using our <strong>AI Crop Diagnosis</strong> model. Upload a picture to verify disease name, confidence index, and dosage instructions immediately.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Audit Logs Log */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col h-[380px]">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                          <div>
                            <h3 className="font-extrabold text-base text-gray-900">Recent Admin Activities</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Audit log of system CRUD modifications.</p>
                          </div>
                          <Activity className="h-5 w-5 text-emerald-600 animate-pulse" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                          {apiStats.activity_logs && apiStats.activity_logs.length > 0 ? (
                            apiStats.activity_logs.map((log, index) => (
                              <div key={index} className="flex items-start space-x-3 text-xs">
                                <div className="p-1 rounded bg-gray-100 shrink-0 mt-0.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 truncate">{log.action}</p>
                                  <div className="flex items-center space-x-2 mt-0.5 text-gray-400 font-medium">
                                    <span>{log.timestamp}</span>
                                    <span>•</span>
                                    <span className="text-emerald-600">{log.status}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-400 text-xs py-8 font-medium">No activity logs recorded yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Live Government News & Alerts Widget */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-emerald-600" />
                            <span>Live Government News & Alerts</span>
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5 text-left">Real-time agricultural news and advisories synced from government portals.</p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={handleSyncNews}
                            disabled={newsSyncing}
                            className={`text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-1.5 transition-all ${newsSyncing ? 'opacity-50' : ''}`}
                          >
                            <RefreshCw className={`h-3 w-3 ${newsSyncing ? 'animate-spin' : ''}`} />
                            <span>{newsSyncing ? 'Syncing...' : 'Sync Latest'}</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('news-updates')}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5"
                          >
                            <span>View All</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {news.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-400 italic">
                          No news updates loaded. Click "Sync Latest" to fetch from PIB.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {news.slice(0, 3).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => setSelectedNewsDetail(n)}
                              className="p-4 rounded-xl border border-gray-150 bg-gray-50/50 hover:bg-emerald-50/20 hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between text-left group animate-fade-in"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${n.category === 'Weather' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                                      n.category === 'Scheme' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                        n.category === 'Market Trend' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                                          n.category === 'Technology' ? 'bg-purple-50 text-purple-800 border border-purple-100' :
                                            'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}>
                                    {n.category}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-semibold">{n.published_date}</span>
                                </div>
                                <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                  {n.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                  {n.content}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600 group-hover:text-emerald-800 flex items-center gap-0.5 mt-3">
                                <span>Read Alert</span>
                                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* AGRI NEWS & ALERTS MODULE */}
            {activeTab === 'news-updates' && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('agriNewsBulletins')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('agriNewsDesc')}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={handleSyncNews}
                      disabled={newsSyncing}
                      className={`text-xs px-4 py-2 rounded-xl border border-gray-200 font-extrabold bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 shadow-sm transition-all ${newsSyncing ? 'opacity-50' : ''
                        }`}
                    >
                      <RefreshCw className={`h-4 w-4 text-emerald-600 ${newsSyncing ? 'animate-spin' : ''}`} />
                      <span>{newsSyncing ? t('checkingFeeds') : t('syncLiveNews')}</span>
                    </button>
                  </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/30">
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Weather', 'Scheme', 'Market Trend', 'Technology', 'General'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewsFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${newsFilterCategory === cat
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {cat === 'All' ? t('allUpdates') : cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('searchNewsPlaceholder')}
                      value={newsSearchText}
                      onChange={(e) => setNewsSearchText(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* News Grid */}
                {(() => {
                  const filteredNews = news.filter((n) => {
                    const matchesCategory = newsFilterCategory === 'All' || n.category === newsFilterCategory;
                    const matchesSearch = n.title.toLowerCase().includes(newsSearchText.toLowerCase()) ||
                      n.content.toLowerCase().includes(newsSearchText.toLowerCase()) ||
                      (n.source && n.source.toLowerCase().includes(newsSearchText.toLowerCase()));
                    return matchesCategory && matchesSearch;
                  });

                  if (filteredNews.length === 0) {
                    return (
                      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 italic shadow-sm">
                        <Newspaper className="h-12 w-12 mx-auto opacity-35 mb-3" />
                        <span>{t('noNewsFound')}</span>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredNews.map((n) => (
                        <div
                          key={n.id}
                          className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
                        >
                          <div>
                            {/* Image Header */}
                            <div className="h-44 overflow-hidden relative bg-emerald-950">
                              <img
                                src={n.image_url || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800"}
                                alt={n.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                              />
                              <span className={`absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border ${n.category === 'Weather' ? 'bg-rose-50 text-rose-800 border-rose-100' :
                                  n.category === 'Scheme' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                                    n.category === 'Market Trend' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                                      n.category === 'Technology' ? 'bg-purple-50 text-purple-800 border-purple-100' :
                                        'bg-gray-50 text-gray-800 border-gray-200'
                                }`}>
                                {n.category}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                                <span>{n.source || t('officialSource')}</span>
                                <span>{n.published_date}</span>
                              </div>
                              <h4 className="font-extrabold text-base text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                                {n.title}
                              </h4>
                              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                                {n.content}
                              </p>
                            </div>
                          </div>

                          <div className="p-5 pt-0">
                            <button
                              onClick={() => setSelectedNewsDetail(n)}
                              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:border-emerald-250 hover:bg-emerald-50/20 text-xs font-extrabold text-emerald-700 transition-all flex items-center justify-center gap-1 group/btn"
                            >
                              <span>{t('readFullArticle')}</span>
                              <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. CROP INFORMATION & STATE SUITABILITY MODULE */}
            {activeTab === 'crop-info' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('cropsDirectoryTitle')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t('cropsDirectoryDesc')}</p>
                </div>

                {/* Sub-tab selection */}
                <div className="flex space-x-2 bg-emerald-50/50 p-1.5 rounded-xl w-fit border border-emerald-100/40">
                  <button
                    onClick={() => setCropSubTab('catalog')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${cropSubTab === 'catalog'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-800 hover:bg-emerald-100/40'
                      }`}
                  >
                    {t('browseCropCatalog')}
                  </button>
                  <button
                    onClick={() => setCropSubTab('states')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${cropSubTab === 'states'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-800 hover:bg-emerald-100/40'
                      }`}
                  >
                    {t('exploreStateSuitability')}
                  </button>
                </div>

                {cropSubTab === 'catalog' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900">{t('cropCatalog')}</h3>
                        <p className="text-xs text-gray-500">{t('cropCatalogDesc')}</p>
                      </div>
                      {/* Filters */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs font-bold text-gray-500 uppercase">{t('seasonLabel')}:</span>
                        <select
                          value={cropFilterSeason}
                          onChange={(e) => setCropFilterSeason(e.target.value)}
                          className="border border-gray-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="All">{t('allSeasons')}</option>
                          <option value="Kharif">Kharif</option>
                          <option value="Rabi">Rabi</option>
                          <option value="Annual">Annual</option>
                          <option value="Perennial">Perennial</option>
                        </select>
                      </div>
                    </div>

                    {/* Search box */}
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('searchCropPlaceholder')}
                        value={cropSearchText}
                        onChange={(e) => setCropSearchText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Crops Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCropsList.map((crop) => (
                        <div
                          key={crop.id}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
                        >
                          <div>
                            {/* Placeholder or image */}
                            <div className="h-44 bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center p-6 text-emerald-200 relative">
                              <Sprout className="h-14 w-14 opacity-25 absolute" />
                              <div className="text-center relative z-10 space-y-1">
                                <span className="text-3xl">🌾</span>
                                <h4 className="font-extrabold text-lg text-white leading-tight mt-2">{crop.crop_name}</h4>
                                <p className="text-xs text-emerald-300 italic">{crop.scientific_name}</p>
                              </div>
                              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-700/60 text-white border border-emerald-600/30">
                                {crop.season}
                              </span>
                            </div>

                            <div className="p-5 space-y-3.5">
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                  <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider">{t('waterNeed')}</span>
                                  <span className="font-semibold text-gray-700 mt-0.5 block">{crop.water_requirement}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                  <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider">{t('expectedYield')}</span>
                                  <span className="font-semibold text-gray-700 mt-0.5 block truncate" title={crop.yield}>{crop.yield}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                  <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider">{t('govtMsp')}</span>
                                  <span className="font-bold text-emerald-700 mt-0.5 block truncate" title={crop.msp || 'N/A'}>{crop.msp || 'N/A'}</span>
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">{t('suitableSoils')}</span>
                                <div className="flex flex-wrap gap-1">
                                  {crop.soils && crop.soils.length > 0 ? (
                                    crop.soils.map((s, idx) => (
                                      <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-bold">
                                        {s}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-xs italic">{t('noSoilsMapped')}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">
                              {t('stateLabel')}: <strong className="text-gray-700 font-bold">{crop.state_name}</strong>
                            </span>
                            <button
                              onClick={() => handleCropClick(crop.id)}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1"
                            >
                              <span>{t('diseasesDetails')}</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredCropsList.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                          {t('noCropsFound')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {cropSubTab === 'states' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">{t('stateSuitabilityMap')}</h3>
                      <p className="text-xs text-gray-500">{t('stateSuitabilityMapDesc')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* Selection List */}
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder={t('searchStatePlaceholder')}
                            value={stateSearchText}
                            onChange={(e) => setStateSearchText(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="max-h-[350px] overflow-y-auto space-y-1">
                          {filteredStates.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => {
                                setSelectedStateId(st.id.toString());
                                logUserActivity('state_selected', `Explored state: ${st.state_name}`, { state_id: st.id });
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${selectedStateId === st.id.toString()
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              <span>{st.state_name}</span>
                              <ChevronRight className={`h-4 w-4 text-emerald-600 transition-transform ${selectedStateId === st.id.toString() ? 'translate-x-0.5' : 'opacity-40'}`} />
                            </button>
                          ))}
                          {filteredStates.length === 0 && (
                            <p className="text-center text-gray-400 text-xs py-4">{t('noStatesMatching')}</p>
                          )}
                        </div>
                      </div>

                      {/* Detail Panel */}
                      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
                        {stateDetail ? (
                          <div className="space-y-6">
                            <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div>
                                <h3 className="text-2xl font-black text-emerald-900">{stateDetail.state_name}</h3>
                                <div className="flex items-center space-x-2 mt-2 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 w-fit">
                                  <Thermometer className="h-3.5 w-3.5" />
                                  <span>{t('climateZone')}: {stateDetail.climate}</span>
                                </div>
                              </div>
                              {weatherLoading ? (
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-400 flex items-center gap-3 w-fit">
                                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                                  <span className="text-xs font-semibold">Loading Weather...</span>
                                </div>
                              ) : weatherData && (
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${getWeatherGradient(weatherData.weathercode, weatherData.is_day)} text-white flex items-center gap-4 shadow-sm border border-white/10 max-w-xs shrink-0`}>
                                  <span className="text-4xl">{getWeatherDescription(weatherData.weathercode, weatherData.is_day).icon}</span>
                                  <div className="text-left">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-white/70 block">{t('liveWeather')}</span>
                                    <span className="text-xl font-black">{weatherData.temperature}°C</span>
                                    <span className="text-xs font-bold block">{getWeatherDescription(weatherData.weathercode, weatherData.is_day).desc}</span>
                                    <span className="text-[10px] text-white/80 block mt-0.5">💨 {weatherData.windspeed} km/h {t('wind')}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('agriculturalOverview')}</h4>
                              <p className="text-gray-700 text-sm leading-relaxed mt-1.5">{stateDetail.description}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('majorCropsCultivated')}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {stateDetail.crops && stateDetail.crops.length > 0 ? (
                                  stateDetail.crops.map((c) => (
                                    <div
                                      key={c.id}
                                      onClick={() => {
                                        handleCropClick(c.id);
                                        setCropSubTab('catalog');
                                      }}
                                      className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50/45 hover:border-emerald-200 transition-all cursor-pointer flex items-center space-x-3.5 group"
                                    >
                                      <div className="bg-emerald-600/10 text-emerald-800 p-2.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Sprout className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-900 text-sm leading-tight group-hover:text-emerald-900">{c.crop_name}</p>
                                        <p className="text-xs text-gray-400 italic mt-0.5">{c.scientific_name}</p>
                                        <div className="flex items-center space-x-3 mt-1.5 text-[10px] font-bold text-gray-500">
                                          <span className="bg-gray-200/60 px-1.5 py-0.5 rounded uppercase">{c.season}</span>
                                          <span className="flex items-center text-blue-600">
                                            <Droplet className="h-2.5 w-2.5 mr-0.5" /> {c.water_requirement} {t('waterSuffix')}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-gray-400 text-xs py-2">{t('noCropsMapped')}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-center text-gray-400 py-8">{t('selectStateLeft')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Crop Detail Modal */}
                {selectedCropDetail && (
                  <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
                        <div>
                          <h3 className="text-xl font-black">{selectedCropDetail.crop_name} {t('details')}</h3>
                          <p className="text-xs text-emerald-300 italic">{selectedCropDetail.scientific_name}</p>
                        </div>
                        <button
                          onClick={() => handleCloseDetail('crop')}
                          className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">{t('seasonality')}</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{selectedCropDetail.season}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">{t('originState')}</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{selectedCropDetail.state_name}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">{t('waterRequirement')}</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{selectedCropDetail.water_requirement}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">{t('expectedYield')}</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{selectedCropDetail.yield}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">{t('govtSupportPriceMsp')}</span>
                            <span className="font-bold text-emerald-700 mt-1 block">{selectedCropDetail.msp || 'N/A'}</span>
                          </div>
                        </div>

                        <div>
                          <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block mb-2">{t('suitableSoils')}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCropDetail.soils && selectedCropDetail.soils.map((s, idx) => (
                              <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-5">
                          <h4 className="font-bold text-sm text-gray-800 mb-3">{t('knownDiseases')}</h4>
                          <div className="space-y-3">
                            {selectedCropDetail.diseases && selectedCropDetail.diseases.length > 0 ? (
                              selectedCropDetail.diseases.map((d) => (
                                <div key={d.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{d.disease_name}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1"><strong className="font-bold text-gray-700">{t('symptomsLabel')}:</strong> {d.symptoms}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      handleDiseaseClick(d.id);
                                      setSelectedCropDetail(null);
                                      setActiveTab('disease-mgmt');
                                    }}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline shrink-0"
                                  >
                                    {t('viewTreatment')}
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-xs italic">{t('noDiseasesMapped')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Government Supported Crops & MSP Module */}
            {activeTab === 'gov-msp' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-emerald-600" />
                    Government Supported Crops & MSP Scheme
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Check which crops are backed by the Government of India's {t('minimumSupportPrice')} (MSP) scheme and see recommended prices.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Left & Middle: Crops Grid */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Filter and Search Bar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('searchSupportedCrops')}
                          value={mspSearchText}
                          onChange={(e) => setMspSearchText(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                        <span className="text-xs font-bold text-gray-400 uppercase">Season:</span>
                        <select
                          value={mspFilterSeason}
                          onChange={(e) => setMspFilterSeason(e.target.value)}
                          className="border border-gray-200 rounded-lg text-xs font-semibold px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="All">{t('allSeasons')}</option>
                          <option value="Kharif">Kharif</option>
                          <option value="Rabi">Rabi</option>
                          <option value="Annual">Annual</option>
                        </select>
                      </div>
                    </div>

                    {/* Crops Grid */}
                    {(() => {
                      const supportedCrops = crops.filter(c => {
                        const hasMsp = c.msp && c.msp !== 'N/A' && c.msp.trim() !== '';
                        const matchSearch = c.crop_name.toLowerCase().includes(mspSearchText.toLowerCase()) ||
                          c.scientific_name.toLowerCase().includes(mspSearchText.toLowerCase());
                        const matchSeason = mspFilterSeason === 'All' || c.season.toLowerCase().includes(mspFilterSeason.toLowerCase());
                        return hasMsp && matchSearch && matchSeason;
                      });

                      if (supportedCrops.length === 0) {
                        return (
                          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 shadow-sm">
                            <Sprout className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                            <h4 className="font-bold text-gray-700 text-base">{t('noSupportedCropsFound')}</h4>
                            <p className="text-xs text-gray-400 mt-1">{t('tryAdjustingSearch')}</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {supportedCrops.map(c => (
                            <div
                              key={c.id}
                              onClick={() => setSelectedMspChartCropId(c.id)}
                              className={`bg-white rounded-xl border cursor-pointer shadow-sm transition-all p-5 flex flex-col justify-between space-y-4 ${selectedMspChartCropId === c.id ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-emerald-100 hover:border-emerald-300'
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-bold text-gray-900 text-base">{c.crop_name}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/50 uppercase tracking-wider">
                                      {c.season}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 italic font-medium">{c.scientific_name}</p>
                                </div>
                                <div className="p-2 bg-emerald-55 text-emerald-600 rounded-lg">
                                  <Sprout className="h-5 w-5" />
                                </div>
                              </div>

                              <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-wide block">{t('minimumSupportPrice')}</span>
                                  <span className="text-lg font-black text-emerald-700">{c.msp}</span>
                                </div>
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-sm">
                                  {t('govtBacked')}
                                </span>
                              </div>

                              <div className="text-xs border-t border-gray-50 pt-3 space-y-1.5 text-gray-600 font-medium">
                                <div className="flex justify-between">
                                  <span>{t('waterRequirementLabel')}:</span>
                                  <span className="text-gray-900 font-semibold">{c.water_requirement}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{t('averageYield')}:</span>
                                  <span className="text-gray-900 font-semibold">{c.yield}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{t('suitableSoils')}:</span>
                                  <span className="text-gray-900 font-semibold max-w-[150px] truncate" title={c.soils?.join(', ')}>
                                    {c.soils?.join(', ') || 'N/A'}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCropDetail(c);
                                  setActiveTab('crop-info');
                                }}
                                className="w-full py-2 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-bold rounded-lg text-xs transition-all border border-gray-100 hover:border-emerald-200"
                              >
                                {t('viewDetailedGuide')}
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right Side: Mandi Selling Guidelines (Sider Suggestions Card) */}
                  <div className="space-y-6">
                    {/* AI MSP Predictor Sider Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h4 className="font-extrabold text-sm text-gray-900 flex items-center">
                          <TrendingUp className="h-4.5 w-4.5 text-emerald-600 mr-2" />
                          AI MSP Predictor (2026–2036)
                        </h4>
                        {/* Year selector */}
                        <select
                          value={selectedMspYear}
                          onChange={(e) => setSelectedMspYear(parseInt(e.target.value))}
                          className="border border-gray-200 rounded-lg text-xs font-semibold px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {Array.from({ length: 11 }, (_, i) => 2026 + i).map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                          ))}
                        </select>
                      </div>

                      {mspPredictionsLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                          <span className="text-xs text-gray-400 font-semibold">{t('runningMlModel')}</span>
                        </div>
                      ) : mspPredictionsData ? (
                        <div className="space-y-4">
                          {/* Best Crop of the Year Callout */}
                          {mspPredictionsData.best_crop && (
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                              <div className="space-y-1 text-left">
                                <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100 px-1.5 py-0.5 rounded">
                                  {t('bestCropOf')} {selectedMspYear}
                                </span>
                                <h5 className="font-bold text-gray-950 text-sm mt-1">{mspPredictionsData.best_crop.crop_name}</h5>
                                <span className="text-[10px] text-gray-400 font-medium block">{t('seasonPrefix')}: {mspPredictionsData.best_crop.season}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-emerald-700 font-black text-base block">+{mspPredictionsData.best_crop.growth_rate_pct}%</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{t('predictedGrowth')}</span>
                              </div>
                            </div>
                          )}

                          {/* SVG Line Chart */}
                          {(() => {
                            const selectedCropData = mspPredictionsData.predictions.find(p => p.crop_id === selectedMspChartCropId);
                            if (!selectedCropData) return null;

                            const allPoints = [
                              ...selectedCropData.historical.map(p => ({ year: p.year, value: p.value, isFuture: false })),
                              ...selectedCropData.future.map(p => ({ year: p.year, value: p.value, isFuture: true }))
                            ];

                            const values = allPoints.map(p => p.value);
                            const minVal = Math.min(...values) * 0.9;
                            const maxVal = Math.max(...values) * 1.1;
                            const valRange = maxVal - minVal;

                            const width = 300;
                            const height = 130;
                            const paddingLeft = 35;
                            const paddingRight = 10;
                            const paddingTop = 15;
                            const paddingBottom = 20;

                            const getX = (year) => {
                              const minYear = 2013;
                              const maxYear = 2036;
                              return paddingLeft + ((year - minYear) / (maxYear - minYear)) * (width - paddingLeft - paddingRight);
                            };

                            const getY = (val) => {
                              return height - paddingBottom - ((val - minVal) / valRange) * (height - paddingTop - paddingBottom);
                            };

                            let histPath = "";
                            let futurePath = "";

                            const histPoints = allPoints.filter(p => !p.isFuture || p.year === 2025);
                            const futurePoints = allPoints.filter(p => p.isFuture || p.year === 2025);

                            histPoints.forEach((p, idx) => {
                              const x = getX(p.year);
                              const y = getY(p.value);
                              if (idx === 0) histPath += `M ${x} ${y}`;
                              else histPath += ` L ${x} ${y}`;
                            });

                            futurePoints.forEach((p, idx) => {
                              const x = getX(p.year);
                              const y = getY(p.value);
                              if (idx === 0) futurePath += `M ${x} ${y}`;
                              else futurePath += ` L ${x} ${y}`;
                            });

                            let areaPath = `${histPath}`;
                            futurePoints.slice(1).forEach(p => {
                              areaPath += ` L ${getX(p.year)} ${getY(p.value)}`;
                            });
                            areaPath += ` L ${getX(2036)} ${height - paddingBottom} L ${getX(2013)} ${height - paddingBottom} Z`;

                            return (
                              <div className="space-y-2 mt-4 bg-gray-50/70 border border-gray-150 p-2.5 rounded-xl text-left">
                                <div className="flex items-center justify-between">
                                  <label className="text-[9px] font-extrabold text-gray-500 uppercase">{t('cropTrendLine')}:</label>
                                  <select
                                    value={selectedMspChartCropId || ""}
                                    onChange={(e) => setSelectedMspChartCropId(parseInt(e.target.value))}
                                    className="border border-gray-200 rounded px-1.5 py-0.5 text-[9px] font-bold bg-white focus:outline-none"
                                  >
                                    {mspPredictionsData.predictions.map(p => (
                                      <option key={p.crop_id} value={p.crop_id}>{p.crop_name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="relative">
                                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                                    <defs>
                                      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                      </linearGradient>
                                    </defs>

                                    {/* Grid lines */}
                                    <line x1={paddingLeft} y1={getY(minVal + valRange * 0.25)} x2={width - paddingRight} y2={getY(minVal + valRange * 0.25)} stroke="#f3f4f6" strokeDasharray="3,3" />
                                    <line x1={paddingLeft} y1={getY(minVal + valRange * 0.5)} x2={width - paddingRight} y2={getY(minVal + valRange * 0.5)} stroke="#f3f4f6" strokeDasharray="3,3" />
                                    <line x1={paddingLeft} y1={getY(minVal + valRange * 0.75)} x2={width - paddingRight} y2={getY(minVal + valRange * 0.75)} stroke="#f3f4f6" strokeDasharray="3,3" />

                                    {/* Axis Labels */}
                                    <text x={5} y={getY(minVal + valRange * 0.25) + 3} className="text-[7px] font-bold text-gray-400">₹{Math.round((minVal + valRange * 0.25) / 100) * 100}</text>
                                    <text x={5} y={getY(minVal + valRange * 0.5) + 3} className="text-[7px] font-bold text-gray-400">₹{Math.round((minVal + valRange * 0.5) / 100) * 100}</text>
                                    <text x={5} y={getY(minVal + valRange * 0.75) + 3} className="text-[7px] font-bold text-gray-400">₹{Math.round((minVal + valRange * 0.75) / 100) * 100}</text>

                                    {/* Area */}
                                    <path d={areaPath} fill="url(#chart-area-grad)" />

                                    {/* Lines */}
                                    <path d={histPath} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d={futurePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

                                    {/* Markers */}
                                    <circle cx={getX(2013)} cy={getY(histPoints[0].value)} r="2.5" fill="#9ca3af" stroke="white" strokeWidth="1" />
                                    <circle cx={getX(2025)} cy={getY(selectedCropData.base_msp)} r="3" fill="#3b82f6" stroke="white" strokeWidth="1" />
                                    <circle cx={getX(2036)} cy={getY(futurePoints[futurePoints.length - 1].value)} r="3" fill="#10b981" stroke="white" strokeWidth="1" />

                                    {/* Year labels */}
                                    <text x={getX(2013) - 5} y={height - 4} className="text-[7px] font-extrabold text-gray-400">2013</text>
                                    <text x={getX(2025) - 10} y={height - 4} className="text-[7px] font-extrabold text-blue-500">2025</text>
                                    <text x={getX(2036) - 10} y={height - 4} className="text-[7px] font-extrabold text-emerald-600">2036</text>
                                  </svg>
                                  <div className="flex justify-between text-[7px] font-extrabold text-gray-400 uppercase px-1 mt-1">
                                    <span className="flex items-center gap-0.5"><span className="h-1 w-2 bg-gray-400 rounded-sm inline-block"></span> {t('hist')}</span>
                                    <span className="flex items-center gap-0.5"><span className="h-1 w-2 bg-blue-500 rounded-sm inline-block"></span> {t('base')}</span>
                                    <span className="flex items-center gap-0.5"><span className="h-1 w-2 bg-emerald-500 rounded-sm inline-block"></span> {t('pred')}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* List of predicted prices for all crops */}
                          <div className="space-y-2 text-left">
                            <h5 className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider">
                              {t('predictedPrices')} ({selectedMspYear}):
                            </h5>
                            <div className="border border-gray-150 rounded-xl max-h-[160px] overflow-y-auto divide-y divide-gray-100">
                              {mspPredictionsData.predictions.map(pred => (
                                <div key={pred.crop_id} className="p-2 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors">
                                  <div>
                                    <strong className="text-gray-900 font-bold block">{pred.crop_name}</strong>
                                    <span className="text-[9px] text-gray-400">Base: ₹{pred.base_msp}</span>
                                  </div>
                                  <div className="text-right">
                                    <strong className="text-emerald-700 font-bold block">₹{pred.predicted_msp}</strong>
                                    <span className="text-[9px] text-emerald-500 font-bold block">+{pred.growth_rate_pct}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-450 py-4">{t('noPredictionData')}</div>
                      )}
                    </div>

                    {/* Live Mandi Prices Card */}
                    {(() => {
                      const selectedCrop = crops.find(c => c.id === selectedMspChartCropId);
                      if (!selectedCrop) return null;
                      const prices = mandiPrices[selectedMspChartCropId];
                      return (
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 animate-fade-in text-left">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h4 className="font-extrabold text-sm text-gray-900 flex items-center">
                              <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              {t('liveMandiPricesPrefix')}: {selectedCrop.crop_name}
                            </h4>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('updatesLive')}</span>
                          </div>

                          <div className="space-y-2.5">
                            {prices ? prices.map((m, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-gray-50/70 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <div>
                                  <span className="font-bold text-gray-800 block">{m.mandi}</span>
                                  <span className="text-[9px] text-gray-400">{t('standardQuality')}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-gray-900 text-sm block">₹{m.price}</span>
                                  <span className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${m.trend === 'up' ? 'text-emerald-600' : m.trend === 'down' ? 'text-rose-600' : 'text-gray-500'
                                    }`}>
                                    {m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '■'}
                                    {m.change !== 0 ? `${Math.abs(m.change)}` : t('stable')}
                                  </span>
                                </div>
                              </div>
                            )) : (
                              <p className="text-center text-xs text-gray-400 py-2">{t('loadingLivePrices')}</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Crop Yield & Profit Calculator */}
                    {(() => {
                      const selectedCrop = crops.find(c => c.id === selectedMspChartCropId);
                      if (!selectedCrop) return null;
                      const results = getCalculationResults(selectedCrop);
                      if (!results) return null;

                      return (
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 text-left animate-fade-in">
                          <div className="border-b border-gray-100 pb-2">
                            <h4 className="font-extrabold text-sm text-gray-900 flex items-center">
                              <Sliders className="h-4.5 w-4.5 text-emerald-600 mr-2" />
                              Profit & Yield Calculator
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">Estimate investment cost, yield, and margins using current MSP.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-wide block mb-1">Land Size (Acres)</label>
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={calcAcres}
                                onChange={(e) => setCalcAcres(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-wide block mb-1">Cost Per Acre (₹)</label>
                              <input
                                type="number"
                                min="0"
                                step="500"
                                value={calcCostPerAcre}
                                onChange={(e) => setCalcCostPerAcre(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="border-t border-gray-150 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between font-semibold">
                              <span className="text-gray-500">Est. Yield Per Acre:</span>
                              <span className="text-gray-900">{results.yieldPerAcre} Quintals</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span className="text-gray-500">Total Est. Yield:</span>
                              <span className="text-gray-900">{results.totalYield} Quintals</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span className="text-gray-500">Total Investment Cost:</span>
                              <span className="text-rose-600 font-bold">₹{results.totalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span className="text-gray-500">Gross Revenue (at MSP):</span>
                              <span className="text-emerald-600 font-bold">₹{results.totalRevenue.toLocaleString()}</span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-center font-bold">
                              <span className="text-gray-700">Net Est. Profit:</span>
                              <span className={`text-base font-black ${results.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                ₹{results.netProfit.toLocaleString()}
                              </span>
                            </div>

                            <div className="space-y-1 mt-2">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-gray-400 uppercase">Profit Margin</span>
                                <span className={results.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                  {results.profitMarginPct}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${results.netProfit >= 0 ? 'bg-emerald-600' : 'bg-rose-500'}`}
                                  style={{ width: `${results.profitMarginPct}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Procurement Guidelines Sider Card */}
                    <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800 space-y-5">
                      <div className="border-b border-emerald-800 pb-3">
                        <h3 className="font-extrabold text-base tracking-wide flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-emerald-300 mr-2" />
                          Procurement Guidelines
                        </h3>
                        <p className="text-xs text-emerald-300 mt-1">Ensure your harvest qualifies for the full government MSP.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 text-xs">
                          <div className="bg-emerald-800 p-1.5 rounded-lg text-emerald-300 mt-0.5 shrink-0">
                            <Activity className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <strong className="text-emerald-100 font-bold block mb-1">Moisture Limits:</strong>
                            <p className="text-emerald-200/95 leading-relaxed">
                              Paddy and wheat must have a moisture content of **less than 14%**. High moisture content leads to rejection or price deductions.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 text-xs">
                          <div className="bg-emerald-800 p-1.5 rounded-lg text-emerald-300 mt-0.5 shrink-0">
                            <ShieldAlert className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <strong className="text-emerald-100 font-bold block mb-1">Foreign Matter Cleanliness:</strong>
                            <p className="text-emerald-200/95 leading-relaxed">
                              Winnow and clean your grains before bringing them to the market. Dust, chaff, stones, and weed seeds must be under 1%.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 text-xs">
                          <div className="bg-emerald-800 p-1.5 rounded-lg text-emerald-300 mt-0.5 shrink-0">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <strong className="text-emerald-100 font-bold block mb-1">Required Mandi Documents:</strong>
                            <p className="text-emerald-200/95 leading-relaxed">
                              1. Aadhaar Card copy (linked to Bank Account)<br />
                              2. Pattadar Passbook / Land Record Copy<br />
                              3. Bank Passbook copy (for direct DBT cash transfer)<br />
                              4. Crop sowing certificate from local Agriculture Officer
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-850/60 rounded-xl p-3 text-center border border-emerald-800 text-xs">
                        <span className="block text-emerald-300 font-medium">Kisan Helpline Toll-Free</span>
                        <span className="text-sm font-black text-white tracking-wider">1800-180-1551</span>
                      </div>
                    </div>

                    {/* Government Farmer Schemes Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center border-b border-gray-100 pb-2">
                        <Sparkles className="h-4.5 w-4.5 text-amber-500 mr-2" />
                        Key Farmer Schemes
                      </h4>

                      <div className="space-y-3.5 text-xs">
                        <div className="p-3 bg-emerald-50/5 hover:bg-emerald-50/10 border border-gray-100 rounded-xl transition-all">
                          <strong className="text-gray-900 block font-bold">PM-KISAN Yojana</strong>
                          <span className="text-gray-500 text-[10px] block mt-0.5">Income Support Scheme</span>
                          <p className="text-gray-600 mt-1 leading-relaxed">
                            Direct income support of **₹6,000 per year** paid in three equal installments of ₹2,000 directly into bank accounts of land-holding farmer families.
                          </p>
                        </div>

                        <div className="p-3 bg-emerald-50/5 hover:bg-emerald-50/10 border border-gray-100 rounded-xl transition-all">
                          <strong className="text-gray-900 block font-bold">PM Fasal Bima Yojana (PMFBY)</strong>
                          <span className="text-gray-500 text-[10px] block mt-0.5">Crop Insurance Scheme</span>
                          <p className="text-gray-600 mt-1 leading-relaxed">
                            Financial support to farmers suffering crop loss/damage arising out of natural calamities, pests, & diseases at a very low premium (1.5% - 2%).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4b. GOVT SCHEMES ELIGIBILITY MODULE */}
            {activeTab === 'gov-subsidies' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('govtSubsidiesTitle')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t('govtSubsidiesDesc')}</p>
                </div>

                <div className="max-w-3xl bg-white rounded-2xl border border-gray-200 p-8 shadow-md mx-auto text-left space-y-6 animate-fade-in">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="font-extrabold text-lg text-gray-900 flex items-center">
                      <TrendingUp className="h-5 w-5 text-emerald-600 mr-2" />
                      {t('govtSubsidiesTitle')}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{t('govtSubsidiesDesc')}</p>
                  </div>

                  {/* Stepper display */}
                  {schemeStep < 4 && (
                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-black text-gray-400 border-b border-gray-100 pb-3 mb-4">
                      <span className={schemeStep === 1 ? "text-emerald-800 font-black border-b-2 border-emerald-800 pb-2" : ""}>1. Farmer & Land Profile</span>
                      <span>➔</span>
                      <span className={schemeStep === 2 ? "text-emerald-800 font-black border-b-2 border-emerald-800 pb-2" : ""}>2. Farming & Irrigation</span>
                      <span>➔</span>
                      <span className={schemeStep === 3 ? "text-emerald-800 font-black border-b-2 border-emerald-800 pb-2" : ""}>3. Exclusions & Interests</span>
                    </div>
                  )}

                  {/* Step 1 */}
                  {schemeStep === 1 && (
                    <div className="space-y-6">
                      {/* Landholding Size */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Landholding Size</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { value: 'Marginal', label: 'Marginal (< 1 Ha)', desc: 'Very small landholding. Eligible for maximum support.' },
                            { value: 'Small', label: 'Small (1-2 Ha)', desc: 'Small size landholder. Eligible for PM-KISAN.' },
                            { value: 'Large', label: 'Medium/Large (> 2 Ha)', desc: 'Medium or large farming operations.' }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setSchemeLandSize(opt.value)}
                              className={`p-4 border rounded-xl text-left space-y-1 transition-all ${schemeLandSize === opt.value
                                  ? 'border-emerald-500 bg-emerald-50/55 ring-2 ring-emerald-100'
                                  : 'border-gray-250 hover:border-gray-350 bg-white'
                                }`}
                            >
                              <span className="font-extrabold text-xs text-gray-900 block">{opt.label}</span>
                              <span className="text-[10px] text-gray-400 block font-semibold">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* State Location & Demographic Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* State Selection */}
                        <div className="space-y-2 text-left">
                          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            Select State / Location
                          </span>
                          <select
                            value={schemeStateId}
                            onChange={(e) => setSchemeStateId(e.target.value)}
                            className="w-full p-3 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 bg-white font-bold text-gray-700 transition-all cursor-pointer"
                          >
                            <option value="">Select State</option>
                            {states.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.state_name}
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-gray-400 block font-semibold">Enables mapping of state-specific farming benefits.</span>
                        </div>

                        {/* Demographic Category */}
                        <div className="space-y-2 text-left">
                          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Demographic Category</span>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'General', label: 'General / OBC' },
                              { value: 'SC_ST', label: 'SC / ST' },
                              { value: 'Woman', label: 'Woman Farmer' }
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setSchemeDemographic(opt.value)}
                                className={`py-3 px-2 border rounded-xl text-center transition-all ${schemeDemographic === opt.value
                                    ? 'border-emerald-500 bg-emerald-50/55 ring-2 ring-emerald-100 font-bold bg-emerald-50/20'
                                    : 'border-gray-250 hover:border-gray-350 bg-white'
                                  }`}
                              >
                                <span className="text-[10px] text-gray-900 block font-black">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 block font-semibold">Women & SC/ST farmers get higher percentages of subsidy support.</span>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          onClick={() => setSchemeStep(2)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1"
                        >
                          <span>Next Step</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {schemeStep === 2 && (
                    <div className="space-y-6">
                      {/* Crop Categories */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Crop Categories Cultivated</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { value: 'Foodgrains', label: 'Foodgrains & Pulses', desc: 'Rice, wheat, millets, pulses, etc.' },
                            { value: 'Oilseeds', label: 'Oilseeds Varieties', desc: 'Mustard, groundnut, soybean, sunflower.' },
                            { value: 'Commercial', label: 'Commercial / Cash Crops', desc: 'Sugarcane, cotton, jute, horticulture.' }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button; return false;"
                              onClick={() => setSchemeCropsType(opt.value)}
                              className={`p-4 border rounded-xl text-left space-y-1 transition-all ${schemeCropsType === opt.value
                                  ? 'border-emerald-500 bg-emerald-50/55 ring-2 ring-emerald-100'
                                  : 'border-gray-250 hover:border-gray-350 bg-white'
                                }`}
                            >
                              <span className="font-extrabold text-xs text-gray-900 block">{opt.label}</span>
                              <span className="text-[10px] text-gray-400 block font-semibold">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Primary Irrigation Source */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Primary Irrigation Source</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { value: 'Rainfed', label: 'Rainfed / Natural Climate', desc: 'Depending solely on monsoon rains. Traditional practices.' },
                            { value: 'BorewellDrip', label: 'Borewell / Tube-well / Drip system', desc: 'Active groundwater extraction or micro-irrigation system.' }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setSchemeIrrigation(opt.value)}
                              className={`p-4 border rounded-xl text-left space-y-1 transition-all ${schemeIrrigation === opt.value
                                  ? 'border-emerald-500 bg-emerald-50/55 ring-2 ring-emerald-100'
                                  : 'border-gray-250 hover:border-gray-350 bg-white'
                                }`}
                            >
                              <span className="font-extrabold text-xs text-gray-900 block">{opt.label}</span>
                              <span className="text-[10px] text-gray-400 block font-semibold">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 flex justify-between">
                        <button
                          onClick={() => setSchemeStep(1)}
                          className="border border-gray-250 text-gray-700 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-xs"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setSchemeStep(3)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1 text-xs"
                        >
                          <span>Next Step</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {schemeStep === 3 && (
                    <div className="space-y-6">
                      {/* Exclusion Status Toggle */}
                      <div className="p-5 border border-gray-200 rounded-xl space-y-3 bg-slate-50/50 text-left">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-xs text-gray-955 block">Exclusion Criteria (Income Taxpayer)</span>
                            <span className="text-[10px] text-gray-400 block font-semibold leading-relaxed mt-0.5">
                              Are you or any member of your immediate family an income taxpayer, professional, or government employee?
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSchemeIsTaxpayer(!schemeIsTaxpayer)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 focus:outline-none ${schemeIsTaxpayer ? 'bg-emerald-600' : 'bg-gray-300'
                              }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${schemeIsTaxpayer ? 'translate-x-6' : 'translate-x-0'
                                }`}
                            ></div>
                          </button>
                        </div>
                        {schemeIsTaxpayer && (
                          <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-lg text-[10px] text-rose-800 font-semibold leading-relaxed">
                            ⚠️ Note: Income taxpayers, institutional landowners, and retired/serving government employees are excluded from PM-KISAN.
                          </div>
                        )}
                      </div>

                      {/* Special Interests */}
                      <div className="space-y-2 text-left">
                        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Special Agricultural Subsidies Interests</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            {
                              id: 'solar',
                              label: 'Solar Water Pump (PM-KUSUM)',
                              desc: 'Looking to install solar irrigation pumps with up to 60-90% capital subsidy.',
                              state: schemeSolarInterest,
                              setter: setSchemeSolarInterest
                            },
                            {
                              id: 'machinery',
                              label: 'Farm Mechanization (SMAM)',
                              desc: 'Looking for subsidies on tractors, rotavators, tillers, or custom equipment.',
                              state: schemeMachineryInterest,
                              setter: setSchemeMachineryInterest
                            },
                            {
                              id: 'drone',
                              label: t('schemeDroneInterest'),
                              desc: t('schemeDroneDesc'),
                              state: schemeDroneInterest,
                              setter: setSchemeDroneInterest
                            },
                            {
                              id: 'residue',
                              label: t('schemeResidueInterest'),
                              desc: t('schemeResidueDesc'),
                              state: schemeResidueInterest,
                              setter: setSchemeResidueInterest
                            },
                            {
                              id: 'chc',
                              label: t('schemeChcInterest'),
                              desc: t('schemeChcDesc'),
                              state: schemeChcInterest,
                              setter: setSchemeChcInterest
                            }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => item.setter(!item.state)}
                              className={`p-4 border rounded-xl text-left space-y-1 transition-all ${item.state
                                  ? 'border-emerald-500 bg-emerald-50/55 ring-2 ring-emerald-100 font-medium'
                                  : 'border-gray-250 hover:border-gray-350 bg-white'
                                }`}
                            >
                              <span className="font-extrabold text-xs text-gray-900 block">{item.label}</span>
                              <span className="text-[10px] text-gray-400 block font-semibold leading-relaxed">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 flex justify-between">
                        <button
                          onClick={() => setSchemeStep(2)}
                          className="border border-gray-250 text-gray-750 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-xs"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setSchemeStep(4)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1 text-xs"
                        >
                          <span>Calculate Eligibility</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Results */}
                  {schemeStep === 4 && (
                    <div className="space-y-5 text-left">
                      <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Matched Government Schemes:</span>

                      {(() => {
                        const matchedSchemes = [];
                        const selectedStateObj = states.find(st => st.id.toString() === schemeStateId.toString());
                        const stateName = selectedStateObj ? selectedStateObj.state_name : '';

                        // 1. PM-KISAN
                        const isKisanEligible = (schemeLandSize === 'Marginal' || schemeLandSize === 'Small') && !schemeIsTaxpayer;
                        let kisanReason = '';
                        if (schemeIsTaxpayer) {
                          kisanReason = 'Exclusion criteria: Household income taxpayer status.';
                        } else if (schemeLandSize === 'Large') {
                          kisanReason = 'Exclusion criteria: Large landholders (> 2 Ha) are not eligible.';
                        }
                        matchedSchemes.push({
                          name: "PM-KISAN Samman Nidhi",
                          benefit: "₹6,000 per year direct income support paid in 3 installments.",
                          desc: "Designed to help marginal and small farmers cover input cultivation costs.",
                          eligible: isKisanEligible,
                          reason: kisanReason,
                          url: "https://pmkisan.gov.in/"
                        });

                        // 2. PMKSY Micro-Irrigation
                        const isPmksyEligible = schemeIrrigation === 'BorewellDrip';
                        const pmksySubs = (schemeDemographic === 'Woman' || schemeDemographic === 'SC_ST' || schemeLandSize !== 'Large') ? '55% to 90%' : '45% to 50%';
                        matchedSchemes.push({
                          name: "PMKSY (Micro-Irrigation Subsidy)",
                          benefit: `${pmksySubs} capital subsidy on installing drip & sprinkler systems.`,
                          desc: "Improves water efficiency. High recommendation for cash crop and vegetable growers.",
                          eligible: isPmksyEligible,
                          reason: !isPmksyEligible ? "Requires a modern borewell/drip irrigation system interest." : "",
                          url: "https://pmksy.gov.in/"
                        });

                        // 3. PMFBY (Crop Insurance)
                        matchedSchemes.push({
                          name: "PM Fasal Bima Yojana (PMFBY)",
                          benefit: `Comprehensive crop insurance with nominal premium (${schemeCropsType === 'Commercial' ? '5%' : '1.5% - 2%'}).`,
                          desc: "Protects against yield losses from natural calamities, droughts, storms, or floods.",
                          eligible: true,
                          reason: "",
                          url: "https://pmfby.gov.in/"
                        });

                        // 4. PKVY (Organic Farming)
                        const isPkvyEligible = schemeCropsType !== 'Commercial' && schemeLandSize !== 'Large';
                        matchedSchemes.push({
                          name: "Paramparagat Krishi Vikas Yojana (PKVY)",
                          benefit: "₹50,000 assistance per hectare for organic inputs & packaging.",
                          desc: "Supports clusters of small/marginal farmers converting to chemical-free organic farming.",
                          eligible: isPkvyEligible,
                          reason: schemeCropsType === 'Commercial' ? "Only foodgrains and oilseeds qualify for organic cluster assistance." : "Excludes large landholders (> 2 Ha).",
                          url: "https://pgsindia-ncof.gov.in/pkvy/index.aspx"
                        });

                        // 5. PM-KUSUM (Solar Pumps) - Optional based on interest
                        if (schemeSolarInterest || schemeIrrigation === 'BorewellDrip') {
                          const kusumSubs = (schemeDemographic === 'Woman' || schemeDemographic === 'SC_ST') ? '90%' : '60%';
                          matchedSchemes.push({
                            name: "PM-KUSUM (Solar Pump Subsidy)",
                            benefit: `Up to ${kusumSubs} subsidy (Central + State) on solar water pump installation (Component-B).`,
                            desc: "Replaces diesel pumps with eco-friendly solar-powered pumps. 30% bank loan option available.",
                            eligible: true,
                            reason: "",
                            url: "https://pmkusum.mnre.gov.in/"
                          });
                        }

                        // 6. SMAM (Mechanization) - Optional based on interest
                        if (schemeMachineryInterest) {
                          const smamSubs = (schemeDemographic === 'Woman' || schemeDemographic === 'SC_ST') ? '50% - 60%' : '40% - 50%';
                          matchedSchemes.push({
                            name: "SMAM (Sub-Mission on Agricultural Mechanization)",
                            benefit: `${smamSubs} subsidy for purchasing tractors, power tillers, and sowing equipment.`,
                            desc: "Supports acquisition of custom machinery to promote modern agricultural technology.",
                            eligible: true,
                            reason: "",
                            url: "https://agrimachinery.nic.in/"
                          });
                        }

                        // 7. RKVY Agri-Drone Subsidy - Optional based on interest
                        if (schemeDroneInterest) {
                          const droneSubs = (schemeDemographic === 'Woman' || schemeDemographic === 'SC_ST' || schemeLandSize === 'Marginal' || schemeLandSize === 'Small') ? '50% (Up to ₹5 Lakhs)' : '40% (Up to ₹4 Lakhs)';
                          matchedSchemes.push({
                            name: "RKVY - Agri-Drone Subsidy Scheme",
                            benefit: `${droneSubs} capital subsidy for purchasing agricultural drones.`,
                            desc: "Promotes precision farming, pesticide spraying, and crop health monitoring via drones. Special incentives for cooperative groups and FPOs (up to 100% grant).",
                            eligible: true,
                            reason: "",
                            url: "https://agrimachinery.nic.in/"
                          });
                        }

                        // 8. Crop Residue Management (CRM) Scheme - Optional based on interest
                        if (schemeResidueInterest) {
                          const isNorthState = stateName && (stateName.includes("Punjab") || stateName.includes("Haryana") || stateName.includes("Uttar Pradesh") || stateName.includes("Delhi") || stateName.includes("UP"));
                          matchedSchemes.push({
                            name: "Crop Residue Management (CRM) Scheme",
                            benefit: "50% capital subsidy for individual farmers; 80% subsidy for cooperative societies.",
                            desc: `Supports purchase of Happy Seeders, Mulchers, Straw Choppers, and Balers to prevent stubble burning. ${isNorthState ? '🔥 High-priority state subsidy bonus active.' : 'Available for eco-friendly stubble management.'}`,
                            eligible: true,
                            reason: "",
                            url: "https://agrimachinery.nic.in/"
                          });
                        }

                        // 9. Custom Hiring Centre (CHC) Promotion Scheme - Optional based on interest
                        if (schemeChcInterest) {
                          matchedSchemes.push({
                            name: "Custom Hiring Centre (CHC) Promotion Scheme",
                            benefit: "40% to 80% capital subsidy on farm machinery bank projects up to ₹10-25 Lakhs.",
                            desc: "Assists FPOs, cooperative societies, and rural youth to establish local machinery hubs. Enables renting out tractors, seeders, and harvesters at subsidised rates.",
                            eligible: true,
                            reason: "",
                            url: "https://agrimachinery.nic.in/"
                          });
                        }

                        // 7. State Specific Schemes
                        if (stateName) {
                          if (stateName.includes("Telangana")) {
                            matchedSchemes.push({
                              name: "Rythu Bandhu Scheme (Telangana)",
                              benefit: "₹10,000 per acre per year direct crop investment support.",
                              desc: "Provides financial aid for purchase of seeds, fertilizers, pesticides, and field prep.",
                              eligible: true,
                              reason: "",
                              url: "https://rythubandhu.telangana.gov.in/"
                            });
                          } else if (stateName.includes("Andhra Pradesh") || stateName.includes("Andhra")) {
                            matchedSchemes.push({
                              name: "YSR Rythu Bharosa (Andhra Pradesh)",
                              benefit: "₹13,500 per year direct financial assistance (includes tenant farmers).",
                              desc: "Supports landholder and tenant farmer families in meeting inputs cultivation cost.",
                              eligible: true,
                              reason: "",
                              url: "https://ysrrythubarosa.ap.gov.in/"
                            });
                          } else if (stateName.includes("West Bengal")) {
                            matchedSchemes.push({
                              name: "Krishak Bandhu (West Bengal)",
                              benefit: "Up to ₹10,000 per year financial assistance + ₹2 Lakh life insurance.",
                              desc: "Guarantees direct financial support to all agricultural landholders.",
                              eligible: true,
                              reason: "",
                              url: "https://krishakbandhu.net/"
                            });
                          } else if (stateName.includes("Odisha")) {
                            matchedSchemes.push({
                              name: "KALIA Scheme (Odisha)",
                              benefit: "₹25,000 assistance over five cropping seasons for small & marginal farmers.",
                              desc: "Aims to accelerate agricultural growth and reduce poverty among farmers.",
                              eligible: true,
                              reason: "",
                              url: "https://kalia.odisha.gov.in/"
                            });
                          } else {
                            matchedSchemes.push({
                              name: `State Crop Support & Credit Card (KCC) - ${stateName}`,
                              benefit: "4% interest rate on Crop Loans up to ₹3 Lakh + local cooperative fertilizer subsidy.",
                              desc: `Eligible for state-level cooperative assistance and crop loans in the state of ${stateName}.`,
                              eligible: true,
                              reason: "",
                              url: "https://agricoop.nic.in/"
                            });
                          }
                        }

                        return (
                          <div className="space-y-4">
                            {matchedSchemes.map((sch, sIdx) => (
                              <div
                                key={sIdx}
                                className={`border rounded-xl p-5 space-y-2 text-xs transition-all ${sch.eligible
                                    ? 'bg-emerald-50/45 border-emerald-150'
                                    : 'bg-gray-50/60 border-gray-200 opacity-80'
                                  }`}
                              >
                                <h5 className="font-extrabold text-sm flex items-center justify-between">
                                  <span className={sch.eligible ? 'text-emerald-900 font-extrabold font-sans' : 'text-gray-500 font-sans'}>
                                    {sch.name}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${sch.eligible
                                      ? 'bg-emerald-200 text-emerald-800 border-emerald-300/30'
                                      : 'bg-rose-100 text-rose-800 border-rose-200/30'
                                    }`}>
                                    {sch.eligible ? 'Eligible' : 'Not Eligible'}
                                  </span>
                                </h5>

                                {sch.eligible ? (
                                  <p className="text-emerald-700 font-bold text-xs flex items-center">
                                    <span className="mr-1">🛡️</span> {sch.benefit}
                                  </p>
                                ) : (
                                  <p className="text-rose-700 font-bold text-xs flex items-center">
                                    <span className="mr-1">⚠️</span> {sch.reason}
                                  </p>
                                )}

                                <p className="text-gray-500 text-xs leading-relaxed font-medium">{sch.desc}</p>

                                <div className="pt-2 flex justify-end">
                                  {sch.eligible ? (
                                    <a
                                      href={sch.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center space-x-1"
                                    >
                                      <span>Apply Now</span>
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </a>
                                  ) : (
                                    <span className="px-4 py-2 bg-gray-200 text-gray-400 font-bold rounded-lg text-xs cursor-not-allowed">
                                      Ineligible
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      <div className="flex justify-center border-t border-gray-150 pt-5">
                        <button
                          onClick={() => {
                            setSchemeStep(1);
                            setSchemeLandSize('Marginal');
                            setSchemeCropsType('Foodgrains');
                            setSchemeIrrigation('Rainfed');
                            setSchemeDemographic('General');
                            setSchemeIsTaxpayer(false);
                            setSchemeSolarInterest(false);
                            setSchemeMachineryInterest(false);
                            setSchemeDroneInterest(false);
                            setSchemeResidueInterest(false);
                            setSchemeChcInterest(false);
                            setSchemeStateId('');
                          }}
                          className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-sm"
                        >
                          Check Again / Restart
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3b. SMART FARM TOOLS MODULE */}
            {activeTab === 'tools' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('toolsTitle')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t('toolsDesc')}</p>
                </div>

                {/* Main Tabs for Tools */}
                <div className="flex border-b border-gray-200">
                  {[
                    { id: 'calculators', label: t('calculators') },
                    { id: 'diagnostics', label: t('soilDiagnostics') },
                    { id: 'predictor', label: t('growthPredictor') }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setToolsTab(sub.id)}
                      className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
                        toolsTab === sub.id
                          ? 'border-emerald-600 text-emerald-800 font-extrabold'
                          : 'border-transparent text-gray-500 hover:text-emerald-700'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT: CALCULATORS */}
                {toolsTab === 'calculators' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Left Navigation for Calculators */}
                    <div className="md:col-span-1 space-y-1">
                      {[
                        { id: 'seed', label: t('seedCalculator') },
                        { id: 'npk', label: t('nueCalculator') },
                        { id: 'water', label: t('waterCalculator') }
                      ].map((calcSub) => (
                        <button
                          key={calcSub.id}
                          onClick={() => setToolsCalcSubTab(calcSub.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                            toolsCalcSubTab === calcSub.id
                              ? 'bg-emerald-50 text-emerald-800 shadow-sm border-l-4 border-l-emerald-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-700'
                          }`}
                        >
                          {calcSub.label}
                        </button>
                      ))}
                    </div>

                    {/* Right Panel for Selected Calculator */}
                    <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
                      {/* 1. SEED RATE CALCULATOR */}
                      {toolsCalcSubTab === 'seed' && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-extrabold text-base text-gray-900">{t('seedRateCalculatorTitle')}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Determine seeds required based on spacing and germination metrics.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inputs */}
                            <div className="space-y-4">
                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('cropVariety')}</label>
                                <select
                                  value={seedCrop}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSeedCrop(val);
                                    if (CROP_PRESETS[val]) {
                                      setSeedRowSpacing(CROP_PRESETS[val].defaultRow.toString());
                                      setSeedPlantSpacing(CROP_PRESETS[val].defaultPlant.toString());
                                    }
                                  }}
                                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-700"
                                >
                                  {Object.keys(CROP_PRESETS).map((key) => (
                                    <option key={key} value={key}>{CROP_PRESETS[key].name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('farmSizeAcres')}</label>
                                <input
                                  type="number"
                                  value={seedAcres}
                                  min="0.1"
                                  step="0.1"
                                  onChange={(e) => setSeedAcres(e.target.value)}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('rowSpacingCm')}</label>
                                  <input
                                    type="number"
                                    value={seedRowSpacing}
                                    onChange={(e) => setSeedRowSpacing(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                                  />
                                </div>
                                <div className="space-y-1.5 text-left">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('plantSpacingCm')}</label>
                                  <input
                                    type="number"
                                    value={seedPlantSpacing}
                                    onChange={(e) => setSeedPlantSpacing(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('germinationRatePct')}</label>
                                <input
                                  type="range"
                                  value={seedGermination}
                                  min="50"
                                  max="100"
                                  onChange={(e) => setSeedGermination(e.target.value)}
                                  className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 font-black">
                                  <span>50%</span>
                                  <span className="text-emerald-750 font-extrabold">{seedGermination}%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            </div>

                            {/* Outputs */}
                            {(() => {
                              const acres = parseFloat(seedAcres) || 0;
                              const row = parseFloat(seedRowSpacing) || 20;
                              const plant = parseFloat(seedPlantSpacing) || 15;
                              const germ = parseFloat(seedGermination) || 85;
                              const preset = CROP_PRESETS[seedCrop] || CROP_PRESETS.rice;

                              // Spacing Population Math
                              const plantPopulation = Math.round((acres * 4047) / ((row / 100) * (plant / 100)) * (germ / 100));
                              const seedWeightKg = ((plantPopulation * preset.seedTestWeight) / (1000 * 1000 * (germ / 100))).toFixed(1);

                              return (
                                <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-2xl p-6 flex flex-col justify-between">
                                  <div className="space-y-4">
                                    <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider">{t('results')}</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-white p-3.5 rounded-xl border border-emerald-100/30 shadow-sm text-left">
                                        <span className="text-[10px] text-gray-400 font-bold block">{t('totalSeedRequired')}</span>
                                        <span className="text-lg font-black text-emerald-900 mt-1 block">{seedWeightKg} <span className="text-xs">kg</span></span>
                                      </div>
                                      <div className="bg-white p-3.5 rounded-xl border border-emerald-100/30 shadow-sm text-left">
                                        <span className="text-[10px] text-gray-400 font-bold block">{t('seedRatePerAcre')}</span>
                                        <span className="text-lg font-black text-emerald-900 mt-1 block">{(seedWeightKg / (acres || 1)).toFixed(1)} <span className="text-xs">kg/ac</span></span>
                                      </div>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100/30 shadow-sm text-left">
                                      <span className="text-[10px] text-gray-400 font-bold block">{t('targetPlantPopulation')}</span>
                                      <span className="text-lg font-black text-gray-900 mt-1 block">{plantPopulation.toLocaleString()} <span className="text-xs text-gray-400 font-semibold">seedlings</span></span>
                                    </div>
                                  </div>

                                  <div className="mt-6 text-left p-3.5 bg-white border border-emerald-100/30 rounded-xl">
                                    <span className="text-[10px] text-amber-800 font-black block flex items-center">💡 Spacing Tip</span>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-medium">
                                      For {preset.name}, optimal row spacing is {preset.defaultRow}cm and plant spacing is {preset.defaultPlant}cm. Adequate spacing avoids plant crowding and minimizes pest migrations.
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* 2. NUE/NPK CALCULATOR */}
                      {toolsCalcSubTab === 'npk' && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-extrabold text-base text-gray-900">{t('nueCalculatorTitle')}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Evaluate chemical fertilizer application efficiency and NPK absorption rates.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inputs */}
                            <div className="space-y-4">
                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('cropVariety')}</label>
                                <select
                                  value={nueCrop}
                                  onChange={(e) => setNueCrop(e.target.value)}
                                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-700"
                                >
                                  {Object.keys(CROP_PRESETS).map((key) => (
                                    <option key={key} value={key}>{CROP_PRESETS[key].name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('actualYieldObtained')}</label>
                                <input
                                  type="number"
                                  value={nueYield}
                                  min="1"
                                  onChange={(e) => setNueYield(e.target.value)}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                                />
                              </div>

                              <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('fertilizerBagsApplied')}</label>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 font-bold block">Urea (N)</span>
                                    <input
                                      type="number"
                                      value={nueUreaBags}
                                      step="0.5"
                                      onChange={(e) => setNueUreaBags(e.target.value)}
                                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 font-bold block">SSP (P)</span>
                                    <input
                                      type="number"
                                      value={nueSspBags}
                                      step="0.5"
                                      onChange={(e) => setNueSspBags(e.target.value)}
                                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 font-bold block">MOP (K)</span>
                                    <input
                                      type="number"
                                      value={nueMopBags}
                                      step="0.5"
                                      onChange={(e) => setNueMopBags(e.target.value)}
                                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Outputs */}
                            {(() => {
                              const yieldAmt = parseFloat(nueYield) || 1;
                              const urea = parseFloat(nueUreaBags) || 0;
                              const ssp = parseFloat(nueSspBags) || 0;
                              const mop = parseFloat(nueMopBags) || 0;

                              // Apply actual NPK kg conversion
                              const appliedN = urea * 50 * 0.46;
                              const appliedP = ssp * 50 * 0.16;
                              const appliedK = mop * 50 * 0.60;
                              const totalApplied = Math.max(1, appliedN + appliedP + appliedK);

                              // NPK extraction factors per quintal
                              const cropFactors = {
                                rice: { N: 1.8, P: 0.4, K: 1.8 },
                                wheat: { N: 2.2, P: 0.5, K: 1.9 },
                                maize: { N: 2.0, P: 0.6, K: 2.0 },
                                cotton: { N: 3.5, P: 1.0, K: 3.0 }
                              };
                              const factors = cropFactors[nueCrop] || cropFactors.rice;

                              const extN = yieldAmt * factors.N;
                              const extP = yieldAmt * factors.P;
                              const extK = yieldAmt * factors.K;
                              const totalExtracted = extN + extP + extK;

                              const nuePct = Math.min(100, Math.round((totalExtracted / totalApplied) * 100));

                              let rating = "Excellent (Balanced)";
                              let colorClass = "text-emerald-700 bg-emerald-50 border-emerald-150";
                              let advice = "Superb balance! Nutrient application aligns perfectly with crop metabolic demands. Soil chemical depletion risk is low.";

                              if (nuePct < 35) {
                                rating = "Poor (Heavy Wastage)";
                                colorClass = "text-rose-700 bg-rose-50 border-rose-150";
                                advice = "Excessive fertilizer application detected. Emitters and groundwater are at risk of chemical runoffs, which also lock soil pH.";
                              } else if (nuePct < 60) {
                                rating = "Moderate (Slight Overuse)";
                                colorClass = "text-amber-800 bg-amber-50 border-amber-150";
                                advice = "Fertilizers are slightly overused. Try reducing Urea or SSP dosage by 10-15% and incorporate organic vermicompost to aid natural uptake.";
                              }

                              return (
                                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
                                  <div className="space-y-4">
                                    <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">{t('results')}</h4>
                                    
                                    <div className="flex items-center space-x-4">
                                      <div className="relative flex items-center justify-center shrink-0">
                                        <svg className="w-20 h-20 transform -rotate-90">
                                          <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                                          <circle cx="40" cy="40" r="34" stroke={nuePct < 35 ? "#ef4444" : nuePct < 60 ? "#f59e0b" : "#10b981"} strokeWidth="6" fill="transparent"
                                            strokeDasharray={213.6}
                                            strokeDashoffset={213.6 - (213.6 * nuePct) / 100}
                                          />
                                        </svg>
                                        <span className="absolute text-sm font-black text-gray-900">{nuePct}%</span>
                                      </div>
                                      <div className="text-left">
                                        <span className="text-[10px] text-gray-400 font-bold block">{t('nutrientUseEfficiency')}</span>
                                        <span className="text-base font-black text-gray-800 mt-0.5 block">{rating}</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-left">
                                      <div className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs">
                                        <span className="text-[9px] text-gray-400 font-bold block">N Applied</span>
                                        <span className="text-xs font-extrabold text-gray-700 mt-0.5 block">{appliedN.toFixed(1)} kg</span>
                                      </div>
                                      <div className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs">
                                        <span className="text-[9px] text-gray-400 font-bold block">P Applied</span>
                                        <span className="text-xs font-extrabold text-gray-700 mt-0.5 block">{appliedP.toFixed(1)} kg</span>
                                      </div>
                                      <div className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs">
                                        <span className="text-[9px] text-gray-400 font-bold block">K Applied</span>
                                        <span className="text-xs font-extrabold text-gray-700 mt-0.5 block">{appliedK.toFixed(1)} kg</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={`mt-6 text-left p-3.5 rounded-xl border font-medium ${colorClass}`}>
                                    <span className="text-[10px] font-black uppercase tracking-wider block">NPK Advisory</span>
                                    <p className="text-[11px] mt-1 leading-relaxed text-gray-600">
                                      {advice}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* 3. IRRIGATION WATER CALCULATOR */}
                      {toolsCalcSubTab === 'water' && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-extrabold text-base text-gray-900">{t('waterCalculatorTitle')}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Determine crop daily water needs based on growth stage, weather, and soil texture.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inputs */}
                            <div className="space-y-4">
                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('cropGrowthStage')}</label>
                                <select
                                  value={waterStage}
                                  onChange={(e) => setWaterStage(e.target.value)}
                                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-700"
                                >
                                  <option value="sowing">Sowing / Initial (0-4 Weeks)</option>
                                  <option value="vegetative">Vegetative Growth (4-8 Weeks)</option>
                                  <option value="flowering">Flowering / Heading (8-12 Weeks)</option>
                                  <option value="yield">Yield Formation (12-16 Weeks)</option>
                                  <option value="harvest">Ripening / Harvesting (16+ Weeks)</option>
                                </select>
                              </div>

                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('farmSizeAcres')}</label>
                                <input
                                  type="number"
                                  value={waterAcres}
                                  min="0.1"
                                  step="0.1"
                                  onChange={(e) => setWaterAcres(e.target.value)}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                                />
                              </div>

                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('soilTexture')}</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {['sand', 'loam', 'clay'].map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => setWaterSoil(s)}
                                      className={`py-2 border rounded-xl text-center capitalize transition-all text-[10px] font-black ${
                                        waterSoil === s
                                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                                          : 'border-gray-200 bg-white hover:border-gray-300'
                                      }`}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('currentTemperature')}</label>
                                <input
                                  type="range"
                                  value={waterTemp}
                                  min="15"
                                  max="45"
                                  onChange={(e) => setWaterTemp(e.target.value)}
                                  className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 font-black">
                                  <span>15°C</span>
                                  <span className="text-emerald-750 font-extrabold">{waterTemp}°C</span>
                                  <span>45°C</span>
                                </div>
                              </div>
                            </div>

                            {/* Outputs */}
                            {(() => {
                              const acres = parseFloat(waterAcres) || 0;
                              const temp = parseFloat(waterTemp) || 28;

                              // ETc base factors (mm/day)
                              const etBaseline = {
                                sowing: 2.0,
                                vegetative: 4.5,
                                flowering: 6.2,
                                yield: 5.0,
                                harvest: 1.5
                              };
                              const baseEt = etBaseline[waterStage] || 4.5;

                              // Temp multiplier
                              const tempMult = temp > 35 ? 1.3 : temp < 22 ? 0.75 : 1.0;

                              // Soil drainage multiplier
                              const soilMult = { sand: 1.25, loam: 1.0, clay: 0.8 };
                              const sMult = soilMult[waterSoil] || 1.0;

                              const dailyDepthMm = baseEt * tempMult * sMult;
                              const totalLitres = Math.round(dailyDepthMm * (acres * 4047));

                              // Drip run time (standard emitter delivery at 1.25mm depth equivalent per hour)
                              const dripRunHours = (dailyDepthMm / 1.25).toFixed(1);

                              return (
                                <div className="bg-sky-50/20 border border-sky-100/50 rounded-2xl p-6 flex flex-col justify-between">
                                  <div className="space-y-4">
                                    <h4 className="font-extrabold text-xs text-sky-800 uppercase tracking-wider">{t('results')}</h4>
                                    
                                    <div className="bg-white p-3.5 rounded-xl border border-sky-100/30 shadow-sm text-left">
                                      <span className="text-[10px] text-gray-400 font-bold block">{t('dailyIrrigationVolume')}</span>
                                      <span className="text-xl font-black text-sky-900 mt-1 block">
                                        {totalLitres.toLocaleString()} <span className="text-xs font-semibold text-gray-500">Liters / Day</span>
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-sky-100/30 shadow-sm text-left">
                                      <span className="text-[10px] text-gray-400 font-bold block">{t('dripSystemRunTime')}</span>
                                      <span className="text-xl font-black text-sky-900 mt-1 block">
                                        {dripRunHours} <span className="text-xs font-semibold text-gray-500">Hours / Day</span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-6 text-left p-3.5 bg-white border border-sky-100/30 rounded-xl">
                                    <span className="text-[10px] text-sky-800 font-black block flex items-center">💡 Hydrology Tip</span>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-medium">
                                      {waterSoil === 'sand'
                                        ? "Sandy soils leach water extremely fast. Water multiple times in shorter durations (e.g. twice daily for half the time) to prevent nutrient leaching."
                                        : waterSoil === 'clay'
                                        ? "Clay soils retain water. Avoid excessive watering to prevent root-rot/asphyxiation. Keep spacing intervals larger."
                                        : "Loam soil offers ideal moisture retention. Maintain standard single irrigation runs."}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: SOIL DIAGNOSTICS */}
                {toolsTab === 'diagnostics' && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md">
                    <div className="border-b border-gray-100 pb-3 mb-6">
                      <h3 className="font-extrabold text-lg text-gray-900 flex items-center">
                        <Activity className="h-5 w-5 text-emerald-600 mr-2" />
                        {t('soilDiagnosticsTitle')}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">Input laboratory test parameters to calculate health scores and chemical prescriptions.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left 2 Cols: Sliders & Form */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* pH & EC Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5 text-left">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('soilPhLevel')}</label>
                            <input
                              type="range"
                              value={soilDiagPh}
                              min="4.5"
                              max="9.5"
                              step="0.1"
                              onChange={(e) => setSoilDiagPh(e.target.value)}
                              className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 font-black">
                              <span>4.5 (Acidic)</span>
                              <span className="text-emerald-700 font-extrabold">{soilDiagPh}</span>
                              <span>9.5 (Alkaline)</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('soilSalinityEc')}</label>
                            <input
                              type="range"
                              value={soilDiagEc}
                              min="0.1"
                              max="4.0"
                              step="0.1"
                              onChange={(e) => setSoilDiagEc(e.target.value)}
                              className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 font-black">
                              <span>0.1 (Normal)</span>
                              <span className="text-emerald-700 font-extrabold">{soilDiagEc} dS/m</span>
                              <span>4.0 (Highly Saline)</span>
                            </div>
                          </div>
                        </div>

                        {/* OC Row */}
                        <div className="space-y-1.5 text-left">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('organicCarbonOc')}</label>
                          <input
                            type="range"
                            value={soilDiagOc}
                            min="0.1"
                            max="1.5"
                            step="0.05"
                            onChange={(e) => setSoilDiagOc(e.target.value)}
                            className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-gray-400 font-black">
                            <span>0.1% (Very Low)</span>
                            <span className="text-emerald-700 font-extrabold">{soilDiagOc}%</span>
                            <span>1.5% (High / Rich)</span>
                          </div>
                        </div>

                        {/* NPK Level Toggles */}
                        <div className="space-y-4">
                          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block text-left">Secondary Nutrient Levels (NPK)</span>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { label: t('nitrogenLevel'), state: soilDiagN, setter: setSoilDiagN },
                              { label: t('phosphorusLevel'), state: soilDiagP, setter: setSoilDiagP },
                              { label: t('potassiumLevel'), state: soilDiagK, setter: setSoilDiagK }
                            ].map((item, idx) => (
                              <div key={idx} className="space-y-1.5 text-left">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{item.label}</label>
                                <div className="flex border border-gray-200 rounded-xl overflow-hidden text-[10px] font-black bg-white">
                                  {['Low', 'Medium', 'High'].map((lvl) => (
                                    <button
                                      key={lvl}
                                      type="button"
                                      onClick={() => item.setter(lvl)}
                                      className={`flex-1 py-2 text-center transition-all ${
                                        item.state === lvl
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-white text-gray-500 hover:bg-gray-50'
                                      }`}
                                    >
                                      {lvl}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right 1 Col: Score Gauge and Recommendations */}
                      {(() => {
                        const ph = parseFloat(soilDiagPh) || 7.0;
                        const ec = parseFloat(soilDiagEc) || 0.8;
                        const oc = parseFloat(soilDiagOc) || 0.6;

                        let penalties = 0;
                        const warnings = [];
                        const remedies = [];

                        // pH Penalty
                        if (ph < 6.0) {
                          penalties += (6.0 - ph) * 20;
                          warnings.push(`Acidic soil stress (pH ${ph})`);
                          remedies.push("Apply Agricultural Lime (calcium carbonate) at 1.5 tons/acre to neutralize acidity.");
                        } else if (ph > 8.0) {
                          penalties += (ph - 8.0) * 20;
                          warnings.push(`Alkaline soil stress (pH ${ph})`);
                          remedies.push("Buffer alkalinity by applying Gypsum (calcium sulfate) at 2.0 tons/acre.");
                        }

                        // EC Salinity Penalty
                        if (ec > 1.6) {
                          penalties += (ec - 1.6) * 15;
                          warnings.push(`Elevated Soil Salinity (EC ${ec} dS/m)`);
                          remedies.push("Improve drainage, leach soil with soft water, and avoid chemical potash inputs.");
                        }

                        // Organic Carbon Penalty
                        if (oc < 0.6) {
                          penalties += (0.6 - oc) * 35;
                          warnings.push(`Deficient Organic Matter (OC ${oc}%)`);
                          remedies.push("Incorporate green manure (dhanicha) or add Farmyard Manure (FYM) / Compost.");
                        }

                        // NPK Penalties
                        if (soilDiagN === 'Low') penalties += 10;
                        if (soilDiagP === 'Low') penalties += 10;
                        if (soilDiagK === 'Low') penalties += 10;

                        const score = Math.max(0, Math.round(100 - penalties));
                        let scoreColor = "text-emerald-600";
                        let statusText = "Optimal Soil Parameters";

                        if (score < 50) {
                          scoreColor = "text-rose-600";
                          statusText = "Highly Depleted / Degraded Soil";
                        } else if (score < 80) {
                          scoreColor = "text-amber-600";
                          statusText = "Moderate Nutritional Stress";
                        }

                        return (
                          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between text-left space-y-6">
                            <div className="space-y-4">
                              <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">Health Summary</h4>

                              <div className="flex items-center space-x-4 border-b border-gray-200/50 pb-4">
                                <div className="relative flex items-center justify-center shrink-0">
                                  <svg className="w-20 h-20 transform -rotate-90">
                                    <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                                    <circle cx="40" cy="40" r="34" stroke={score < 50 ? "#ef4444" : score < 80 ? "#f59e0b" : "#10b981"} strokeWidth="6" fill="transparent"
                                      strokeDasharray={213.6}
                                      strokeDashoffset={213.6 - (213.6 * score) / 100}
                                    />
                                  </svg>
                                  <span className="absolute text-base font-black text-gray-900">{score}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 font-bold block">{t('soilHealthScore')}</span>
                                  <span className={`text-sm font-black ${scoreColor} mt-0.5 block`}>{statusText}</span>
                                </div>
                              </div>

                              {/* Alarms and Prescriptions */}
                              <div className="space-y-3">
                                {warnings.length > 0 ? (
                                  <div className="space-y-2">
                                    <span className="text-[10px] text-rose-500 font-extrabold uppercase block font-medium">Deficiency Alerts</span>
                                    <div className="space-y-1">
                                      {warnings.map((w, wIdx) => (
                                        <div key={wIdx} className="p-2 bg-rose-50 border border-rose-100 text-[10px] font-black text-rose-800 rounded-lg flex items-center gap-1.5">
                                          <span>⚠️</span>
                                          <span>{w}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-emerald-800 font-black text-xs">
                                    ✔️ Soil chemistry parameters are perfectly optimal for cultivation!
                                  </div>
                                )}
                              </div>
                            </div>

                            {remedies.length > 0 && (
                              <div className="pt-2 border-t border-gray-200/50 space-y-2">
                                <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider block font-medium">{t('remediesAndPrescriptions')}</span>
                                <div className="space-y-1.5">
                                  {remedies.map((rem, rIdx) => (
                                    <div key={rIdx} className="text-[10px] text-gray-600 leading-relaxed font-semibold flex items-start gap-1">
                                      <span className="text-emerald-600 font-black shrink-0">•</span>
                                      <span>{rem}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: GROWTH & REVENUE PREDICTOR */}
                {toolsTab === 'predictor' && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md">
                    <div className="border-b border-gray-100 pb-3 mb-6">
                      <h3 className="font-extrabold text-lg text-gray-900 flex items-center">
                        <TrendingUp className="h-5 w-5 text-emerald-600 mr-2" />
                        {t('growthPredictorTitle')}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">Project harvest yields, estimated cultivation costs, and crop revenues over time.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Inputs */}
                      <div className="space-y-6 text-left">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('cropVariety')}</label>
                          <select
                            value={predCrop}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPredCrop(val);
                              if (CROP_PRESETS[val]) {
                                setPredExpectedPrice(CROP_PRESETS[val].defaultPrice.toString());
                                setPredWeeks(CROP_PRESETS[val].growthDuration.toString());
                              }
                            }}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-700"
                          >
                            {Object.keys(CROP_PRESETS).map((key) => (
                              <option key={key} value={key}>{CROP_PRESETS[key].name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('farmSizeAcres')}</label>
                          <input
                            type="number"
                            value={predAcres}
                            min="0.1"
                            step="0.1"
                            onChange={(e) => setPredAcres(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('expectedMarketPrice')}</label>
                            <input
                              type="number"
                              value={predExpectedPrice}
                              onChange={(e) => setPredExpectedPrice(e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('cultivationCostPerAcre')}</label>
                            <input
                              type="number"
                              value={predCultCost}
                              onChange={(e) => setPredCultCost(e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('projectedWeeks')}</label>
                          <input
                            type="range"
                            value={predWeeks}
                            min="4"
                            max="26"
                            onChange={(e) => setPredWeeks(e.target.value)}
                            className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-gray-400 font-black">
                            <span>4 Weeks</span>
                            <span className="text-emerald-700 font-extrabold">{predWeeks} Weeks</span>
                            <span>26 Weeks</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Projections */}
                      {(() => {
                        const acres = parseFloat(predAcres) || 0;
                        const price = parseFloat(predExpectedPrice) || 2000;
                        const cost = parseFloat(predCultCost) || 12000;
                        const w = parseFloat(predWeeks) || 12;
                        const preset = CROP_PRESETS[predCrop] || CROP_PRESETS.rice;

                        // Baselines per crop: rice: 22 qtl/ac, wheat: 18 qtl/ac, maize: 25 qtl/ac, cotton: 10 qtl/ac
                        const cropBaselines = { rice: 22, wheat: 18, maize: 25, cotton: 10 };
                        const base = cropBaselines[predCrop] || 20;

                        // Sigmoid growth curve over optimal weeks
                        const duration = preset.growthDuration;
                        const yieldPerAcre = base * (1 / (1 + Math.exp(-0.45 * (w - (duration / 2)))));

                        const totalYield = yieldPerAcre * acres;
                        const totalCost = cost * acres;
                        const grossRev = totalYield * price;
                        const profit = grossRev - totalCost;
                        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

                        return (
                          <div className="lg:col-span-2 space-y-6 text-left">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                                <span className="text-[10px] text-gray-400 font-bold block">{t('projectedHarvestYield')}</span>
                                <span className="text-base font-black text-gray-900 mt-1 block">{totalYield.toFixed(1)} <span className="text-xs font-semibold text-gray-500">Qtl</span></span>
                              </div>
                              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                                <span className="text-[10px] text-gray-400 font-bold block">{t('totalEstimatedCost')}</span>
                                <span className="text-base font-black text-gray-900 mt-1 block">₹{Math.round(totalCost).toLocaleString()}</span>
                              </div>
                              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                                <span className="text-[10px] text-gray-400 font-bold block">{t('projectedRevenue')}</span>
                                <span className="text-base font-black text-gray-900 mt-1 block">₹{Math.round(grossRev).toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className={`p-5 rounded-2xl border ${profit >= 0 ? 'bg-emerald-50/20 border-emerald-250/50 text-emerald-800 animate-pulse-subtle' : 'bg-rose-50/20 border-rose-250/50 text-rose-800'}`}>
                                <span className="text-[10px] font-black uppercase tracking-wider block">{t('netProjectedProfit')}</span>
                                <span className="text-2xl font-black mt-1.5 block">
                                  {profit >= 0 ? "" : "-"}₹{Math.abs(Math.round(profit)).toLocaleString()}
                                </span>
                              </div>
                              <div className={`p-5 rounded-2xl border ${profit >= 0 ? 'bg-emerald-50/20 border-emerald-250/50 text-emerald-800' : 'bg-rose-50/20 border-rose-250/50 text-rose-800'}`}>
                                <span className="text-[10px] font-black uppercase tracking-wider block">{t('estimatedRoi')}</span>
                                <span className="text-2xl font-black mt-1.5 block">
                                  {roi.toFixed(1)}%
                                </span>
                              </div>
                            </div>

                            {/* Growth Stage Progress Bar */}
                            <div className="p-5 border border-gray-200 rounded-2xl space-y-3.5 bg-slate-50/30">
                              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block font-medium">{t('cropGrowthTimeline')}</span>
                              
                              <div className="relative">
                                <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                                <div className="absolute top-0 h-2 bg-emerald-600 rounded-full transition-all duration-550" style={{ width: `${Math.min(100, (w / duration) * 100)}%` }}></div>
                              </div>

                              <div className="flex justify-between text-[9px] font-black text-gray-400">
                                <span className={w <= 4 ? "text-emerald-700 font-extrabold animate-pulse" : ""}>Vegetative (w. 1-4)</span>
                                <span className={w > 4 && w <= 8 ? "text-emerald-700 font-extrabold animate-pulse" : ""}>Flowering (w. 5-8)</span>
                                <span className={w > 8 && w <= 12 ? "text-emerald-700 font-extrabold animate-pulse" : ""}>Yield Form (w. 9-12)</span>
                                <span className={w > 12 ? "text-emerald-700 font-extrabold animate-pulse" : ""}>Harvest (w. {duration}+)</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. SOIL INFORMATION MODULE */}
            {activeTab === 'soil-info' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('soilProfilesTitle')}</h2>
                  <p className="text-sm text-gray-500 mt-1">Catalog of soil classifications, characteristics, pH ratings, and nutrient indexes.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Left Column: Soils List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search soil by name or attribute..."
                        value={soilSearchText}
                        onChange={(e) => setSoilSearchText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredSoils.map((soil) => (
                        <div
                          key={soil.id}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
                                <Database className="h-5 w-5 text-amber-700" />
                                <span>{soil.soil_name}</span>
                              </h3>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                pH: {soil.ph_range}
                              </span>
                            </div>

                            <div className="text-left">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">{t('characteristicsNutrients')}</span>
                              <p className="text-xs text-gray-600 leading-relaxed mt-1">{soil.characteristics}</p>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-3.5 text-left">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">{t('suitableCropsLabel')}</span>
                            <div className="flex flex-wrap gap-1">
                              {soil.suitable_crops && soil.suitable_crops.length > 0 ? (
                                soil.suitable_crops.map((c, idx) => (
                                  <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {c}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs italic">No Crops Associated</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredSoils.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                          No soil profiles match the search.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Soil Health Card Analyzer */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5 text-left animate-fade-in">
                      <div className="border-b border-gray-100 pb-3">
                        <h3 className="font-extrabold text-base text-gray-900 flex items-center">
                          <Activity className="h-5 w-5 text-amber-700 mr-2 animate-pulse" />
                          Soil Health Card Analyzer
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Get precise chemical fertilizer dosage and soil amendment suggestions.</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide block mb-1">Soil pH level ({soilAnalPh})</label>
                          <input
                            type="range"
                            min="3.5"
                            max="10.0"
                            step="0.1"
                            value={soilAnalPh}
                            onChange={(e) => setSoilAnalPh(e.target.value)}
                            className="w-full accent-amber-700 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase mt-1">
                            <span className="text-rose-600">Acidic (3.5)</span>
                            <span className="text-emerald-600">Neutral (7.0)</span>
                            <span className="text-amber-850">Alkaline (10.0)</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wide block mb-1">Nitrogen (N)</label>
                            <select
                              value={soilAnalN}
                              onChange={(e) => setSoilAnalN(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wide block mb-1">Phosphorus (P)</label>
                            <select
                              value={soilAnalP}
                              onChange={(e) => setSoilAnalP(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wide block mb-1">Potassium (K)</label>
                            <select
                              value={soilAnalK}
                              onChange={(e) => setSoilAnalK(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const recs = getSoilRecommendations();
                        return (
                          <div className="space-y-4 border-t border-gray-150 pt-4 text-xs">
                            <h4 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">{t('fertilizerDosage')}</h4>
                            <div className="grid grid-cols-3 gap-2 text-center font-bold">
                              <div className="bg-orange-50 border border-orange-100 rounded-xl p-2">
                                <span className="font-extrabold text-sm text-orange-850 block">{recs.urea} Bags</span>
                                <span className="text-[8px] text-orange-600/80 font-bold uppercase tracking-wider block mt-0.5">Urea (46% N)</span>
                              </div>
                              <div className="bg-sky-50 border border-sky-100 rounded-xl p-2">
                                <span className="font-extrabold text-sm text-sky-850 block">{recs.ssp} Bags</span>
                                <span className="text-[8px] text-sky-600/80 font-bold uppercase tracking-wider block mt-0.5">SSP (16% P)</span>
                              </div>
                              <div className="bg-purple-50 border border-purple-100 rounded-xl p-2">
                                <span className="font-extrabold text-sm text-purple-850 block">{recs.mop} Bags</span>
                                <span className="text-[8px] text-purple-600/80 font-bold uppercase tracking-wider block mt-0.5">MOP (60% K)</span>
                              </div>
                            </div>

                            <div className={`p-4 border rounded-xl space-y-1.5 ${recs.colorClass}`}>
                              <strong className="text-[10px] font-black uppercase tracking-wider block">Soil Amendment Advisory:</strong>
                              <p className="text-xs leading-relaxed">{recs.amendment}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CROP HEALTH HUB (DISEASES & CHEMICALS) */}
            {activeTab === 'disease-mgmt' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('cropHealthHubTitle')}</h2>
                  <p className="text-sm text-gray-500 mt-1">Identification logs, causative agents, organic prevention protocols, and chemical treatment guidelines.</p>
                </div>

                {/* Sub-tab selection */}
                <div className="flex space-x-2 bg-emerald-50/50 p-1.5 rounded-xl w-fit border border-emerald-100/40">
                  <button
                    onClick={() => setHealthSubTab('diseases')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${healthSubTab === 'diseases'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-800 hover:bg-emerald-100/40'
                      }`}
                  >
                    Disease Catalog
                  </button>
                  <button
                    onClick={() => setHealthSubTab('chemicals')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${healthSubTab === 'chemicals'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-800 hover:bg-emerald-100/40'
                      }`}
                  >
                    Chemical Advisories
                  </button>
                </div>

                {healthSubTab === 'diseases' && (
                  <div className="space-y-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by pathogen name, crop, or symptoms..."
                        value={diseaseSearchText}
                        onChange={(e) => setDiseaseSearchText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDiseases.map((d) => (
                        <div
                          key={d.id}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
                        >
                          <div>
                            {/* Title header */}
                            <div className="bg-gradient-to-r from-red-700 to-rose-900 text-white p-5">
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-800 text-red-200 border border-red-700">
                                Pathogen Host: {d.crop_name}
                              </span>
                              <h3 className="font-extrabold text-lg mt-2 leading-tight">{d.disease_name}</h3>
                              <p className="text-xs text-red-300 mt-0.5">Cause: {d.causes}</p>
                            </div>

                            <div className="p-5 space-y-4">
                              <div>
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">{t('observedSymptoms')}</span>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-3 leading-relaxed" title={d.symptoms}>
                                  {d.symptoms}
                                </p>
                              </div>

                              <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-lg">
                                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">{t('organicPrevention')}</span>
                                <p className="text-xs text-emerald-700 mt-1 line-clamp-2 leading-relaxed" title={d.prevention}>
                                  {d.prevention}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                              onClick={() => handleDiseaseClick(d.id)}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1"
                            >
                              <span>Chemical Advisory</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredDiseases.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                          No diseases cataloged matching that search.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {healthSubTab === 'chemicals' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900">Chemical & Pesticide Advisories</h3>
                        <p className="text-xs text-gray-500">Approved chemical names, application methodologies, safety equipment recommendations, and dosages.</p>
                      </div>
                      {/* Filter by Type */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs font-bold text-gray-500 uppercase">Chemical Type:</span>
                        <select
                          value={chemicalFilterType}
                          onChange={(e) => setChemicalFilterType(e.target.value)}
                          className="border border-gray-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="All">All Types</option>
                          <option value="Fungicide">Fungicide</option>
                          <option value="Insecticide">Insecticide</option>
                          <option value="Acaricide">Acaricide</option>
                          <option value="Bactericide">Bactericide</option>
                          <option value="Bio-Fungicide">Bio-Fungicide</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search chemical, target disease, or safety info..."
                        value={chemicalSearchText}
                        onChange={(e) => setChemicalSearchText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* List chemical cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredChemicals.map((chem) => (
                        <div
                          key={chem.id}
                          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-extrabold text-base text-gray-900 leading-tight">{chem.chemical_name}</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 inline-block mt-1">
                                  {chem.chemical_type}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-[9px] text-gray-400 uppercase block">Dosage</span>
                                <span className="text-emerald-700 font-extrabold text-sm">{chem.dosage}</span>
                              </div>
                            </div>

                            <div className="text-xs">
                              <span className="text-gray-400 font-bold block uppercase text-[9px]">Target Disease Host</span>
                              <span className="text-gray-800 font-semibold mt-0.5 block">{chem.disease_name} ({chem.crop_name})</span>
                            </div>

                            <div className="text-xs">
                              <span className="text-gray-400 font-bold block uppercase text-[9px]">Application Method</span>
                              <span className="text-gray-700 mt-0.5 block">{chem.application_method}</span>
                            </div>
                          </div>

                          <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-lg text-xs">
                            <span className="text-rose-800 font-bold flex items-center text-[10px] uppercase tracking-wide">
                              <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Safety Precautions
                            </span>
                            <p className="text-rose-700 mt-1 leading-relaxed">{chem.safety_precautions}</p>
                          </div>
                        </div>
                      ))}
                      {filteredChemicals.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                          No chemical recommendations matched the search filter.
                        </div>
                      )}
                    </div>
                  </div>
                )}



                {/* Disease details and chemicals modal */}
                {selectedDiseaseDetail && (
                  <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-900 text-white">
                        <div>
                          <h3 className="text-xl font-black">{selectedDiseaseDetail.disease_name}</h3>
                          <p className="text-xs text-red-300">Targeting Crop Host: {selectedDiseaseDetail.crop_name}</p>
                        </div>
                        <button
                          onClick={() => handleCloseDetail('disease')}
                          className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="space-y-1">
                          <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">Causative Organism/Pathogen</span>
                          <p className="text-gray-800 text-sm font-semibold">{selectedDiseaseDetail.causes}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">Symptoms & Identification</span>
                          <p className="text-gray-700 text-sm leading-relaxed">{selectedDiseaseDetail.symptoms}</p>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-1">
                          <span className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider block">Prevention & Cultural Management</span>
                          <p className="text-emerald-700 text-sm leading-relaxed">{selectedDiseaseDetail.prevention}</p>
                        </div>

                        <div className="border-t border-gray-100 pt-5">
                          <h4 className="font-extrabold text-sm text-gray-800 mb-3">Recommended Chemicals & Fungicides</h4>
                          <div className="space-y-4">
                            {selectedDiseaseDetail.chemicals && selectedDiseaseDetail.chemicals.length > 0 ? (
                              selectedDiseaseDetail.chemicals.map((chem) => (
                                <div key={chem.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-bold text-gray-900 text-base">{chem.chemical_name}</p>
                                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 inline-block mt-1">
                                        {chem.chemical_type}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-xs text-gray-400 uppercase block">Dosage</span>
                                      <span className="text-emerald-600 font-extrabold text-sm">{chem.dosage}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <strong className="text-gray-700 font-bold block">Application Protocol:</strong>
                                      <span className="text-gray-600 mt-0.5 block">{chem.application_method}</span>
                                    </div>
                                    <div>
                                      <strong className="text-rose-700 font-bold block flex items-center">
                                        <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Safety Precautions:
                                      </strong>
                                      <span className="text-gray-600 mt-0.5 block leading-relaxed">{chem.safety_precautions}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-xs italic">No chemical treatments loaded for this disease.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. CROP DISEASE FINDER */}
            {activeTab === 'disease-finder' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('diseaseFinderTitle')}</h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">Interactive advisory pipeline to diagnose crop issues and retrieve chemical recipes.</p>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-center space-x-2 py-4">
                  {[
                    { step: 1, label: 'Select State' },
                    { step: 2, label: 'Choose Crop' },
                    { step: 3, label: 'Identify Disease' },
                    { step: 4, label: 'View Advisory' }
                  ].map((s, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex items-center space-x-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${wizardStep === s.step
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : wizardStep > s.step
                              ? 'bg-emerald-800 text-emerald-100'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                          {wizardStep > s.step ? <Check className="h-4 w-4" /> : s.step}
                        </div>
                        <span className={`text-xs font-bold hidden sm:inline ${wizardStep === s.step ? 'text-gray-900 font-extrabold' : 'text-gray-400'}`}>
                          {s.label}
                        </span>
                      </div>
                      {idx < 3 && <div className={`h-0.5 w-8 sm:w-16 ${wizardStep > s.step ? 'bg-emerald-800' : 'bg-gray-200'}`}></div>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Wizard Steps Content */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md">
                  {/* STEP 1: SELECT STATE */}
                  {wizardStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center max-w-sm mx-auto space-y-2">
                        <h3 className="font-extrabold text-lg text-gray-900">{t('farmLocationQuestion')}</h3>
                        <p className="text-xs text-gray-500">Different regions have specialized crops and weather variations.</p>
                      </div>

                      <div className="max-w-md mx-auto space-y-4">
                        <select
                          value={wizardStateId}
                          onChange={(e) => setWizardStateId(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-gray-700"
                        >
                          <option value="">-- Click to choose State --</option>
                          {states.map(s => (
                            <option key={s.id} value={s.id}>{s.state_name}</option>
                          ))}
                        </select>

                        <button
                          disabled={!wizardStateId}
                          onClick={() => setWizardStep(2)}
                          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-1"
                        >
                          <span>Proceed to Crops</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SELECT CROP */}
                  {wizardStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="text-center max-w-sm mx-auto space-y-2">
                        <h3 className="font-extrabold text-lg text-gray-900">{t('cropCultivatingQuestion')}</h3>
                        <p className="text-xs text-gray-500">Only showing major crops grown in your selected state.</p>
                      </div>

                      <div className="max-w-md mx-auto space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
                          {wizardCrops.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setWizardCropId(c.id.toString())}
                              className={`p-4 rounded-xl border text-left font-bold text-sm transition-all ${wizardCropId === c.id.toString()
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                                  : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                              <span>{c.crop_name}</span>
                              <span className="text-[10px] text-gray-400 font-medium block italic mt-0.5">{c.scientific_name}</span>
                            </button>
                          ))}
                          {wizardCrops.length === 0 && (
                            <p className="text-center text-gray-400 text-xs col-span-full py-4 font-semibold">No crop mappings found for this state.</p>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => setWizardStep(1)}
                            className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50"
                          >
                            Back
                          </button>
                          <button
                            disabled={!wizardCropId}
                            onClick={() => setWizardStep(3)}
                            className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-1"
                          >
                            <span>Proceed to Diseases</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SELECT DISEASE */}
                  {wizardStep === 3 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="text-center max-w-sm mx-auto space-y-2">
                        <h3 className="font-extrabold text-lg text-gray-900">{t('selectObservedDisease')}</h3>
                        <p className="text-xs text-gray-500">Pick the symptoms that match the issues seen on your crops.</p>
                      </div>

                      <div className="max-w-xl mx-auto space-y-5">
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {wizardDiseases.map(d => (
                            <div
                              key={d.id}
                              onClick={() => setWizardDiseaseId(d.id.toString())}
                              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${wizardDiseaseId === d.id.toString()
                                  ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                                  : 'border-gray-200 hover:bg-gray-50 bg-white'
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-gray-900 text-sm">{d.disease_name}</h4>
                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${wizardDiseaseId === d.id.toString() ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                                  }`}>
                                  {wizardDiseaseId === d.id.toString() && <Check className="h-2.5 w-2.5" />}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                <strong className="font-bold text-gray-700">{t('symptomsLabel')}:</strong> {d.symptoms}
                              </p>
                            </div>
                          ))}
                          {wizardDiseases.length === 0 && (
                            <p className="text-center text-gray-400 text-xs py-4 font-semibold">No diseases mapped for this crop in our database.</p>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => setWizardStep(2)}
                            className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50"
                          >
                            Back
                          </button>
                          <button
                            disabled={!wizardDiseaseId}
                            onClick={() => {
                              setWizardStep(4);
                              const diseaseName = diseases.find(d => d.id === parseInt(wizardDiseaseId))?.disease_name || 'unknown disease';
                              const cropName = crops.find(c => c.id === parseInt(wizardCropId))?.crop_name || 'unknown crop';
                              logUserActivity('disease_viewed', `Used Wizard to find treatment for ${diseaseName} on ${cropName}`, { disease_id: wizardDiseaseId, crop_id: wizardCropId });
                            }}
                            className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-1"
                          >
                            <span>Generate Advisory</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: VIEW ADVISORY RESULTS */}
                  {wizardStep === 4 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="text-center space-y-1 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                        <h3 className="font-extrabold text-xl text-emerald-900 mt-2">{t('advisoryGeneratedSuccess')}</h3>
                        <p className="text-xs text-emerald-700">Here are your localized chemical treatment instructions.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Disease Summary */}
                          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identified Problem</h4>
                            <div>
                              <h5 className="font-black text-lg text-gray-900">
                                {diseases.find(d => d.id === parseInt(wizardDiseaseId))?.disease_name}
                              </h5>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Host Crop: {crops.find(c => c.id === parseInt(wizardCropId))?.crop_name}
                              </p>
                            </div>
                            <div className="text-xs space-y-2 text-gray-600 leading-relaxed">
                              <p><strong>Causative Agent:</strong> {diseases.find(d => d.id === parseInt(wizardDiseaseId))?.causes}</p>
                              <p><strong>{t('symptomsLabel')}:</strong> {diseases.find(d => d.id === parseInt(wizardDiseaseId))?.symptoms}</p>
                              <p><strong>Prevention:</strong> {diseases.find(d => d.id === parseInt(wizardDiseaseId))?.prevention}</p>
                            </div>
                          </div>

                          {/* Recommended Treatment */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recommended Remedies</h4>
                            {wizardChemicals && wizardChemicals.length > 0 ? (
                              wizardChemicals.map(chem => (
                                <div key={chem.id} className="border border-emerald-200 bg-white p-5 rounded-xl space-y-4 shadow-sm">
                                  <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
                                    <div>
                                      <h5 className="font-bold text-emerald-900 text-base">{chem.chemical_name}</h5>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 inline-block mt-1">
                                        {chem.chemical_type}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Recommended Dosage</span>
                                      <span className="text-emerald-600 font-extrabold text-sm">{chem.dosage}</span>
                                    </div>
                                  </div>

                                  <div className="text-xs space-y-3">
                                    <div>
                                      <strong className="text-gray-700 font-bold block">Application Protocol</strong>
                                      <p className="text-gray-600 mt-0.5">{chem.application_method}</p>
                                    </div>
                                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg">
                                      <strong className="text-rose-800 font-bold flex items-center">
                                        <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Protective Safety Rules
                                      </strong>
                                      <p className="text-rose-700 mt-1 leading-relaxed">{chem.safety_precautions}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center text-gray-500 text-xs italic">
                                No specific chemical product mapped. We suggest general cultural controls and field sanitization.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-center border-t border-gray-100 pt-5">
                          <button
                            onClick={resetWizard}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
                          >
                            Diagnose another crop
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 9. ADMIN PANEL MODULE */}
            {activeTab === 'admin-panel' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('adminPanelTitle')}</h2>
                    <p className="text-sm text-gray-500 mt-1">Add, update, or remove entries from the centralized advisory database.</p>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center space-x-3 self-start shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        setActiveTab('dashboard');
                      }}
                      className="border border-gray-200 text-gray-600 bg-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>Lock Panel</span>
                    </button>
                    <button
                      onClick={() => openAddModal(adminActiveSubTab)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5"
                    >
                      <Plus className="h-4.5 w-4.5" />
                      <span>Create new {adminActiveSubTab === 'news' ? 'news update' : adminActiveSubTab.slice(0, -1)}</span>
                    </button>
                  </div>
                </div>

                {/* Sub navigation for CRUD categories */}
                <div className="border-b border-gray-200 flex items-center space-x-2 overflow-x-auto pb-1.5">
                  {[
                    { id: 'states', label: 'States' },
                    { id: 'crops', label: 'Crops' },
                    { id: 'soils', label: 'Soils' },
                    { id: 'diseases', label: 'Diseases' },
                    { id: 'chemicals', label: 'Chemicals' },
                    { id: 'news', label: 'News Updates' }
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setAdminActiveSubTab(subTab.id)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg shrink-0 transition-all ${adminActiveSubTab === subTab.id
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      {subTab.label}
                    </button>
                  ))}
                </div>

                {/* Database Tables rendering */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-[500px]">
                    {adminActiveSubTab === 'states' && (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">State Name</th>
                            <th className="px-6 py-4">Climate</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {states.map((st) => (
                            <tr key={st.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-gray-900">{st.state_name}</td>
                              <td className="px-6 py-4">{st.climate}</td>
                              <td className="px-6 py-4 max-w-xs truncate" title={st.description}>{st.description}</td>
                              <td className="px-6 py-4 text-right space-x-3">
                                <button onClick={() => openEditModal('states', st)} className="text-blue-600 hover:text-blue-800 inline-block"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete('states', st.id)} className="text-red-600 hover:text-red-800 inline-block"><Trash2 className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {adminActiveSubTab === 'crops' && (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Crop Name</th>
                            <th className="px-6 py-4">Scientific Name</th>
                            <th className="px-6 py-4">Season</th>
                            <th className="px-6 py-4">{t('govtMsp')}</th>
                            <th className="px-6 py-4">State Location</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {crops.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-gray-900">{c.crop_name}</td>
                              <td className="px-6 py-4 italic text-gray-500">{c.scientific_name}</td>
                              <td className="px-6 py-4 uppercase text-xs">{c.season}</td>
                              <td className="px-6 py-4 text-emerald-700 font-bold text-xs">{c.msp || 'N/A'}</td>
                              <td className="px-6 py-4">{c.state_name}</td>
                              <td className="px-6 py-4 text-right space-x-3">
                                <button onClick={() => openEditModal('crops', c)} className="text-blue-600 hover:text-blue-800 inline-block"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete('crops', c.id)} className="text-red-600 hover:text-red-800 inline-block"><Trash2 className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {adminActiveSubTab === 'soils' && (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Soil Name</th>
                            <th className="px-6 py-4">pH range</th>
                            <th className="px-6 py-4">Characteristics</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {soils.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-gray-900">{s.soil_name}</td>
                              <td className="px-6 py-4 text-xs font-semibold">{s.ph_range}</td>
                              <td className="px-6 py-4 max-w-sm truncate" title={s.characteristics}>{s.characteristics}</td>
                              <td className="px-6 py-4 text-right space-x-3">
                                <button onClick={() => openEditModal('soils', s)} className="text-blue-600 hover:text-blue-800 inline-block"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete('soils', s.id)} className="text-red-600 hover:text-red-800 inline-block"><Trash2 className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {adminActiveSubTab === 'diseases' && (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Disease Name</th>
                            <th className="px-6 py-4">Affected Crop</th>
                            <th className="px-6 py-4">Causative organism</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {diseases.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-gray-900">{d.disease_name}</td>
                              <td className="px-6 py-4 font-semibold text-emerald-800">{d.crop_name}</td>
                              <td className="px-6 py-4">{d.causes}</td>
                              <td className="px-6 py-4 text-right space-x-3">
                                <button onClick={() => openEditModal('diseases', d)} className="text-blue-600 hover:text-blue-800 inline-block"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete('diseases', d.id)} className="text-red-600 hover:text-red-800 inline-block"><Trash2 className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {adminActiveSubTab === 'chemicals' && (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Chemical Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Target disease</th>
                            <th className="px-6 py-4">Dosage</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {chemicals.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-gray-900">{c.chemical_name}</td>
                              <td className="px-6 py-4 uppercase text-xs font-bold">{c.chemical_type}</td>
                              <td className="px-6 py-4">{c.disease_name}</td>
                              <td className="px-6 py-4 text-emerald-700 font-extrabold">{c.dosage}</td>
                              <td className="px-6 py-4 text-right space-x-3">
                                <button onClick={() => openEditModal('chemicals', c)} className="text-blue-600 hover:text-blue-800 inline-block"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete('chemicals', c.id)} className="text-red-600 hover:text-red-800 inline-block"><Trash2 className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {adminActiveSubTab === 'news' && (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Published Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {news.map((n) => (
                            <tr key={n.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-gray-900 truncate max-w-xs">{n.title}</td>
                              <td className="px-6 py-4 text-xs">
                                <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${n.category === 'Weather' ? 'bg-rose-50 text-rose-800' :
                                    n.category === 'Scheme' ? 'bg-emerald-50 text-emerald-800' :
                                      n.category === 'Market Trend' ? 'bg-blue-50 text-blue-800' :
                                        n.category === 'Technology' ? 'bg-purple-50 text-purple-800' :
                                          'bg-gray-100 text-gray-800'
                                  }`}>
                                  {n.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold">{n.source}</td>
                              <td className="px-6 py-4 text-xs font-semibold text-gray-500">{n.published_date}</td>
                              <td className="px-6 py-4 text-right space-x-3">
                                <button type="button" onClick={() => openEditModal('news', n)} className="text-blue-600 hover:text-blue-800 inline-block"><Edit2 className="h-4 w-4" /></button>
                                <button type="button" onClick={() => handleDelete('news', n.id)} className="text-red-600 hover:text-red-800 inline-block"><Trash2 className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* CRUD Form Modal */}
                {crudModalOpen && (
                  <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
                        <h3 className="text-lg font-black uppercase tracking-wide">
                          {crudMode === 'add' ? 'Create' : 'Modify'} {adminActiveSubTab === 'news' ? 'News Update' : adminActiveSubTab.slice(0, -1)}
                        </h3>
                        <button
                          onClick={() => setCrudModalOpen(false)}
                          className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <form onSubmit={handleCrudSubmit} className="p-6 space-y-4">
                        {crudError && (
                          <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 font-semibold flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1.5 shrink-0" />
                            <span>{crudError}</span>
                          </div>
                        )}

                        {/* STATES FORM */}
                        {adminActiveSubTab === 'states' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State Name</label>
                              <input
                                type="text"
                                value={stateForm.state_name}
                                onChange={(e) => setStateForm({ ...stateForm, state_name: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                placeholder="e.g. Haryana"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Climate</label>
                              <input
                                type="text"
                                value={stateForm.climate}
                                onChange={(e) => setStateForm({ ...stateForm, climate: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                placeholder="e.g. Humid Subtropical"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                              <textarea
                                value={stateForm.description}
                                onChange={(e) => setStateForm({ ...stateForm, description: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-24 resize-none"
                                placeholder="State agro overview..."
                              />
                            </div>
                          </div>
                        )}

                        {/* CROPS FORM */}
                        {adminActiveSubTab === 'crops' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Crop Name</label>
                                <input
                                  type="text"
                                  value={cropForm.crop_name}
                                  onChange={(e) => setCropForm({ ...cropForm, crop_name: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. Wheat"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Scientific Name</label>
                                <input
                                  type="text"
                                  value={cropForm.scientific_name}
                                  onChange={(e) => setCropForm({ ...cropForm, scientific_name: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. Triticum aestivum"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Season</label>
                                <select
                                  value={cropForm.season}
                                  onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                  <option value="Kharif">Kharif</option>
                                  <option value="Rabi">Rabi</option>
                                  <option value="Annual">Annual</option>
                                  <option value="Perennial">Perennial</option>
                                  <option value="Kharif/Rabi">Kharif/Rabi</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Water Requirement</label>
                                <select
                                  value={cropForm.water_requirement}
                                  onChange={(e) => setCropForm({ ...cropForm, water_requirement: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                  <option value="Very Low">Very Low</option>
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('expectedYield')}</label>
                                <input
                                  type="text"
                                  value={cropForm.yield}
                                  onChange={(e) => setCropForm({ ...cropForm, yield: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. 3.5 tons/hectare"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('govtSupportPriceMsp')}</label>
                                <input
                                  type="text"
                                  value={cropForm.msp}
                                  onChange={(e) => setCropForm({ ...cropForm, msp: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. ₹2,300 per quintal (or N/A)"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State Locations (Ctrl+Click to select multiple)</label>
                              <select
                                multiple
                                value={cropForm.state_ids || []}
                                onChange={(e) => {
                                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                  setCropForm({ ...cropForm, state_ids: values });
                                }}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-24"
                                required
                              >
                                {states.map(s => (
                                  <option key={s.id} value={s.id}>{s.state_name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Suitable Soil Types (Ctrl+Click to select multiple)</label>
                              <select
                                multiple
                                value={cropForm.soil_ids}
                                onChange={(e) => {
                                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                  setCropForm({ ...cropForm, soil_ids: values });
                                }}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-24"
                              >
                                {soils.map(s => (
                                  <option key={s.id} value={s.id}>{s.soil_name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {/* SOILS FORM */}
                        {adminActiveSubTab === 'soils' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Soil Name</label>
                                <input
                                  type="text"
                                  value={soilForm.soil_name}
                                  onChange={(e) => setSoilForm({ ...soilForm, soil_name: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. Alluvial Soil"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">pH Range</label>
                                <input
                                  type="text"
                                  value={soilForm.ph_range}
                                  onChange={(e) => setSoilForm({ ...soilForm, ph_range: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. 6.5 - 7.5"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Characteristics</label>
                              <textarea
                                value={soilForm.characteristics}
                                onChange={(e) => setSoilForm({ ...soilForm, characteristics: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-24 resize-none"
                                placeholder="Nutrient content and texture info..."
                              />
                            </div>
                          </div>
                        )}

                        {/* DISEASES FORM */}
                        {adminActiveSubTab === 'diseases' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Disease Name</label>
                                <input
                                  type="text"
                                  value={diseaseForm.disease_name}
                                  onChange={(e) => setDiseaseForm({ ...diseaseForm, disease_name: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. Rice Blast"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Host Crop</label>
                                <select
                                  value={diseaseForm.crop_id}
                                  onChange={(e) => setDiseaseForm({ ...diseaseForm, crop_id: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  required
                                >
                                  {crops.map(c => (
                                    <option key={c.id} value={c.id}>{c.crop_name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Causative Pathogen</label>
                              <input
                                type="text"
                                value={diseaseForm.causes}
                                onChange={(e) => setDiseaseForm({ ...diseaseForm, causes: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                placeholder="e.g. Fungus Magnaporthe oryzae"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Symptoms</label>
                              <textarea
                                value={diseaseForm.symptoms}
                                onChange={(e) => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-20 resize-none"
                                placeholder="Spindle-shaped brown leaf lesions..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prevention & Cultural management</label>
                              <textarea
                                value={diseaseForm.prevention}
                                onChange={(e) => setDiseaseForm({ ...diseaseForm, prevention: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-20 resize-none"
                                placeholder="Field sanitation, nitrogen regulation..."
                              />
                            </div>
                          </div>
                        )}

                        {/* CHEMICALS FORM */}
                        {adminActiveSubTab === 'chemicals' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chemical Name</label>
                                <input
                                  type="text"
                                  value={chemicalForm.chemical_name}
                                  onChange={(e) => setChemicalForm({ ...chemicalForm, chemical_name: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. Tricyclazole"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chemical Type</label>
                                <select
                                  value={chemicalForm.chemical_type}
                                  onChange={(e) => setChemicalForm({ ...chemicalForm, chemical_type: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                  <option value="Fungicide">Fungicide</option>
                                  <option value="Insecticide">Insecticide</option>
                                  <option value="Acaricide">Acaricide</option>
                                  <option value="Bactericide">Bactericide</option>
                                  <option value="Bio-Fungicide">Bio-Fungicide</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dosage</label>
                                <input
                                  type="text"
                                  value={chemicalForm.dosage}
                                  onChange={(e) => setChemicalForm({ ...chemicalForm, dosage: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. 0.6 g per litre"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Disease</label>
                                <select
                                  value={chemicalForm.disease_id}
                                  onChange={(e) => setChemicalForm({ ...chemicalForm, disease_id: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  required
                                >
                                  {diseases.map(d => (
                                    <option key={d.id} value={d.id}>{d.disease_name} ({d.crop_name})</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Application Method</label>
                              <input
                                type="text"
                                value={chemicalForm.application_method}
                                onChange={(e) => setChemicalForm({ ...chemicalForm, application_method: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                placeholder="e.g. Foliar Spray"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Safety precautions</label>
                              <textarea
                                value={chemicalForm.safety_precautions}
                                onChange={(e) => setChemicalForm({ ...chemicalForm, safety_precautions: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-20 resize-none"
                                placeholder="Wear rubber gloves and safety goggles..."
                              />
                            </div>
                          </div>
                        )}

                        {/* NEWS FORM */}
                        {adminActiveSubTab === 'news' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">News Title</label>
                              <input
                                type="text"
                                value={newsForm.title}
                                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                placeholder="e.g. Govt releases crop subsidy"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select
                                  value={newsForm.category}
                                  onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                  <option value="Scheme">Scheme</option>
                                  <option value="Weather">Weather</option>
                                  <option value="Market Trend">Market Trend</option>
                                  <option value="Technology">Technology</option>
                                  <option value="General">General</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Source</label>
                                <input
                                  type="text"
                                  value={newsForm.source}
                                  onChange={(e) => setNewsForm({ ...newsForm, source: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. Ministry of Agriculture"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cover Image URL</label>
                              <input
                                type="text"
                                value={newsForm.image_url}
                                onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                placeholder="e.g. https://images.unsplash.com/..."
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Article Content</label>
                              <textarea
                                value={newsForm.content}
                                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-32 resize-none"
                                placeholder="Write the news article text here..."
                                required
                              />
                            </div>
                          </div>
                        )}

                        <div className="border-t border-gray-100 pt-5 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setCrudModalOpen(false)}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm"
                          >
                            Save changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 10. FUTURE AI MODULE */}
            {activeTab === 'ai-detection' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center">
                    <Bot className="h-7 w-7 mr-2 text-emerald-600" /> AI Crop Disease Detector
                  </h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Upload a leaf photograph of the affected plant to automatically run computer vision diagnostics.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md space-y-6">
                  {geminiApiKeyMissing && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded max-w-md mx-auto shadow-sm">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-xs text-amber-800 leading-relaxed text-left">
                          <strong className="font-bold block text-sm mb-1 text-amber-900">Azure OpenAI Credentials Missing</strong>
                          Please add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">AZURE_OPENAI_KEY</code> and configuration parameters to your backend <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.env</code> file (or Render Environment Settings) and restart the server to enable real-time crop disease diagnosis.
                        </div>
                      </div>
                    </div>
                  )}

                  {aiError && (
                    <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded max-w-md mx-auto shadow-sm flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
                      <div className="flex-1 text-xs text-rose-800 leading-relaxed text-left">
                        <strong className="font-bold block text-sm mb-1 text-rose-900">Diagnostics Connection Error</strong>
                        {aiError}
                      </div>
                      <button onClick={() => setAiError('')} className="text-rose-400 hover:text-rose-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Crop Selection Selector */}
                  <div className="max-w-md mx-auto">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">
                      Select Crop Type (Recommended for accurate diagnosis)
                    </label>
                    <select
                      value={aiSelectedCropId}
                      onChange={(e) => setAiSelectedCropId(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                    >
                      <option value="">-- Auto-Detect (from Image Filename) --</option>
                      {crops.map(c => (
                        <option key={c.id} value={c.id}>{c.crop_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Upload Interface */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3.5 relative ${isDragging
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-inner'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                      }`}
                  >
                    {aiImagePreview ? (
                      <div className="relative max-w-xs rounded-lg overflow-hidden border shadow-inner">
                        <img src={aiImagePreview} alt="Crop Leaf Preview" className="max-h-56 object-cover" />
                        <button
                          onClick={() => { setAiImageFile(null); setAiImagePreview(null); setAiResult(null); setAiSelectedCropId(''); }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full shadow"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="p-3 bg-emerald-600/10 text-emerald-600 rounded-full inline-block">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{t('dragDropPhoto')}</p>
                          <p className="text-xs text-gray-400 mt-1">Accepts PNG, JPG, or JPEG (Max 5MB)</p>
                        </div>
                        <label className="inline-block px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold cursor-pointer transition-all">
                          Select from computer
                          <input type="file" accept="image/*" className="hidden" onChange={handleAiImageUpload} />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Diagnostic Trigger */}
                  {aiImageFile && !aiResult && (
                    <div className="text-center">
                      <button
                        onClick={runAiDiagnostics}
                        disabled={aiAnalyzing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow flex items-center space-x-2 mx-auto disabled:opacity-50"
                      >
                        {aiAnalyzing && <RefreshCw className="h-4.5 w-4.5 animate-spin" />}
                        <span>{aiAnalyzing ? 'Analyzing Leaf Image...' : 'Execute Diagnostics Model'}</span>
                      </button>
                    </div>
                  )}

                  {/* Diagnosis Progress Bar */}
                  {aiAnalyzing && (
                    <div className="space-y-3 max-w-sm mx-auto p-5 bg-white border border-gray-150 rounded-2xl shadow-sm animate-fade-in flex flex-col items-center">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 100 100" className="animate-sprout-grow">
                          <path d="M 20 82 Q 50 86 80 82" stroke="#78350f" strokeWidth="5" fill="none" strokeLinecap="round" />
                          <path d="M 50 80 Q 49 62 50 45" stroke="#10b981" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="40" strokeDashoffset="0" />
                          <path d="M 50 45 Q 36 38 40 32 Q 49 36 50 45" fill="#34d399" stroke="#059669" strokeWidth="1.5" />
                          <path d="M 50 45 Q 64 42 60 32 Q 51 38 50 45" fill="#34d399" stroke="#059669" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div className="w-full space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-gray-600">
                          <span>{aiProgressText}</span>
                          <span>{aiProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-emerald-600 transition-all duration-300" style={{ width: `${aiProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Diagnostic Results */}
                  {aiResult && (
                    <div className="border border-emerald-100 bg-emerald-50/20 p-6 rounded-2xl space-y-4 animate-fade-in">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-emerald-100/50 pb-3">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase">
                            Potential Infection Detected
                          </span>
                          <h4 className="font-extrabold text-lg text-emerald-950 mt-1.5">{aiResult.disease_name}</h4>
                          <p className="text-xs text-emerald-700 font-medium">Affecting crop: {aiResult.crop_name}</p>
                        </div>
                        <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-center shrink-0 border border-emerald-500/20 shadow-sm">
                          <span className="text-[10px] font-bold text-emerald-200 block uppercase">Confidence Index</span>
                          <span className="text-lg font-black">{aiResult.confidence}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <strong className="text-emerald-950 font-bold block">Typical {t('symptomsLabel')}:</strong>
                          <p className="text-emerald-800 mt-1 leading-relaxed">{aiResult.symptoms}</p>
                        </div>
                        <div>
                          <strong className="text-emerald-950 font-bold block">Cultural Prevention:</strong>
                          <p className="text-emerald-800 mt-1 leading-relaxed">{aiResult.prevention}</p>
                        </div>
                      </div>

                      {/* Chemical linking */}
                      <div className="bg-white border border-emerald-100 rounded-xl p-4 mt-4 space-y-3 shadow-sm">
                        <h5 className="font-bold text-emerald-900 text-xs uppercase tracking-wide">Target Chemical Prescription</h5>
                        <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-2">
                          <div>
                            <strong className="text-gray-900 block text-sm">{aiResult.recommended_chemical}</strong>
                            <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-1">Fungicide / Treatment</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Dosage</span>
                            <span className="text-emerald-600 font-black text-sm">{aiResult.dosage}</span>
                          </div>
                        </div>
                        <div className="text-xs">
                          <strong className="text-gray-700 font-bold block">Application Protocol:</strong>
                          <span className="text-gray-600 mt-0.5 block">{aiResult.application_method}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* 10. SMART CULTIVATION SCHEDULER */}
            {activeTab === 'smart-scheduler' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{t('aiSchedulerTitle')}</h2>
                  <p className="text-sm text-gray-500 mt-1">Get custom cultivation steps, watering timelines, and fertilizer schedules generated in real-time by AI.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Left Side: Advisor Form */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
                      <Sliders className="h-5 w-5 text-emerald-600" />
                      <span>Farm Configuration</span>
                    </h3>

                    <form onSubmit={handleSchedulerSubmit} className="space-y-4">
                      {/* State Location */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State / Location</label>
                        <select
                          value={schedulerForm.state_name}
                          onChange={(e) => setSchedulerForm({ ...schedulerForm, state_name: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                          required
                        >
                          <option value="">-- Select Location --</option>
                          {states.map(s => (
                            <option key={s.id} value={s.state_name}>{s.state_name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Soil Type */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Soil Type</label>
                        <select
                          value={schedulerForm.soil_type}
                          onChange={(e) => setSchedulerForm({ ...schedulerForm, soil_type: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                          required
                        >
                          <option value="">-- Select Soil Type --</option>
                          {soils.map(s => (
                            <option key={s.id} value={s.soil_name}>{s.soil_name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Crop Type */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Crop</label>
                        <select
                          value={schedulerForm.crop_type}
                          onChange={(e) => setSchedulerForm({ ...schedulerForm, crop_type: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                          required
                        >
                          <option value="">-- Select Target Crop --</option>
                          {crops.map(c => (
                            <option key={c.id} value={c.crop_name}>{c.crop_name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Farm Size */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Acres</label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={schedulerForm.acres}
                            onChange={(e) => setSchedulerForm({ ...schedulerForm, acres: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Irrigation Type</label>
                          <select
                            value={schedulerForm.irrigation_type}
                            onChange={(e) => setSchedulerForm({ ...schedulerForm, irrigation_type: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            required
                          >
                            <option value="Drip Irrigation">Drip Irrigation</option>
                            <option value="Sprinkler">Sprinkler</option>
                            <option value="Flood Irrigation">Flood Irrigation</option>
                            <option value="Rainfed">Rainfed (No Irrigation)</option>
                          </select>
                        </div>
                      </div>

                      {/* Previous Crop */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Previous Crop Grown</label>
                        <input
                          type="text"
                          value={schedulerForm.previous_crop}
                          onChange={(e) => setSchedulerForm({ ...schedulerForm, previous_crop: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                          placeholder="e.g. Mustard / Fallow"
                        />
                      </div>

                      {/* Yield Targets */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Previous Yield (Quintals)</label>
                          <input
                            type="text"
                            value={schedulerForm.previous_yield}
                            onChange={(e) => setSchedulerForm({ ...schedulerForm, previous_yield: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            placeholder="e.g. 15"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('expectedYield')} (Quintals)</label>
                          <input
                            type="text"
                            value={schedulerForm.expected_yield}
                            onChange={(e) => setSchedulerForm({ ...schedulerForm, expected_yield: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            placeholder="e.g. 20"
                          />
                        </div>
                      </div>

                      {schedulerError && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 font-semibold flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1.5 shrink-0" />
                          <span>{schedulerError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={schedulerLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {schedulerLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                        <span>{schedulerLoading ? 'Generating Advisory...' : 'Generate AI Cultivation Plan'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Right Side: Output Results */}
                  <div className="lg:col-span-2 space-y-6">
                    {schedulerLoading ? (
                      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[400px] animate-sprout-grow">
                        <div className="flex flex-col items-center justify-center mb-2">
                          <svg width="90" height="90" viewBox="0 0 100 100">
                            {/* Soil mound */}
                            <path d="M 20 82 Q 50 86 80 82" stroke="#78350f" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                            {/* Split seed */}
                            <path d="M 46 80 Q 48 70 51 80" fill="#b45309" stroke="#78350f" strokeWidth="1" className="animate-seed-split" />
                            <path d="M 49 80 Q 52 70 54 80" fill="#b45309" stroke="#78350f" strokeWidth="1" className="animate-seed-split" />
                            {/* Emerging stem */}
                            <path d="M 50 80 Q 49 60 50 42" stroke="#10b981" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeDasharray="40" strokeDashoffset="40" className="animate-stem-rise" />
                            {/* First leaf */}
                            <path d="M 50 42 Q 34 33 39 27 Q 49 32 50 42" fill="#34d399" stroke="#059669" strokeWidth="1.5" className="animate-leaf-left" opacity="0" />
                            {/* Second leaf */}
                            <path d="M 50 42 Q 66 38 61 27 Q 51 34 50 42" fill="#34d399" stroke="#059669" strokeWidth="1.5" className="animate-leaf-right" opacity="0" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-bold text-base mt-2">Analysing Farm Chemistry & Rotation Cycle...</p>
                        <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                          Cerevyn Research AI is calculating exact nitrogen-phosphorus ratios, water requirements, and organic cultivation dates for your farm.
                        </p>
                      </div>
                    ) : schedulerResult ? (
                      <div className="space-y-6">
                        {/* Target Yield Feasibility */}
                        {schedulerResult.target_yield_feasibility && (
                          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-2.5">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center">
                              <TrendingUp className="h-4.5 w-4.5 text-emerald-600 mr-1.5" />
                              <span>Target Yield Feasibility</span>
                            </h4>
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500">Status</span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  {schedulerResult.target_yield_feasibility.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed mt-2.5">
                                {schedulerResult.target_yield_feasibility.analysis}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
                            <h3 className="font-extrabold text-base text-gray-900">
                              Cultivation Timeline for {schedulerForm.acres} Acres of {schedulerForm.crop_type}
                            </h3>
                            <button
                              onClick={downloadSchedulerPdf}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 border border-emerald-200 rounded-lg px-2.5 py-1.5 bg-emerald-50/40 hover:bg-emerald-50 transition-colors shadow-sm select-none"
                            >
                              <FileText className="h-3.5 w-3.5 animate-pulse" />
                              <span>Download PDF</span>
                            </button>
                          </div>

                          {/* Vertical Timeline */}
                          <div className="relative border-l-2 border-emerald-100 ml-4 space-y-8 pb-4">
                            {schedulerResult.crop_schedule && schedulerResult.crop_schedule.map((item, idx) => (
                              <div key={idx} className="relative pl-6">
                                {/* Dot indicator */}
                                <div className="absolute -left-[9px] top-1 bg-emerald-600 border-4 border-emerald-50 h-5.5 w-5.5 rounded-full flex items-center justify-center shadow">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <h4 className="font-extrabold text-emerald-900 text-base">{item.phase}</h4>
                                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded border border-emerald-200/50 w-fit">
                                      {item.timeline}
                                    </span>
                                  </div>

                                  {/* Activities list */}
                                  <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1 mt-2">
                                    {item.activities && item.activities.map((act, aIdx) => (
                                      <li key={aIdx}>{act}</li>
                                    ))}
                                  </ul>

                                  {/* Advice details */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-50 text-xs">
                                    {item.irrigation_advice && (
                                      <div className="bg-blue-50/50 border border-blue-100/30 p-2.5 rounded-lg">
                                        <strong className="text-blue-900 font-bold block mb-0.5">{t('waterManagement')}</strong>
                                        <span className="text-blue-700">{item.irrigation_advice}</span>
                                      </div>
                                    )}
                                    {item.fertilizer_dosage && (
                                      <div className="bg-purple-50/50 border border-purple-100/30 p-2.5 rounded-lg">
                                        <strong className="text-purple-900 font-bold block mb-0.5">{t('npkFertilizer')}</strong>
                                        <span className="text-purple-700">{item.fertilizer_dosage}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Suggestions Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Soil/Fertilizer Tips */}
                          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center">
                              <Database className="h-4.5 w-4.5 text-amber-700 mr-1.5" />
                              <span>{t('soilFertilizerTips')}</span>
                            </h4>
                            <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1.5">
                              {schedulerResult.soil_and_fertilizer_tips && schedulerResult.soil_and_fertilizer_tips.map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                              ))}
                            </ul>
                          </div>

                          {/* General Suggestions */}
                          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center">
                              <Sparkles className="h-4.5 w-4.5 text-emerald-600 mr-1.5" />
                              <span>{t('generalSuggestions')}</span>
                            </h4>
                            <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1.5">
                              {schedulerResult.general_suggestions && schedulerResult.general_suggestions.map((sug, idx) => (
                                <li key={idx}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Warnings banner */}
                        {schedulerResult.warnings && schedulerResult.warnings.length > 0 && (
                          <div className="bg-rose-50 border border-rose-100 p-5 rounded-xl space-y-3 shadow-inner">
                            <h4 className="font-bold text-rose-900 text-sm flex items-center">
                              <ShieldAlert className="h-4.5 w-4.5 text-rose-700 mr-1.5" />
                              <span>{t('potentialRisks')}</span>
                            </h4>
                            <ul className="list-disc pl-4 text-xs text-rose-700 space-y-1.5">
                              {schedulerResult.warnings.map((warn, idx) => (
                                <li key={idx}>{warn}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                        <FileText className="h-12 w-12 text-gray-200 mb-3" />
                        <h4 className="font-bold text-gray-700 text-base">{t('planOutputPanel')}</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs">
                          {t('planOutputDesc')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


          </main>
        )}

        {/* News detail modal */}
        {(() => {
          const activeNews = selectedNewsDetail ? (news.find(n => n.id === selectedNewsDetail.id) || selectedNewsDetail) : null;
          return activeNews && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 flex items-center justify-center p-4 text-left">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Banner header with image */}
                <div className="h-48 relative shrink-0">
                  <img
                    src={activeNews.image_url || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800"}
                    alt={activeNews.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end p-6 text-white">
                    <span className={`w-fit text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 ${activeNews.category === 'Weather' ? 'bg-rose-500 text-white' :
                        activeNews.category === 'Scheme' ? 'bg-emerald-500 text-white' :
                          activeNews.category === 'Market Trend' ? 'bg-blue-500 text-white' :
                            activeNews.category === 'Technology' ? 'bg-purple-500 text-white' :
                              'bg-gray-50 text-white'
                      }`}>
                      {activeNews.category}
                    </span>
                    <h3 className="text-lg md:text-xl font-extrabold leading-snug">{activeNews.title}</h3>
                  </div>
                  <button
                    onClick={() => handleCloseDetail('news')}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-semibold border-b border-gray-100 pb-3">
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">Source:</span>
                      <span className="text-emerald-700 font-extrabold">{activeNews.source || 'Official Source'}</span>
                    </span>
                    <span>Published: {activeNews.published_date}</span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                      {activeNews.content}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 border-t border-gray-100 mt-auto bg-gray-50/50 flex justify-end">
                  <button
                    onClick={() => handleCloseDetail('news')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm"
                  >
                    Close Bulletin
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Admin Password Prompt Modal */}
        {adminPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-fade-in">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
                <h3 className="text-base font-black uppercase tracking-wide">{t('adminAccessRequired')}</h3>
                <button
                  onClick={() => handleCloseDetail('adminPassword')}
                  className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAdminPasswordSubmit} className="p-6 space-y-4">
                {adminPasswordError && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 font-semibold flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1.5 shrink-0" />
                    <span>{adminPasswordError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('enterAdminPassword')}</label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-semibold"
                    placeholder="••••••••"
                    required
                    autoFocus
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => handleCloseDetail('adminPassword')}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm"
                  >
                    {t('authenticate')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating Chatbot FAB & Window */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* Chat Window Container */}
          {chatbotOpen && (
            <div className="flex items-end space-x-3.5 mb-4 animate-slide-up-fade">
              {/* Mascot Side Pop-out (Desktop only) */}
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-2xl border border-emerald-800/80 shadow-2xl p-4 w-[160px] h-[440px] flex flex-col justify-between relative overflow-hidden shrink-0 hidden md:flex border-l-4 border-l-emerald-500">
                {/* Background decorative sprout detail */}
                <div className="absolute -right-6 -bottom-6 text-emerald-850/10 transform rotate-12 pointer-events-none">
                  <Sprout className="h-28 w-28" />
                </div>

                <div className="text-center relative z-20 space-y-1">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isSpeaking ? 'bg-emerald-500/25 text-emerald-350 border border-emerald-500/40 animate-pulse' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'}`}>
                    {isSpeaking ? 'Speaking...' : 'Companion'}
                  </span>
                </div>

                {/* SVG Animated Young Lady Advisor - Fills the vertical space */}
                <div className="absolute inset-0 top-10 bottom-0 w-full flex items-end justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 160 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Glow behind */}
                    <circle cx="80" cy="110" r="70" fill="url(#ladyGlow)" />

                    {/* Left arm resting at side */}
                    <path d="M32 170 C 22 200, 18 240, 22 320" stroke="#0d9488" strokeWidth="16" strokeLinecap="round" />
                    <path d="M32 170 C 22 200, 18 240, 22 320" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" fill="none" />

                    {/* Lady Body (Kurti / Top) */}
                    <path d="M30 320 L 30 170 C 30 150, 45 142, 80 142 C 115 142, 130 150, 130 170 L 130 320 Z" fill="#0d9488" stroke="#0f766e" strokeWidth="1.5" />
                    
                    {/* Nehru Collar */}
                    <path d="M68 142 C 72 135, 88 135, 92 142 L 85 158 L 75 158 Z" fill="#0f766e" />
                    <path d="M68 142 C 72 135, 88 135, 92 142" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
                    
                    {/* Golden central stripe with buttons */}
                    <path d="M80 158 L 80 240" stroke="#fbbf24" strokeWidth="2" />
                    <circle cx="80" cy="175" r="2" fill="#ffffff" />
                    <circle cx="80" cy="195" r="2" fill="#ffffff" />
                    <circle cx="80" cy="215" r="2" fill="#ffffff" />

                    {/* Neck */}
                    <path d="M72 124 L 72 145 L 88 145 L 88 124 Z" fill="#f5b078" />
                    <path d="M72 134 L 88 134" stroke="#d97706" strokeWidth="1" opacity="0.3" />

                    {/* Head Group (bobs when speaking) */}
                    <g className={isSpeaking ? "farmer-head-talking" : ""} style={{ transformOrigin: '80px 105px' }}>
                      {/* Hair Bun / Back Hair ponytail */}
                      <path d="M102 92 C 118 90, 128 102, 125 120 C 118 115, 114 105, 102 98" fill="#1e293b" />
                      <circle cx="102" cy="95" r="3" fill="#f43f5e" />

                      {/* Face */}
                      <ellipse cx="80" cy="105" rx="24" ry="26" fill="#fed7aa" stroke="#d97706" strokeWidth="1.5" />

                      {/* Hair Front details */}
                      <path d="M56 100 C 58 85, 75 88, 80 95 C 75 92, 60 92, 58 108" fill="#1e293b" />
                      <path d="M104 100 C 102 85, 85 88, 80 95 C 85 92, 100 92, 102 108" fill="#1e293b" />

                      {/* Headset headband */}
                      <path d="M59 90 C 65 72, 95 72, 101 90" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <rect x="52" y="88" width="7" height="15" rx="3" fill="#334155" />
                      <rect x="101" y="88" width="7" height="15" rx="3" fill="#334155" />
                      
                      {/* Microphone boom */}
                      <path d="M55 103 C 55 116, 68 118, 73 116" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <circle cx="74" cy="116" r="2" fill="#10b981" />

                      {/* Eyes with eyelashes */}
                      <path d="M66 102 C 69 99, 75 99, 78 102" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <circle cx="72" cy="105" r="2.5" fill="#1e293b" />
                      <circle cx="73" cy="104" r="0.8" fill="#ffffff" />
                      
                      <path d="M94 102 C 91 99, 85 99, 82 102" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <circle cx="88" cy="105" r="2.5" fill="#1e293b" />
                      <circle cx="89" cy="104" r="0.8" fill="#ffffff" />

                      {/* Eyebrows */}
                      <path d="M65 97 C 69 94, 75 95, 76 96" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      <path d="M95 97 C 91 94, 85 95, 84 96" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                      {/* Blushing cheeks */}
                      <circle cx="64" cy="112" r="3.5" fill="#f87171" opacity="0.3" />
                      <circle cx="96" cy="112" r="3.5" fill="#f87171" opacity="0.3" />

                      {/* Smiling Mouth or Open/Flapping Mouth */}
                      {isSpeaking ? (
                        <g>
                          <ellipse cx="80" cy="120" rx="4.5" ry="4" fill="#991b1b" />
                          <ellipse cx="80" cy="122" rx="3" ry="1.5" fill="#fda4af" />
                        </g>
                      ) : (
                        <path d="M74 118 C 76 122, 84 122, 86 118" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
                      )}
                    </g>

                    {/* Waving Hand & Arm */}
                    <g className={isSpeaking ? "farmer-hand-talking" : "farmer-hand-wave"} style={{ transformOrigin: '125px 170px' }}>
                      <path d="M125 170 C 140 165, 148 150, 150 135" stroke="#0d9488" strokeWidth="12" strokeLinecap="round" />
                      <path d="M125 170 C 140 165, 148 150, 150 135" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <path d="M150 135 L 152 125" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="152" cy="122" r="5" fill="#fed7aa" />
                      <path d="M148 120 L 146 110" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M152 118 L 152 108" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M156 119 L 158 109" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M159 122 L 163 113" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    <defs>
                      <radialGradient id="ladyGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>

                {/* Floating overlay text box at the very bottom */}
                <div className="relative z-20 w-full bg-emerald-950/85 backdrop-blur-md border border-emerald-800/60 rounded-xl p-2 text-center shadow-md">
                  <p className="text-[10px] font-black text-white leading-tight">Agri Companion</p>
                  <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                    {isSpeaking ? 'Speaking...' : 'Ready to Help'}
                  </p>
                </div>
              </div>

              {/* Chat Window */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col w-[350px] sm:w-[380px] h-[480px] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 bg-emerald-950 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="p-0.5 bg-emerald-900 rounded-lg text-emerald-350 w-8 h-8 flex items-center justify-center overflow-hidden shrink-0 border border-emerald-800">
                        {/* Mini Animated Face */}
                        <svg className={`w-full h-full ${isSpeaking ? 'animate-bounce' : ''}`} viewBox="50 70 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Hair ponytail at back */}
                          <path d="M102 92 C 118 90, 128 102, 125 120" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                          {/* Face */}
                          <ellipse cx="80" cy="105" rx="24" ry="26" fill="#fed7aa" stroke="#d97706" strokeWidth="1.5" />
                          {/* Hair Front details */}
                          <path d="M56 100 C 58 85, 75 88, 80 95 C 75 92, 60 92, 58 108" fill="#1e293b" />
                          <path d="M104 100 C 102 85, 85 88, 80 95 C 85 92, 100 92, 102 108" fill="#1e293b" />
                          {/* Headset */}
                          <rect x="52" y="88" width="7" height="15" rx="3" fill="#334155" />
                          <rect x="101" y="88" width="7" height="15" rx="3" fill="#334155" />
                          {/* Eyes */}
                          <circle cx="72" cy="105" r="2.5" fill="#1e293b" />
                          <circle cx="88" cy="105" r="2.5" fill="#1e293b" />
                          {/* Mouth */}
                          {isSpeaking ? (
                            <ellipse cx="80" cy="120" rx="4.5" ry="4" fill="#991b1b" />
                          ) : (
                            <path d="M74 118 C 76 122, 84 122, 86 118" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
                          )}
                        </svg>
                      </div>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-emerald-950"></span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs leading-none">CropCare AI</h3>
                      <span className="text-[9px] text-emerald-300 font-medium">{t('agriculturalAdvisor')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCloseDetail('chatbot')}
                    className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Error notifications */}
                {geminiApiKeyMissing && (
                  <div className="bg-amber-50 border-b border-amber-200 p-2.5 shrink-0 text-left">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <div className="text-[9px] text-amber-800 leading-normal">
                        <strong className="font-bold">Azure OpenAI Missing:</strong> Add keys to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> & restart.
                      </div>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="bg-rose-50 border-b border-rose-200 p-2.5 shrink-0 flex items-start justify-between gap-2 text-left">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
                      <div className="text-[9px] text-rose-800 leading-normal">{chatError}</div>
                    </div>
                    <button onClick={() => setChatError('')} className="text-rose-400 hover:text-rose-600 shrink-0">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Language & Voice Controls Header */}
                <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Lang:</span>
                    <select
                      value={voiceLanguage}
                      onChange={(e) => {
                        const newVoiceLang = e.target.value;
                        setVoiceLanguage(newVoiceLang);
                        stopSpeaking();
                        // Also sync i18n language
                        const i18nLangMap = { 'en-IN': 'en', 'hi-IN': 'hi', 'te-IN': 'te', 'mr-IN': 'mr' };
                        i18n.changeLanguage(i18nLangMap[newVoiceLang] || 'en');
                      }}
                      className="border border-gray-200 rounded px-1 py-0.5 text-[9px] font-bold bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="en-IN">English</option>
                      <option value="hi-IN">हिन्दी</option>
                      <option value="te-IN">తెలుగు</option>
                      <option value="mr-IN">मराठी</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSpeak}
                      onChange={(e) => {
                        setAutoSpeak(e.target.checked);
                        if (!e.target.checked) stopSpeaking();
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-3 w-3 border-gray-300"
                    />
                    <span className="text-[8px] font-bold text-gray-500 uppercase">Auto-Speak</span>
                  </label>
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-gray-50/20 text-left">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed shadow-sm relative group ${msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                          }`}
                      >
                        <div className="font-bold text-[8px] opacity-60 mb-0.5 flex items-center justify-between">
                          <span>{msg.role === 'user' ? 'YOU' : 'CROPCARE AI'}</span>
                          {msg.role !== 'user' && (
                            <button
                              onClick={() => {
                                if (isSpeaking) {
                                  stopSpeaking();
                                } else {
                                  speakText(msg.parts[0], detectLanguage(msg.parts[0]));
                                }
                              }}
                              className="ml-3 text-emerald-600 hover:text-emerald-800 transition-colors focus:outline-none"
                              title={isSpeaking ? "Stop Voice Playback" : "Speak Message"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                {isSpeaking ? (
                                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="currentColor"></rect>
                                ) : (
                                  <>
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                  </>
                                )}
                              </svg>
                            </button>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.parts[0]}</p>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start animate-pulse">
                      <div className="bg-white text-gray-400 border border-gray-150 px-3 py-2 rounded-xl rounded-tl-none text-[9px] font-semibold flex items-center space-x-1 shadow-sm">
                        <RefreshCw className="h-2.5 w-2.5 animate-spin text-emerald-600" />
                        <span>{t('thinking')}</span>
                      </div>
                    </div>
                  )}

                  {/* Speech listening visual wave */}
                  {isListening && (
                    <div className="flex justify-start items-center space-x-1.5 p-2 bg-rose-50 border border-rose-100 rounded-lg max-w-[150px] animate-pulse">
                      <div className="flex items-center space-x-0.5">
                        <span className="w-0.5 h-2.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-0.5 h-3.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-0.5 h-2.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      </div>
                      <span className="text-[9px] font-semibold text-rose-800">
                        {t('listening')}
                      </span>
                    </div>
                  )}

                  {/* Speech speaking visual wave */}
                  {isSpeaking && (
                    <div className="flex justify-start items-center space-x-1.5 p-2 bg-blue-50 border border-blue-100 rounded-lg max-w-[180px] animate-pulse">
                      <div className="flex items-center space-x-0.5">
                        <span className="w-0.5 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-0.5 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-0.5 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      </div>
                      <span className="text-[9px] font-semibold text-blue-800">{t('speaking')}</span>
                      <button onClick={stopSpeaking} className="text-blue-500 hover:text-blue-700 text-[7px] font-extrabold border border-blue-200 px-1 py-0.5 rounded bg-white shrink-0 ml-auto">{t('stop')}</button>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleChatSubmit} className="p-2.5 border-t border-gray-150 bg-gray-50 flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={isListening ? () => { } : startSpeechRecognition}
                    className={`p-2 rounded-xl border transition-all shrink-0 ${isListening
                        ? 'bg-rose-100 border-rose-300 text-rose-600 animate-pulse'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    title={t('speakQuestion')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" x2="12" y1="19" y2="22"></line>
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatLoading}
                    placeholder={t('askCropCareAi')}
                    className="flex-1 border border-gray-250 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-md shrink-0 text-xs"
                  >
                    {t('send')}
                  </button>
                </form>
              </div>
            </div>
          )}

              {/* Small round icon button */}
              <button
                onClick={() => chatbotOpen ? handleCloseDetail('chatbot') : setChatbotOpen(true)}
                className={`h-12 w-12 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-350 hover:scale-105 active:scale-95 cursor-pointer relative z-50 ${chatbotOpen
                    ? 'bg-emerald-850 hover:bg-emerald-900 border border-emerald-800 animate-pulse-subtle'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/20 hover:shadow-xl'
                  }`}
                title="Chat with CropCare AI"
              >
                {chatbotOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 animate-pulse-subtle" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white text-[7px] text-white font-black items-center justify-center">AI</span>
                    </span>
                  </>
                )}
              </button>
            </div>
      </div>

        {/* ── Idle Session Warning Modal ─────────────────────────── */}
        {idleWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up-fade">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
                    ⏱️
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight">Session Expiring Soon</h3>
                    <p className="text-orange-100 text-xs font-semibold mt-0.5">You've been inactive for 14 minutes</p>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="px-6 py-6 text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fed7aa" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="#f97316" strokeWidth="2.5"
                      strokeDasharray={`${(idleCountdown / 60) * 100} 100`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 1s linear' }}
                    />
                  </svg>
                  <span className="absolute font-black text-2xl text-orange-600">{idleCountdown}</span>
                </div>
                <p className="text-gray-600 text-sm font-medium leading-relaxed">
                  You will be <strong className="text-gray-800">automatically signed out</strong> in{' '}
                  <span className="text-orange-600 font-black">{idleCountdown} second{idleCountdown !== 1 ? 's' : ''}</span>{' '}
                  to keep your account secure.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
                  id="idle-signout-btn"
                >
                  Sign Out Now
                </button>
                <button
                  onClick={resetIdleTimer}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-md hover:shadow-lg transition-all"
                  id="idle-stay-btn"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Panel */}
        {profileOpen && (
          <UserProfile
            user={currentUser}
            onSignOut={handleSignOut}
            onClose={() => handleCloseDetail('profile')}
          />
        )}
      </div>
      );
}
