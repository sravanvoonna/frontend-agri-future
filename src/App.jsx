import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:5000/api'
  : 'https://agri-future-backend.onrender.com/api';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // 2. Crop Information Module
  const [cropFilterSeason, setCropFilterSeason] = useState('All');
  const [cropSearchText, setCropSearchText] = useState('');
  const [selectedCropDetail, setSelectedCropDetail] = useState(null);

  // 2b. Govt MSP Support Module
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
    previous_yield: ''
  });
  const [schedulerResult, setSchedulerResult] = useState(null);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [schedulerError, setSchedulerError] = useState('');

  // Voice Assistant States
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch all basic data on mount
  useEffect(() => {
    fetchCoreData();
  }, []);

  // Dynamically update welcome message when voice language changes
  useEffect(() => {
    if (chatMessages.length <= 1) {
      let welcomeMsg = 'Namaste! I am CropCare AI. Ask me any farming questions, or ask about soil health, fertilizers, and crop diseases!';
      if (voiceLanguage === 'hi-IN') {
        welcomeMsg = 'नमस्ते! मैं क्रॉपकेयर एआई (CropCare AI) हूँ। मुझसे खेती से जुड़ा कोई भी सवाल पूछें, या मिट्टी की सेहत, उर्वरकों और फसल के रोगों के बारे में जानकारी पाएं!';
      } else if (voiceLanguage === 'te-IN') {
        welcomeMsg = 'నమస్తే! నేను క్రాప్‌కేర్ AI (CropCare AI). నన్ను వ్యవసాయానికి సంబంధించిన ఏవైనా ప్రశ్నలు అడగండి, లేదా నేల ఆరోగ్యం, ఎరువులు మరియు పంట తెగుళ్ల గురించి తెలుసుకోండి!';
      }
      setChatMessages([{ role: 'model', parts: [welcomeMsg] }]);
    }
  }, [voiceLanguage]);

  // Fetch admin stats and details
  const fetchCoreData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Test backend connection
      const healthRes = await axios.get(API_BASE_URL.replace('/api', ''));
      if (healthRes.data && healthRes.data.status === 'online') {
        setApiOnline(true);
      }

      // Load core data
      const [statesRes, cropsRes, soilsRes, diseasesRes, chemicalsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/states`),
        axios.get(`${API_BASE_URL}/crops`),
        axios.get(`${API_BASE_URL}/soils`),
        axios.get(`${API_BASE_URL}/diseases`),
        axios.get(`${API_BASE_URL}/chemicals`),
        axios.get(`${API_BASE_URL}/admin/stats`)
      ]);

      setStates(statesRes.data);
      setCrops(cropsRes.data);
      setSoils(soilsRes.data);
      setDiseases(diseasesRes.data);
      setChemicals(chemicalsRes.data);
      setApiStats(statsRes.data);
      
      // Default selections
      if (statesRes.data.length > 0) {
        setSelectedStateId(statesRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching API data:', err);
      setApiOnline(false);
      setErrorMessage('Could not connect to the Python Flask REST API server. Please ensure the backend server is running on http://127.0.0.1:5000.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch stats and list data after admin updates
  const refreshData = async () => {
    try {
      const [statesRes, cropsRes, soilsRes, diseasesRes, chemicalsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/states`),
        axios.get(`${API_BASE_URL}/crops`),
        axios.get(`${API_BASE_URL}/soils`),
        axios.get(`${API_BASE_URL}/diseases`),
        axios.get(`${API_BASE_URL}/chemicals`),
        axios.get(`${API_BASE_URL}/admin/stats`)
      ]);

      setStates(statesRes.data);
      setCrops(cropsRes.data);
      setSoils(soilsRes.data);
      setDiseases(diseasesRes.data);
      setChemicals(chemicalsRes.data);
      setApiStats(statsRes.data);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  // 1. Fetch State Detail
  useEffect(() => {
    if (selectedStateId) {
      axios.get(`${API_BASE_URL}/states/${selectedStateId}`)
        .then(res => setStateDetail(res.data))
        .catch(err => console.error(err));
    }
  }, [selectedStateId]);

  // Handle Crop Click
  const handleCropClick = (cropId) => {
    axios.get(`${API_BASE_URL}/crops/${cropId}`)
      .then(res => {
        setSelectedCropDetail(res.data);
      })
      .catch(err => console.error(err));
  };

  // Handle Disease Click
  const handleDiseaseClick = (diseaseId) => {
    axios.get(`${API_BASE_URL}/diseases/${diseaseId}`)
      .then(res => {
        setSelectedDiseaseDetail(res.data);
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
      // Fetch crop details to get its diseases
      axios.get(`${API_BASE_URL}/crops/${wizardCropId}`)
        .then(res => {
          setWizardDiseases(res.data.diseases || []);
          setWizardDiseaseId('');
          setWizardChemicals([]);
        })
        .catch(err => console.error(err));
    }
  }, [wizardCropId]);

  useEffect(() => {
    if (wizardDiseaseId) {
      // Fetch disease details to get chemicals
      axios.get(`${API_BASE_URL}/diseases/${wizardDiseaseId}`)
        .then(res => {
          setWizardChemicals(res.data.chemicals || []);
        })
        .catch(err => console.error(err));
    }
  }, [wizardDiseaseId]);

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

    try {
      const response = await axios.post(`${API_BASE_URL}/gemini/schedule`, schedulerForm);
      setSchedulerResult(response.data);
    } catch (err) {
      console.error(err);
      setSchedulerError(err.response?.data?.error || err.message || 'Failed to generate cultivation schedule.');
    } finally {
      setSchedulerLoading(false);
    }
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

    axios.post(`${API_BASE_URL}/gemini/diagnose`, formData, {
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

  const speakText = (text, lang) => {
    if (!window.speechSynthesis) return;
    
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume(); // Unfreeze the engine if it was stuck in a paused state
    } catch (e) {
      console.error("Error cancelling/resuming SpeechSynthesis:", e);
    }
    
    const cleanText = text
      .replace(/[*#`_\-]/g, '')
      .replace(/\n+/g, ' ');

    // 100ms timeout prevents Chrome from locking up when calling cancel() right before speak()
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;

      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase());
      if (!matchedVoice) {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase().split('-')[0]));
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        console.log(`SpeechSynthesis: Explicitly set voice "${matchedVoice.name}" (${matchedVoice.lang}) for language "${lang}".`);
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

      // Keep reference to prevent Garbage Collection from cutting off speech in Chrome
      window.activeUtterance = utterance;

      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Error speaking utterance:", e);
      }
    }, 100);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
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
        speakText(reply, voiceLanguage);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 bg-emerald-900 text-white flex flex-col shrink-0 transition-all z-20 md:static ${mobileMenuOpen ? 'fixed inset-0 h-screen' : 'h-auto md:h-screen'}`}>
        {/* Logo Section */}
        <div className="p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight">AgriFuture</h1>
              <p className="text-xs text-emerald-300 font-medium">Advisory System</p>
            </div>
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layers },
            { id: 'state-select', label: 'State-wise Crops', icon: MapPin },
            { id: 'crop-info', label: 'Crop Information', icon: Sprout },
            { id: 'gov-msp', label: 'Govt Crops & MSP', icon: TrendingUp },
            { id: 'soil-info', label: 'Soil Details', icon: Database },
            { id: 'disease-mgmt', label: 'Diseases Management', icon: ShieldAlert },
            { id: 'chemical-rec', label: 'Chemical Advisories', icon: Sliders },
            { id: 'adv-search', label: 'Advanced Search', icon: Search },
            { id: 'disease-finder', label: 'Advisory Disease Finder', icon: HelpCircle },
            { id: 'smart-scheduler', label: 'Smart Scheduler', icon: FileText },
            { id: 'ai-detection', label: 'AI Crop Diagnosis', icon: Bot },
            { id: 'gemini-chat', label: 'CropCare AI', icon: MessageSquare },
            { id: 'admin-panel', label: 'Admin Panel', icon: UserCheck }
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                  activeTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeTab === tab.id ? 'text-emerald-300' : 'text-emerald-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-emerald-900 text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-2">
            <Sprout className="h-5 w-5 text-emerald-400" />
            <span className="font-bold text-base">AgriFuture Advisory</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 m-6 rounded shadow-sm flex items-start space-x-3 animate-fade-in shrink-0">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-800">Connection Trouble</h3>
              <p className="text-xs text-rose-700 mt-1">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-rose-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Core Loading Overlay */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-gray-600 font-semibold text-sm">Loading agricultural advisor data...</p>
          </div>
        ) : (
          <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-fade-in">
            {/* 1. DASHBOARD MODULE */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Agriculture Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">Real-time stats and advisory database for farming operations.</p>
                  </div>
                  {/* Dashboard Quick Search */}
                  <div className="relative max-w-md w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Quick query..."
                      value={globalSearchQuery}
                      onChange={(e) => {
                        setGlobalSearchQuery(e.target.value);
                        setAdvSearchQuery(e.target.value);
                        setActiveTab('adv-search');
                      }}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
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
                      <div key={idx} className={`p-5 rounded-xl bg-white border shadow-sm flex items-center space-x-4 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]`}>
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
              </div>
            )}

            {/* 2. STATE SELECTION MODULE */}
            {activeTab === 'state-select' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">State Agricultural Directory</h2>
                  <p className="text-sm text-gray-500 mt-1">Select an Indian State to explore its unique climate and major crops.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Selection List */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search state..."
                        value={stateSearchText}
                        onChange={(e) => setStateSearchText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="max-h-[350px] overflow-y-auto space-y-1">
                      {filteredStates.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setSelectedStateId(st.id.toString())}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
                            selectedStateId === st.id.toString()
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{st.state_name}</span>
                          <ChevronRight className={`h-4 w-4 text-emerald-600 transition-transform ${selectedStateId === st.id.toString() ? 'translate-x-0.5' : 'opacity-40'}`} />
                        </button>
                      ))}
                      {filteredStates.length === 0 && (
                        <p className="text-center text-gray-400 text-xs py-4">No states matching that search.</p>
                      )}
                    </div>
                  </div>

                  {/* Detail Panel */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
                    {stateDetail ? (
                      <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                          <h3 className="text-2xl font-black text-emerald-900">{stateDetail.state_name}</h3>
                          <div className="flex items-center space-x-2 mt-2 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 w-fit">
                            <Thermometer className="h-3.5 w-3.5" />
                            <span>Climate Zone: {stateDetail.climate}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Agricultural Overview</h4>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1.5">{stateDetail.description}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Major Crops Cultivated</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stateDetail.crops && stateDetail.crops.length > 0 ? (
                              stateDetail.crops.map((c) => (
                                <div 
                                  key={c.id} 
                                  onClick={() => {
                                    handleCropClick(c.id);
                                    setActiveTab('crop-info');
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
                                        <Droplet className="h-2.5 w-2.5 mr-0.5" /> {c.water_requirement} Water
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-xs py-2">No crops mapped for this state yet.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-8">Select a state on the left to see details.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. CROP INFORMATION MODULE */}
            {activeTab === 'crop-info' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Crops Directory</h2>
                    <p className="text-sm text-gray-500 mt-1">Detailed database of Indian crops, growing parameters, and soil preferences.</p>
                  </div>
                  {/* Filters */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-bold text-gray-500 uppercase">Season:</span>
                    <select
                      value={cropFilterSeason}
                      onChange={(e) => setCropFilterSeason(e.target.value)}
                      className="border border-gray-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="All">All Seasons</option>
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
                    placeholder="Search crop by name or scientific term..."
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
                              <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider">Water Need</span>
                              <span className="font-semibold text-gray-700 mt-0.5 block">{crop.water_requirement}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider">Expected Yield</span>
                              <span className="font-semibold text-gray-700 mt-0.5 block truncate" title={crop.yield}>{crop.yield}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider">Govt MSP</span>
                              <span className="font-bold text-emerald-700 mt-0.5 block truncate" title={crop.msp || 'N/A'}>{crop.msp || 'N/A'}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">Suitable Soils</span>
                            <div className="flex flex-wrap gap-1">
                              {crop.soils && crop.soils.length > 0 ? (
                                crop.soils.map((s, idx) => (
                                  <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs italic">No Soils Mapped</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                          State: <strong className="text-gray-700 font-bold">{crop.state_name}</strong>
                        </span>
                        <button
                          onClick={() => handleCropClick(crop.id)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1"
                        >
                          <span>Diseases & Details</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredCropsList.length === 0 && (
                    <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                      No crops found matching the criteria.
                    </div>
                  )}
                </div>

                {/* Crop Detail Modal */}
                {selectedCropDetail && (
                  <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
                        <div>
                          <h3 className="text-xl font-black">{selectedCropDetail.crop_name} Details</h3>
                          <p className="text-xs text-emerald-300 italic">{selectedCropDetail.scientific_name}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedCropDetail(null)}
                          className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">Seasonality</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{selectedCropDetail.season}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">Origin State</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{selectedCropDetail.state_name}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">Water requirement</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{selectedCropDetail.water_requirement}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">Expected Yield</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{selectedCropDetail.yield}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block">Govt Support Price (MSP)</span>
                            <span className="font-bold text-emerald-700 mt-1 block">{selectedCropDetail.msp || 'N/A'}</span>
                          </div>
                        </div>

                        <div>
                          <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider block mb-2">Suitable Soils</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCropDetail.soils && selectedCropDetail.soils.map((s, idx) => (
                              <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-5">
                          <h4 className="font-bold text-sm text-gray-800 mb-3">Known Crop Pathogens & Diseases</h4>
                          <div className="space-y-3">
                            {selectedCropDetail.diseases && selectedCropDetail.diseases.length > 0 ? (
                              selectedCropDetail.diseases.map((d) => (
                                <div key={d.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{d.disease_name}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1"><strong className="font-bold text-gray-700">Symptoms:</strong> {d.symptoms}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      handleDiseaseClick(d.id);
                                      setSelectedCropDetail(null);
                                      setActiveTab('disease-mgmt');
                                    }}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline shrink-0"
                                  >
                                    View Treatment
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-xs italic">No disease mappings currently added for this crop.</p>
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
                    Check which crops are backed by the Government of India's Minimum Support Price (MSP) scheme and see recommended prices.
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
                          placeholder="Search supported crops..."
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
                          <option value="All">All Seasons</option>
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
                            <h4 className="font-bold text-gray-700 text-base">No Supported Crops Found</h4>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or season filter.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {supportedCrops.map(c => (
                            <div key={c.id} className="bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
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
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                  <Sprout className="h-5 w-5" />
                                </div>
                              </div>

                              <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-wide block">Minimum Support Price</span>
                                  <span className="text-lg font-black text-emerald-700">{c.msp}</span>
                                </div>
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-sm">
                                  Govt Backed
                                </span>
                              </div>

                              <div className="text-xs border-t border-gray-50 pt-3 space-y-1.5 text-gray-600 font-medium">
                                <div className="flex justify-between">
                                  <span>Water Requirement:</span>
                                  <span className="text-gray-900 font-semibold">{c.water_requirement}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Average Yield:</span>
                                  <span className="text-gray-900 font-semibold">{c.yield}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Suitable Soils:</span>
                                  <span className="text-gray-900 font-semibold max-w-[150px] truncate" title={c.soils?.join(', ')}>
                                    {c.soils?.join(', ') || 'N/A'}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedCropDetail(c);
                                  setActiveTab('crop-info');
                                }}
                                className="w-full py-2 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-bold rounded-lg text-xs transition-all border border-gray-100 hover:border-emerald-200"
                              >
                                View Detailed Guide & Diseases
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right Side: Mandi Selling Guidelines (Sider Suggestions Card) */}
                  <div className="space-y-6">
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

            {/* 4. SOIL INFORMATION MODULE */}
            {activeTab === 'soil-info' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Soil Profiles & Chemistry</h2>
                  <p className="text-sm text-gray-500 mt-1">Catalog of soil classifications, characteristics, pH ratings, and nutrient indexes.</p>
                </div>

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

                {/* Soil list */}
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

                        <div>
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Characteristics & Nutrients</span>
                          <p className="text-xs text-gray-600 leading-relaxed mt-1">{soil.characteristics}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3.5">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">Suitable Crops for Cultivation</span>
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
            )}

            {/* 5. DISEASE MANAGEMENT MODULE */}
            {activeTab === 'disease-mgmt' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Disease Management</h2>
                  <p className="text-sm text-gray-500 mt-1">Identification logs, causative agents, and organic prevention protocols.</p>
                </div>

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
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Observed Symptoms</span>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-3 leading-relaxed" title={d.symptoms}>
                              {d.symptoms}
                            </p>
                          </div>
                          
                          <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-lg">
                            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Organic Prevention</span>
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
                          onClick={() => setSelectedDiseaseDetail(null)}
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

            {/* 6. CHEMICAL RECOMMENDATION MODULE */}
            {activeTab === 'chemical-rec' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Chemical & Pesticide Advisories</h2>
                    <p className="text-sm text-gray-500 mt-1">Approved chemical names, application methodologies, safety equipment recommendations, and dosages.</p>
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

            {/* 7. ADVANCED SEARCH MODULE */}
            {activeTab === 'adv-search' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Advanced Search</h2>
                  <p className="text-sm text-gray-500 mt-1">Universal cross-indexing tool. Search across states, crops, soils, diseases, and chemical treatments simultaneously.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center max-w-2xl bg-white p-3.5 border border-gray-200 rounded-xl shadow-sm">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Type a state, crop variety, soil profile, or disease name..."
                      value={advSearchQuery}
                      onChange={(e) => setAdvSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="w-full sm:w-auto flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-bold text-gray-500 uppercase">Search Category:</span>
                    <select
                      value={advSearchCategory}
                      onChange={(e) => setAdvSearchCategory(e.target.value)}
                      className="border border-gray-200 rounded-lg text-xs font-semibold px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto"
                    >
                      <option value="All">All Categories</option>
                      <option value="states">States</option>
                      <option value="crops">Crops</option>
                      <option value="soils">Soils</option>
                      <option value="diseases">Diseases</option>
                      <option value="chemicals">Chemicals</option>
                    </select>
                  </div>
                </div>

                {advSearchQuery ? (
                  <div className="space-y-6">
                    <p className="text-sm font-semibold text-gray-600">
                      Found {advResultsCount} results matching <strong className="text-gray-800">"{advSearchQuery}"</strong>:
                    </p>

                    <div className="space-y-6">
                      {/* States Results */}
                      {(advSearchCategory === 'All' || advSearchCategory === 'states') && advResults.states.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5 text-emerald-600" /> States ({advResults.states.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {advResults.states.map(s => (
                              <div key={s.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between">
                                <div>
                                  <h4 className="font-extrabold text-base text-gray-900">{s.state_name}</h4>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                                </div>
                                <button
                                  onClick={() => { setSelectedStateId(s.id.toString()); setActiveTab('state-select'); }}
                                  className="text-xs text-emerald-600 hover:text-emerald-800 font-bold self-end mt-2 flex items-center"
                                >
                                  <span>View State details</span>
                                  <ChevronRight className="h-3 w-3 ml-0.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Crops Results */}
                      {(advSearchCategory === 'All' || advSearchCategory === 'crops') && advResults.crops.length > 0 && (
                        <div className="space-y-2.5 border-t border-gray-100 pt-5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <Sprout className="h-4 w-4 mr-1.5 text-blue-600" /> Crops ({advResults.crops.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {advResults.crops.map(c => (
                              <div key={c.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center">
                                <div>
                                  <h4 className="font-extrabold text-base text-gray-900">{c.crop_name}</h4>
                                  <p className="text-xs text-gray-400 italic mt-0.5">{c.scientific_name}</p>
                                </div>
                                <button
                                  onClick={() => { handleCropClick(c.id); setActiveTab('crop-info'); }}
                                  className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center shrink-0"
                                >
                                  <span>View Crop profile</span>
                                  <ChevronRight className="h-3 w-3 ml-0.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Soils Results */}
                      {(advSearchCategory === 'All' || advSearchCategory === 'soils') && advResults.soils.length > 0 && (
                        <div className="space-y-2.5 border-t border-gray-100 pt-5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <Database className="h-4 w-4 mr-1.5 text-amber-600" /> Soils ({advResults.soils.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {advResults.soils.map(s => (
                              <div key={s.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <h4 className="font-extrabold text-base text-gray-900">{s.soil_name}</h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.characteristics}</p>
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-2">
                                  pH: {s.ph_range}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diseases Results */}
                      {(advSearchCategory === 'All' || advSearchCategory === 'diseases') && advResults.diseases.length > 0 && (
                        <div className="space-y-2.5 border-t border-gray-100 pt-5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <ShieldAlert className="h-4 w-4 mr-1.5 text-red-600" /> Diseases ({advResults.diseases.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {advResults.diseases.map(d => (
                              <div key={d.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center">
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-base text-gray-900 truncate">{d.disease_name}</h4>
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">{d.symptoms}</p>
                                </div>
                                <button
                                  onClick={() => { handleDiseaseClick(d.id); setActiveTab('disease-mgmt'); }}
                                  className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center shrink-0 ml-4"
                                >
                                  <span>Advisory details</span>
                                  <ChevronRight className="h-3 w-3 ml-0.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chemicals Results */}
                      {(advSearchCategory === 'All' || advSearchCategory === 'chemicals') && advResults.chemicals.length > 0 && (
                        <div className="space-y-2.5 border-t border-gray-100 pt-5">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center">
                            <Sliders className="h-4 w-4 mr-1.5 text-purple-600" /> Chemicals ({advResults.chemicals.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {advResults.chemicals.map(c => (
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
                                    onClick={() => { handleDiseaseClick(c.disease_id); setActiveTab('disease-mgmt'); }}
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

                      {advResultsCount === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                          No resources found matching your query.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                    <Search className="h-10 w-10 mx-auto opacity-30 mb-3" />
                    <p className="text-sm font-semibold">Start typing in the box above to perform an instant database lookup.</p>
                  </div>
                )}
              </div>
            )}

            {/* 8. CROP DISEASE FINDER */}
            {activeTab === 'disease-finder' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Crop Disease Finder Wizard</h2>
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
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          wizardStep === s.step
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
                        <h3 className="font-extrabold text-lg text-gray-900">Where is your farm located?</h3>
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
                        <h3 className="font-extrabold text-lg text-gray-900">What crop are you cultivating?</h3>
                        <p className="text-xs text-gray-500">Only showing major crops grown in your selected state.</p>
                      </div>

                      <div className="max-w-md mx-auto space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
                          {wizardCrops.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setWizardCropId(c.id.toString())}
                              className={`p-4 rounded-xl border text-left font-bold text-sm transition-all ${
                                wizardCropId === c.id.toString()
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
                        <h3 className="font-extrabold text-lg text-gray-900">Select observed disease</h3>
                        <p className="text-xs text-gray-500">Pick the symptoms that match the issues seen on your crops.</p>
                      </div>

                      <div className="max-w-xl mx-auto space-y-5">
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {wizardDiseases.map(d => (
                            <div 
                              key={d.id}
                              onClick={() => setWizardDiseaseId(d.id.toString())}
                              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                wizardDiseaseId === d.id.toString()
                                  ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                                  : 'border-gray-200 hover:bg-gray-50 bg-white'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-gray-900 text-sm">{d.disease_name}</h4>
                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                  wizardDiseaseId === d.id.toString() ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                                }`}>
                                  {wizardDiseaseId === d.id.toString() && <Check className="h-2.5 w-2.5" />}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                <strong className="font-bold text-gray-700">Symptoms:</strong> {d.symptoms}
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
                            onClick={() => setWizardStep(4)}
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
                        <h3 className="font-extrabold text-xl text-emerald-900 mt-2">Advisory Generated Successfully!</h3>
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
                              <p><strong>Symptoms:</strong> {diseases.find(d => d.id === parseInt(wizardDiseaseId))?.symptoms}</p>
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
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Admin Management Panel</h2>
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
                      <span>Create new {adminActiveSubTab.slice(0, -1)}</span>
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
                    { id: 'chemicals', label: 'Chemicals' }
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setAdminActiveSubTab(subTab.id)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg shrink-0 transition-all ${
                        adminActiveSubTab === subTab.id
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
                            <th className="px-6 py-4">Govt MSP</th>
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
                  </div>
                </div>

                {/* CRUD Form Modal */}
                {crudModalOpen && (
                  <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
                        <h3 className="text-lg font-black uppercase tracking-wide">
                          {crudMode === 'add' ? 'Create' : 'Modify'} {adminActiveSubTab.slice(0, -1)}
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
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expected Yield</label>
                                <input
                                  type="text"
                                  value={cropForm.yield}
                                  onChange={(e) => setCropForm({ ...cropForm, yield: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                                  placeholder="e.g. 3.5 tons/hectare"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Govt Support Price (MSP)</label>
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
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center space-y-3.5 relative">
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
                          <p className="font-bold text-gray-900 text-sm">Drag and drop plant photograph here</p>
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
                    <div className="space-y-2 max-w-sm mx-auto">
                      <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>{aiProgressText}</span>
                        <span>{aiProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-emerald-600 transition-all duration-300" style={{ width: `${aiProgress}%` }}></div>
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
                          <strong className="text-emerald-950 font-bold block">Typical Symptoms:</strong>
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

                  {/* Future Tensor Flow notice */}
                  <div className="flex items-start space-x-3 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wide">Future TensorFlow Integration</h4>
                      <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                        Currently, this page operates with mock prediction results mapped directly to our central catalog. In a production setting, this interface links to a hosted TensorFlow Lite/Keras model endpoint (`/api/predict/image`) to run inference on leaf pixel grids in real time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. SMART CULTIVATION SCHEDULER */}
            {activeTab === 'smart-scheduler' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Smart Cultivation Scheduler</h2>
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

                      {/* Previous Yield */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Previous Yield</label>
                        <input
                          type="text"
                          value={schedulerForm.previous_yield}
                          onChange={(e) => setSchedulerForm({ ...schedulerForm, previous_yield: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                          placeholder="e.g. 2.5 tons/hectare"
                        />
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
                      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="relative flex items-center justify-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent"></div>
                          <Sprout className="absolute h-6 w-6 text-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-gray-700 font-bold text-base mt-4">Analysing Farm Chemistry & Rotation Cycle...</p>
                        <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                          Cerevyn Research AI is calculating exact nitrogen-phosphorus ratios, water requirements, and organic cultivation dates for your farm.
                        </p>
                      </div>
                    ) : schedulerResult ? (
                      <div className="space-y-6">
                        {/* Timeline */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3 mb-6">
                            Cultivation Timeline for {schedulerForm.acres} Acres of {schedulerForm.crop_type}
                          </h3>

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
                                        <strong className="text-blue-900 font-bold block mb-0.5">Water Management</strong>
                                        <span className="text-blue-700">{item.irrigation_advice}</span>
                                      </div>
                                    )}
                                    {item.fertilizer_dosage && (
                                      <div className="bg-purple-50/50 border border-purple-100/30 p-2.5 rounded-lg">
                                        <strong className="text-purple-900 font-bold block mb-0.5">NPK & Fertilizer Dosage</strong>
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
                              <span>Soil & Fertilizer Tips</span>
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
                              <span>General Suggestions</span>
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
                              <span>Potential Risks & Warnings</span>
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
                        <h4 className="font-bold text-gray-700 text-base">Plan Output Panel</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs">
                          Configure your farm parameters on the left and click **Generate Plan** to receive your AI-powered advice schedule here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 11. GEMINI CHATBOT MODULE */}
            {activeTab === 'gemini-chat' && (
              <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
                <div className="text-center space-y-2 shrink-0">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 mr-2 text-emerald-600" /> CropCare AI
                  </h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Real-time farming advisory chatbot. Ask in English, Hindi, Telugu, Tamil, Bengali, or any local language.
                  </p>
                </div>

                {geminiApiKeyMissing && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded shrink-0 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <strong className="font-bold block text-sm mb-1 text-amber-900">Azure OpenAI Credentials Missing</strong>
                        To enable real-time plant diagnostics and the chatbot, please configure your Azure OpenAI credentials in the backend environment:
                        <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                          <li>Create or edit the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file in the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">backend/</code> folder (or set them in Render's Env variables dashboard).</li>
                          <li>Add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">AZURE_OPENAI_KEY</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">AZURE_OPENAI_ENDPOINT</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">AZURE_OPENAI_DEPLOYMENT</code>, and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">AZURE_OPENAI_API_VERSION</code>.</li>
                          <li>Restart the backend server.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded shrink-0 shadow-sm flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
                    <div className="flex-1 text-xs text-rose-800 leading-relaxed">
                      <strong className="font-bold block text-sm mb-1 text-rose-900">Chatbot Connection Error</strong>
                      {chatError}
                    </div>
                    <button onClick={() => setChatError('')} className="text-rose-400 hover:text-rose-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Chat Message Window */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-md flex flex-col min-h-0">
                  {/* Voice Assistant configuration header */}
                  <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0 rounded-t-2xl">
                    <div className="flex items-center space-x-2">
                      <Bot className={`h-5 w-5 text-emerald-600 ${(isListening || isSpeaking) ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Multilingual Voice AI</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Language Select */}
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Language:</span>
                        <select
                          value={voiceLanguage}
                          onChange={(e) => {
                            setVoiceLanguage(e.target.value);
                            stopSpeaking();
                          }}
                          className="border border-gray-200 rounded-lg text-xs font-semibold px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="en-IN">English (India)</option>
                          <option value="hi-IN">हिन्दी (Hindi)</option>
                          <option value="te-IN">తెలుగు (Telugu)</option>
                        </select>
                      </div>

                      {/* Auto Speak Toggle */}
                      <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoSpeak}
                          onChange={(e) => {
                            setAutoSpeak(e.target.checked);
                            if (!e.target.checked) stopSpeaking();
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 border-gray-300"
                        />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Auto-Speak</span>
                      </label>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                            msg.role === 'user'
                              ? 'bg-emerald-600 text-white rounded-tr-none'
                              : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                          }`}
                        >
                          <div className="font-bold text-[10px] opacity-65 mb-1 flex items-center justify-between">
                            <span>{msg.role === 'user' ? 'YOU' : 'CROPCARE AI'}</span>
                            {msg.role !== 'user' && (
                              <button
                                onClick={() => {
                                  if (isSpeaking) {
                                    stopSpeaking();
                                  } else {
                                    speakText(msg.parts[0], voiceLanguage);
                                  }
                                }}
                                className="ml-4 text-emerald-600 hover:text-emerald-800 transition-colors focus:outline-none"
                                title={isSpeaking ? "Stop Voice Playback" : "Speak Message"}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  {isSpeaking ? (
                                    <>
                                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="currentColor"></rect>
                                    </>
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
                        <div className="bg-gray-100 text-gray-400 border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none text-xs font-semibold flex items-center space-x-2">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>CropCare AI is thinking...</span>
                        </div>
                      </div>
                    )}

                    {/* Speech listening visual wave */}
                    {isListening && (
                      <div className="flex justify-start items-center space-x-3 p-3 bg-rose-50 border border-rose-100 rounded-xl max-w-xs animate-pulse">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-3.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-1.5 h-5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-3.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                        <span className="text-xs font-semibold text-rose-800">
                          Listening ({voiceLanguage === 'te-IN' ? 'Telugu' : voiceLanguage === 'hi-IN' ? 'Hindi' : 'English'})...
                        </span>
                      </div>
                    )}

                    {/* Speech speaking visual wave */}
                    {isSpeaking && (
                      <div className="flex justify-start items-center space-x-3 p-3 bg-blue-50 border border-blue-100 rounded-xl max-w-xs animate-pulse">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-1.5 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                        <span className="text-xs font-semibold text-blue-800">Speaking response...</span>
                        <button onClick={stopSpeaking} className="text-blue-500 hover:text-blue-700 text-[10px] font-bold border border-blue-200 px-1.5 py-0.5 rounded bg-white shrink-0 ml-auto">STOP</button>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center space-x-3 shrink-0">
                    <button
                      type="button"
                      onClick={isListening ? () => {} : startSpeechRecognition}
                      className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                        isListening
                          ? 'bg-rose-100 border-rose-300 text-rose-600 animate-pulse'
                          : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                      }`}
                      title="Speak your question"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                      placeholder="Ask in English, हिन्दी or తెలుగు..."
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0 text-sm"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        )}

        {/* Admin Password Prompt Modal */}
        {adminPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-fade-in">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
                <h3 className="text-base font-black uppercase tracking-wide">Admin Access Required</h3>
                <button 
                  onClick={() => setAdminPasswordModalOpen(false)}
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Enter Admin Password</label>
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
                    onClick={() => setAdminPasswordModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
