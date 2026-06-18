import os
import json
import re
import requests
from dotenv import load_dotenv

# Load environment variables
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
env_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path=env_path, override=True)

azure_openai_key = os.getenv("AZURE_OPENAI_KEY")
azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
azure_openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
azure_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")

def call_azure_openai(messages, temperature=0.3):
    if not azure_openai_key or not azure_openai_endpoint:
        raise Exception("Azure OpenAI key/endpoint not found in .env file.")
        
    url = f"{azure_openai_endpoint.rstrip('/')}/openai/deployments/{azure_openai_deployment}/chat/completions?api-version={azure_openai_api_version}"
    headers = {
        "api-key": azure_openai_key,
        "Content-Type": "application/json"
    }
    payload = {
        "messages": messages,
        "temperature": temperature
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Azure OpenAI API returned error {response.status_code}: {response.text}")
    return response.json()["choices"][0]["message"]["content"]

base_translations = {
  "en": {
    "dashboard": "Dashboard",
    "cropsDirectory": "Crops Directory",
    "govtCropsMsp": "Govt Crops & MSP",
    "govtSchemes": "Govt Schemes Eligibility",
    "soilDetails": "Soil Details",
    "cropHealthHub": "Crop Health Hub",
    "advisoryDiseaseFinder": "Advisory Disease Finder",
    "smartScheduler": "Smart Scheduler",
    "aiCropDiagnosis": "AI Crop Diagnosis",
    "adminPanel": "Admin Panel",
    "languageSelect": "Language",
    "smartSupportSystem": "Smart Cultivation & Support System",
    "welcomeHeader": "Future of Farming, Guided by AI.",
    "welcomeDesc": "Empowering farmers in India with real-time crop MSP lookups, AI plant disease diagnostics, automated schedules, and friendly voice-enabled advice in local languages.",
    "accessAdvisoryDashboard": "Access Advisory Dashboard",
    "aiDiagnosticsTitle": "AI Diagnostics",
    "aiDiagnosticsDesc": "Instant leaf disease detection from photos",
    "stateWiseCropsTitle": "State-wise Crops",
    "stateWiseCropsDesc": "Region-matched seasons and crop lists",
    "smartSchedulerTitle": "Smart Scheduler",
    "smartSchedulerDesc": "Customized soil and watering schedules",
    "voiceAiBotTitle": "Voice AI Bot",
    "voiceAiBotDesc": "Multilingual help in Telugu, Hindi & English",
    "expectedYieldTarget": "Expected Yield Target (in Quintals)",
    "previousYieldTarget": "Previous Yield (in Quintals)",
    "previousCropGrown": "Previous Crop Grown",
    "generatePlan": "Generate AI Cultivation Plan",
    "generatingAdvisory": "Generating Advisory...",
    "planOutputPanel": "Plan Output Panel",
    "planOutputDesc": "Configure your farm parameters on the left and click Generate Plan to receive your AI-powered advice schedule here.",
    "targetYieldFeasibility": "Target Yield Feasibility",
    "evaluatingTarget": "Evaluating your target of",
    "listen": "Listen",
    "stopListening": "Stop Listening",
    "downloadPdf": "Download PDF",
    "assessmentLabel": "Assessment",
    "soilFertilizerTips": "Soil & Fertilizer Tips",
    "generalSuggestions": "General Suggestions",
    "potentialRisks": "Potential Risks & Warnings",
    "selectYourState": "Select Your State",
    "farmSizeInAcres": "Farm Size (Acres)",
    "irrigationType": "Irrigation Type",
    "searchSoils": "Select Soil Type",
    "searchCrops": "Select Target Crop",
    "smartSchedulerFormTitle": "Smart Cultivation Scheduler",
    "smartSchedulerFormSubtitle": "Get custom cultivation steps, watering timelines, and fertilizer schedules generated in real-time by AI.",
    "farmConfiguration": "Farm Configuration",
    "selectLocationPrompt": "-- Select Location --",
    "selectSoilPrompt": "-- Select Soil Type --",
    "selectCropPrompt": "-- Select Target Crop --",
    "dripIrrigation": "Drip Irrigation",
    "sprinklerIrrigation": "Sprinkler",
    "floodIrrigation": "Flood Irrigation",
    "rainfedIrrigation": "Rainfed (No Irrigation)",
    "previousCropPlaceholder": "e.g. Mustard / Fallow",
    "previousYieldPlaceholder": "e.g. 15",
    "expectedYieldPlaceholder": "e.g. 20",
    "schedulerLoadingTitle": "Analysing Farm Chemistry & Rotation Cycle...",
    "schedulerLoadingDesc": "Cerevyn Research AI is calculating exact nitrogen-phosphorus ratios, water requirements, and organic cultivation dates for your farm.",
    "cultivationTimelineHeader": "Cultivation Timeline for {acres} Acres of {crop}",
    "pdfAdvisoryTitle": "AgriFuture Cultivation Advisory",
    "pdfAdvisorySub": "AI-Powered Smart Cultivation & Yield Management Plan",
    "pdfSelectedCrop": "Selected Crop",
    "pdfSoilType": "Soil Type",
    "pdfFarmSize": "Farm Size",
    "pdfIrrigationMethod": "Irrigation Method",
    "pdfPreviousCrop": "Previous Crop",
    "pdfPreviousYield": "Previous Yield",
    "pdfTargetYield": "Target Yield",
    "pdfGeneratedOn": "Generated On",
    "pdfTargetYieldStatus": "Target Yield Status",
    "pdfWaterAdvice": "Water Management Advice",
    "pdfFertilizerAdvice": "NPK & Fertilizer Dosage",
    "pdfFooterText": "This is an AI-generated cultivation advisory plan designed by CropCare AI. Please consult local agricultural authorities for regional variations."
  },
  "te": {
    "dashboard": "డ్యాష్‌బోర్డ్",
    "cropsDirectory": "పంటల డైరెక్టరీ",
    "govtCropsMsp": "ప్రభుత్వ పంటలు & MSP",
    "govtSchemes": "ప్రభుత్వ పథకాల అర్హత",
    "soilDetails": "నేల వివరాలు",
    "cropHealthHub": "పంట ఆరోగ్య కేంద్రం",
    "advisoryDiseaseFinder": "తెగుళ్ళ గుర్తింపు సాధనం",
    "smartScheduler": "స్మార్ట్ షెడ్యూలర్",
    "aiCropDiagnosis": "AI పంట తెగుళ్ళ నిర్ధారణ",
    "adminPanel": "అడ్మిన్ ప్యానెల్",
    "languageSelect": "భాష",
    "smartSupportSystem": "స్మార్ట్ వ్యవసాయ & సహాయక వ్యవస్థ",
    "welcomeHeader": "వ్యవసాయ భవిష్యత్తు, AI మార్గదర్శకత్వంలో.",
    "welcomeDesc": "భారతదేశంలోని రైతులకు నిజ-సమయ పంట MSP సమాచారం, AI పంట తెగుళ్ళ గుర్తింపు, ఆటోమేటిక్ షెడ్యూల్‌లు మరియు స్థానిక భాషలలో వాయిస్ సహాయం అందించడం.",
    "accessAdvisoryDashboard": "డ్యాష్‌బోర్డ్‌ను తెరవండి",
    "aiDiagnosticsTitle": "AI తెగుళ్ళ నిర్ధారణ",
    "aiDiagnosticsDesc": "ఆకులు/పంట ఫోటోల నుండి తెగుళ్లను తక్షణమే గుర్తించండి",
    "stateWiseCropsTitle": "రాష్ట్రాల పంటలు",
    "stateWiseCropsDesc": "ప్రాంతీయ పంటలు మరియు సీజన్ల వివరాలు",
    "smartSchedulerTitle": "స్మార్ट షెడ్యూలర్",
    "smartSchedulerDesc": "అనుకూలీకరించిన నేల మరియు నీటి షెడ్యూల్‌లు",
    "voiceAiBotTitle": "వాయిస్ AI బాట్",
    "voiceAiBotDesc": "తెలుగు, హిందీ & ఇంగ్లీషులో బహుభాషా సహాయం",
    "expectedYieldTarget": "ఆశించిన దిగుబడి లక్ష్యం (క్వింటాళ్లలో)",
    "previousYieldTarget": "గత దిగుబడి (క్వింటాళ్లలో)",
    "previousCropGrown": "గతంలో వేసిన పంట",
    "generatePlan": "AI సాగు ప్రణాళికను పొందండి",
    "generatingAdvisory": "ప్రణాళికను సిద్ధం చేస్తున్నాము...",
    "planOutputPanel": "సాగు ప్రణాళికా ఫలితం",
    "planOutputDesc": "ఎడమ వైపున మీ పొలం వివరాలను నమోదు చేసి, ప్రణాళికను రూపొందించడానికి బటన్‌ను క్లిక్ చేయండి.",
    "targetYieldFeasibility": "ఆశించిన దిగుబడి సాధ్యాసాధ్యాలు",
    "evaluatingTarget": "మీ లక్ష్యమైన",
    "listen": "వినండి",
    "stopListening": "ఆపండి",
    "downloadPdf": "PDF డౌన్‌లోడ్",
    "assessmentLabel": "అంచనా విశ్లేషణ",
    "soilFertilizerTips": "నేల & ఎరువుల చిట్కాలు",
    "generalSuggestions": "సాధారణ సలహాలు",
    "potentialRisks": "రాగల నష్టాలు & హెచ్చరికలు",
    "selectYourState": "మీ రాష్ట్రాన్ని ఎంచుకోండి",
    "farmSizeInAcres": "పొలం పరిమాణం (ఎకరాలు)",
    "irrigationType": "నీటి పారుదల రకం",
    "searchSoils": "నేల రకాన్ని ఎంచుకోండి",
    "searchCrops": "పంటను ఎంచుకోండి",
    "smartSchedulerFormTitle": "స్మార్ట్ సాగు షెడ్యూలర్",
    "smartSchedulerFormSubtitle": "AI ద్వారా నిజ-సమయంలో రూపొందించబడిన అనుకూలీకరించిన సాగు దశలు, నీటిపారుదల సమయాలు మరియు ఎరువుల షెడ्यूల్‌లను పొందండి.",
    "farmConfiguration": "పొలం వివరాల కాన్ఫిగరేషన్",
    "selectLocationPrompt": "-- స్థానాన్ని ఎంచుకోండి --",
    "selectSoilPrompt": "-- నేల రకాన్ని ఎంచుకోండి --",
    "selectCropPrompt": "-- పంటను ఎంచుకోండి --",
    "dripIrrigation": "బిందు సేద్యం (Drip)",
    "sprinklerIrrigation": "స్ప్రింక్లర్",
    "floodIrrigation": "వరద నీటి పారుదల (Flood)",
    "rainfedIrrigation": "వర్షాధారం (Rainfed)",
    "previousCropPlaceholder": "ఉదా. ఆవాలు / ఖాళీ నేల",
    "previousYieldPlaceholder": "ఉదా. 15",
    "expectedYieldPlaceholder": "ఉదా. 20",
    "schedulerLoadingTitle": "నేల రసాయనాలు & పంట మార్పిడి చక్రాన్ని విశ్లేషిస్తోంది...",
    "schedulerLoadingDesc": "Cerevyn Research AI మీ పొలానికి అవసరమైన నత్రజని-భాస్వరం నిష్పత్తులు, నీటి అవసరాలు మరియు సేంద్రీయ సాగు తేదీలను లెక్కిస్తోంది.",
    "cultivationTimelineHeader": "{acres} ఎకరాల {crop} సాగు కాలక్రమం",
    "pdfAdvisoryTitle": "అగ్రిఫ్యూచర్ సాగు సలహా పత్రం",
    "pdfAdvisorySub": "AI-ఆధారిత స్మార్ట్ సాగు మరియు దిగుబడి నిర్వహण ప్రణాళిక",
    "pdfSelectedCrop": "ఎంచుకున్న పంట",
    "pdfSoilType": "నేల రకం",
    "pdfFarmSize": "పొలం పరిమాణం",
    "pdfIrrigationMethod": "నీటిపారుదల పద్ధతి",
    "pdfPreviousCrop": "మునుపटी పంట",
    "pdfPreviousYield": "మునుపటి దిగుబడి",
    "pdfTargetYield": "లక్ష్య దిగుబడి",
    "pdfGeneratedOn": "తయారు చేయబడిన తేదీ",
    "pdfTargetYieldStatus": "లక్ష్య దిగుబడి స్థితి",
    "pdfWaterAdvice": "నీటి యాజమాన్య సలహా",
    "pdfFertilizerAdvice": "NPK & ఎరువుల మోతాదు",
    "pdfFooterText": "ఇది క్రాప్‌కేర్ AI చే రూపొందించబడిన AI-ఆధారిత సాగు సలహా ప్రణాళిక. ప్రాంతీయ వైవిధ్యాల కోసం దయచేసి స్థానిక వ్యవసాయ అధికారులను సంప్రదించండి."
  },
  "hi": {
    "dashboard": "डैशबोर्ड",
    "cropsDirectory": "फसलें निर्देशिका",
    "govtCropsMsp": "सरकारी फसलें और MSP",
    "govtSchemes": "सरकारी योजनाएं पात्रता",
    "soilDetails": "मिट्टी का विवरण",
    "cropHealthHub": "फसल स्वास्थ्य केंद्र",
    "advisoryDiseaseFinder": "सलाहकार रोग खोजक",
    "smartScheduler": "स्मार्ट शेड्यूलर",
    "aiCropDiagnosis": "AI फसल रोग निदान",
    "adminPanel": "एडमिन पैनल",
    "languageSelect": "भाषा",
    "smartSupportSystem": "स्मार्ट खेती और सहायता प्रणाली",
    "welcomeHeader": "खेती का भविष्य, AI के मार्गदर्शन में।",
    "welcomeDesc": "भारत के किसानों को वास्तविक समय में फसल MSP, AI द्वारा रोग निदान, स्वचालित समय सारणी और स्थानीय भाषाओं में वॉयस सहायता प्रदान करना।",
    "accessAdvisoryDashboard": "डैशबोर्ड खोलें",
    "aiDiagnosticsTitle": "AI रोग निदान",
    "aiDiagnosticsDesc": "तस्वीरों से पत्ती के रोगों का तुरंत पता लगाएं",
    "stateWiseCropsTitle": "राज्यवार फसलें",
    "stateWiseCropsDesc": "क्षेत्र-अनुकूल मौसम और फसलों की सूची",
    "smartSchedulerTitle": "स्मार्ट शेड्यूलर",
    "smartSchedulerDesc": "अनुकूलित मिट्टी और सिंचाई कार्यक्रम",
    "voiceAiBotTitle": "वॉयस AI बॉट",
    "voiceAiBotDesc": "तेलुगु, हिंदी और अंग्रेजी में बहुभाषी सहायता",
    "expectedYieldTarget": "अपेक्षित उपज लक्ष्य (क्विंटल में)",
    "previousYieldTarget": "पिछली उपज (क्विंटल में)",
    "previousCropGrown": "पिछली बोई गई फसल",
    "generatePlan": "AI कृषि योजना तैयार करें",
    "generatingAdvisory": "कृषि योजना तैयार की जा रही है...",
    "planOutputPanel": "कृषि योजना परिणाम",
    "planOutputDesc": "बाईं ओर अपने खेत का विवरण भरें और अपनी AI-संचालित योजना प्राप्त करने के लिए बटन दबाएं।",
    "targetYieldFeasibility": "लक्षय उपज की व्यवहार्यता (संभावना)",
    "evaluatingTarget": "आपके लक्ष्य",
    "listen": "सुनें",
    "stopListening": "सुनना बंद करें",
    "downloadPdf": "PDF डाउनलोड करें",
    "assessmentLabel": "मूल्यांकन विश्लेषण",
    "soilFertilizerTips": "मिट्टी और खाद के सुझाव",
    "generalSuggestions": "सामान्य सुझाव",
    "potentialRisks": "संभावित जोखिम और चेतावनी",
    "selectYourState": "अपना राज्य चुनें",
    "farmSizeInAcres": "खेत का आकार (एकड़)",
    "irrigationType": "सिंचाई का प्रकार",
    "searchSoils": "मिट्टी प्रकार चुनें",
    "searchCrops": "लक्षित फसल चुनें",
    "smartSchedulerFormTitle": "स्मार्ट खेती शेड्यूलर",
    "smartSchedulerFormSubtitle": "AI द्वारा वास्तविक समय में उत्पन्न अनुकूलित खेती के कदम, सिंचाई कार्यक्रम और उर्वरक योजनाएं प्राप्त करें।",
    "farmConfiguration": "खेत कॉन्फ़िगरेशन",
    "selectLocationPrompt": "-- स्थान चुनें --",
    "selectSoilPrompt": "-- मिट्टी का प्रकार चुनें --",
    "selectCropPrompt": "-- लक्षित फसल चुनें --",
    "dripIrrigation": "टपक सिंचाई (Drip)",
    "sprinklerIrrigation": "फव्वारा (Sprinkler)",
    "floodIrrigation": "बाढ़ सिंचाई (Flood)",
    "rainfedIrrigation": "वर्षा आधारित (Rainfed)",
    "previousCropPlaceholder": "जैसे सरसों / खाली",
    "previousYieldPlaceholder": "जैसे 15",
    "expectedYieldPlaceholder": "जैसे 20",
    "schedulerLoadingTitle": "खेत के रसायन और फसल चक्र का विश्लेषण किया जा रहा है...",
    "schedulerLoadingDesc": "क्रॉपकेयर एआई (Cerevyn Research AI) आपके खेत के लिए सटीक नाइट्रोजन-फॉस्फोरस अनुपात, पानी की आवश्यकता और जैविक खेती की तिथियों की गणना कर रहा है.",
    "cultivationTimelineHeader": "{acres} एकड़ {crop} के लिए खेती की समय सारणी",
    "pdfAdvisoryTitle": "एग्रीफ्यूचर कृषि सलाहकार",
    "pdfAdvisorySub": "AI-संचालित स्मार्ट खेती और उपज प्रबंधन योजना",
    "pdfSelectedCrop": "चयनित फसल",
    "pdfSoilType": "मिट्टी का प्रकार",
    "pdfFarmSize": "खेत का आकार",
    "pdfIrrigationMethod": "सिंचाई विधि",
    "pdfPreviousCrop": "पिछली फसल",
    "pdfPreviousYield": "पिछली उपज",
    "pdfTargetYield": "लक्ष्य उपज",
    "pdfGeneratedOn": "उत्पन्न तिथि",
    "pdfTargetYieldStatus": "लक्ष्य उपज की स्थिति",
    "pdfWaterAdvice": "जल प्रबंधन सलाह",
    "pdfFertilizerAdvice": "NPK और उर्वरक खुराक",
    "pdfFooterText": "यह क्रॉपकेयर एआई द्वारा तैयार की गई एक एआई-जनरेटेड खेती सलाहकार योजना है। क्षेत्रीय बदलावों के लिए कृपया स्थानीय कृषि अधिकारियों से परामर्श करें।"
  },
  "mr": {
    "dashboard": "डॅशबोर्ड",
    "cropsDirectory": "पिके निर्देशिका",
    "govtCropsMsp": "सरकारी पिके आणि MSP",
    "govtSchemes": "सरकारी योजना पात्रता",
    "soilDetails": "मातीची माहिती",
    "cropHealthHub": "पीक आरोग्य केंद्र",
    "advisoryDiseaseFinder": "रोग शोधक सल्लागार",
    "smartScheduler": "स्मार्ट शेड्यूलर",
    "aiCropDiagnosis": "AI पीक रोग निदान",
    "adminPanel": "अ‍ॅडमिन पॅनेल",
    "languageSelect": "भाषा",
    "smartSupportSystem": "स्मार्ट शेती आणि सहाय्य प्रणाली",
    "welcomeHeader": "शेतीचे भविष्य, AI च्या मार्गदर्शनात.",
    "welcomeDesc": "भारतातील शेतकऱ्यांना थेट पीक MSP माहिती, AI पीक रोग निदान, स्वयंचलित वेळापत्रक आणि अभ्यासपूर्ण मार्गदर्शन देणे.",
    "accessAdvisoryDashboard": "डॅशबोर्ड सुरू करा",
    "aiDiagnosticsTitle": "AI रोग निदान",
    "aiDiagnosticsDesc": "पानांच्या फोटोंवरून रोगांचे त्वरित निदान करा",
    "stateWiseCropsTitle": "राज्यनिहाय पिके",
    "stateWiseCropsDesc": "प्रादेशिक हंगाम आणि पिकांची यादी",
    "smartSchedulerTitle": "स्मार्ट शेड्यूलर",
    "smartSchedulerDesc": "अनुकूलित माती आणि पाणी नियोजन वेळापत्रक",
    "voiceAiBotTitle": "व्हॉइस AI बॉट",
    "voiceAiBotDesc": "तेलगू, हिंदी आणि इंग्रजीमध्ये बहुभाषिक मदत",
    "expectedYieldTarget": "अपेक्षित उत्पन्न लक्ष्य (क्विंटल मध्ये)",
    "previousYieldTarget": "मागील उत्पन्न (क्विंटल मध्ये)",
    "previousCropGrown": "मागील पीक",
    "generatePlan": "AI कृषी नियोजन वेळापत्रक वेळापत्रक मिळवा",
    "generatingAdvisory": "नियोजन वेळापत्रक तयार करत आहे...",
    "planOutputPanel": "कृषी नियोजन परिणाम",
    "planOutputDesc": "डाव्या बाजूला आपल्या शेतीची माहिती भरा आणि आपले AI-वेळापत्रक मिळवण्यासाठी बटन दाबा.",
    "targetYieldFeasibility": "उत्पन्न लक्ष्याची व्यवहार्यता (शक्यता)",
    "evaluatingTarget": "आपले लक्ष्य",
    "listen": "ऐका",
    "stopListening": "ऐकणे थांबवा",
    "downloadPdf": "PDF डाउनलोड करा",
    "assessmentLabel": "मूल्यांकन विश्लेषण",
    "soilFertilizerTips": "माती आणि खत विषयक सल्ला",
    "generalSuggestions": "सामान्य सल्ले",
    "potentialRisks": "संभाव्य धोके आणि सावधगिरी",
    "selectYourState": "आपले राज्य निवडा",
    "farmSizeInAcres": "शेतीचे आकारमान (एकर)",
    "irrigationType": "सिंचनाचा प्रकार",
    "searchSoils": "मातीचा प्रकार निवडा",
    "searchCrops": "पीक निवडा",
    "smartSchedulerFormTitle": "स्मार्ट पीक वेळापत्रक",
    "smartSchedulerFormSubtitle": "AI द्वारे थेट तयार केलेल्या पीक नियोजनाच्या पायऱ्या, पाणी देण्याचे वेळापत्रक आणि खतांचे नियोजन मिळवा.",
    "farmConfiguration": "शेती कॉन्फिगरेशन",
    "selectLocationPrompt": "-- स्थान निवडा --",
    "selectSoilPrompt": "-- मातीचा प्रकार निवडा --",
    "selectCropPrompt": "-- पीक निवडा --",
    "dripIrrigation": "ठिबक सिंचन (ठिबक)",
    "sprinklerIrrigation": "तुषार सिंचन (तुषार)",
    "floodIrrigation": "पूर सिंचन (पूर)",
    "rainfedIrrigation": "पावसावर अवलंबून (कोरडवाहू)",
    "previousCropPlaceholder": "उदा. मोहरी / पडीक जमीन",
    "previousYieldPlaceholder": "उदा. १५",
    "expectedYieldPlaceholder": "उदा. २०",
    "schedulerLoadingTitle": "मातीचे रसायन आणि पीक फिरती चक्राचे विश्लेषण करत आहे...",
    "schedulerLoadingDesc": "Cerevyn Research AI आपल्या शेतीसाठी अचूक नायट्रोजन-फॉस्फरस प्रमाण, पाण्याची गरज आणि सेंद्रिय लागवडीच्या तारखांची गणना करत आहे.",
    "cultivationTimelineHeader": "{acres} एकर {crop} लागवडीचे वेळापत्रक",
    "pdfAdvisoryTitle": "अ‍ॅग्रीफ्युचर पीक लागवड सल्ला",
    "pdfAdvisorySub": "AI-द्वारे संचलित पीक लागवड आणि उत्पन्न व्यवस्थापन योजना",
    "pdfSelectedCrop": "निवडलेले पीक",
    "pdfSoilType": "मातीचा प्रकार",
    "pdfFarmSize": "शेतीचे आकारमान",
    "pdfIrrigationMethod": "सिंचन पद्धत",
    "pdfPreviousCrop": "मागील पीक",
    "pdfPreviousYield": "मागील उत्पन्न",
    "pdfTargetYield": "लक्ष्य उत्पन्न",
    "pdfGeneratedOn": "तयार केल्याचा दिनांक",
    "pdfTargetYieldStatus": "लक्ष्य उत्पन्न स्थिती",
    "pdfWaterAdvice": "पाणी व्यवस्थापन सल्ला",
    "pdfFertilizerAdvice": "NPK आणि खतांचे नियोजन",
    "pdfFooterText": "हे क्रॉपकेअर एआय द्वारे तयार केलेले एआय-जनरेटेड पीक लागवड नियोजन वेळापत्रक आहे. प्रादेशिक बदलांसाठी कृपया स्थानिक कृषी अधिकाऱ्यांशी संपर्क साधा."
  }
}

english_keys = {
    "browseCropCatalog": "Browse Crop Catalog",
    "exploreStateSuitability": "Explore State Suitability",
    "cropCatalog": "Crop Catalog",
    "cropCatalogDesc": "Search and filter detailed parameters of Indian crop varieties.",
    "seasonLabel": "Season",
    "allSeasons": "All Seasons",
    "searchCropPlaceholder": "Search crop by name or scientific term...",
    "waterNeed": "Water Need",
    "expectedYield": "Expected Yield",
    "govtMsp": "Govt MSP",
    "suitableSoils": "Suitable Soils",
    "noSoilsMapped": "No Soils Mapped",
    "stateLabel": "State",
    "diseasesDetails": "Diseases & Details",
    "noCropsFound": "No crops found matching the criteria.",
    "stateSuitabilityMap": "State Suitability Map",
    "stateSuitabilityMapDesc": "Explore climate details and mapped primary crop varieties for each region.",
    "searchStatePlaceholder": "Search state...",
    "noStatesMatching": "No states matching that search.",
    "climateZone": "Climate Zone",
    "liveWeather": "Live Weather",
    "wind": "wind",
    "windSpeed": "Wind Speed",
    "agriculturalOverview": "Agricultural Overview",
    "majorCropsCultivated": "Major Crops Cultivated",
    "waterSuffix": "Water",
    "noCropsMapped": "No crops mapped for this state yet.",
    "selectStateLeft": "Select a state on the left to see details.",
    "details": "Details",
    "seasonality": "Seasonality",
    "originState": "Origin State",
    "waterRequirement": "Water requirement",
    "govtSupportPriceMsp": "Govt Support Price (MSP)",
    "knownDiseases": "Known Crop Pathogens & Diseases",
    "symptomsLabel": "Symptoms",
    "viewTreatment": "View Treatment",
    "noDiseasesMapped": "No disease mappings currently added for this crop.",
    "searchSupportedCrops": "Search supported crops...",
    "noSupportedCropsFound": "No Supported Crops Found",
    "tryAdjustingSearch": "Try adjusting your search query or season filter.",
    "minimumSupportPrice": "Minimum Support Price",
    "govtBacked": "Govt Backed",
    "waterRequirementLabel": "Water Requirement",
    "averageYield": "Average Yield",
    "viewDetailedGuide": "View Detailed Guide & Diseases",
    "cropTrendLine": "Crop Trend Line",
    "hist": "Hist",
    "base": "Base",
    "pred": "Pred",
    "predictedPrices": "Predicted Prices",
    "noPredictionData": "No prediction data available.",
    "liveMandiPricesPrefix": "Live Mandi Prices",
    "updatesLive": "Updates live",
    "standardQuality": "Standard Quality",
    "stable": "Stable",
    "loadingLivePrices": "Loading live prices...",
    "runningMlModel": "Running ML Trend Model...",
    "bestCropOf": "Best Crop of",
    "seasonPrefix": "Season",
    "predictedGrowth": "Predicted Growth"
}

def get_translations():
    prompt = f"""
    Translate the following list of English strings into Hindi (hi), Telugu (te), and Marathi (mr).
    Ensure accurate, contextually relevant agricultural translations.
    
    Return the result STRICTLY as a JSON object of this structure:
    {{
      "te": {{ "key": "Telugu translation" }},
      "hi": {{ "key": "Hindi translation" }},
      "mr": {{ "key": "Marathi translation" }}
    }}
    
    Do NOT include markdown block or ```json tags.
    
    Keys to translate:
    {json.dumps(english_keys, ensure_ascii=False, indent=2)}
    """
    messages = [{"role": "user", "content": prompt}]
    res = call_azure_openai(messages, temperature=0.1).strip()
    if res.startswith("```"):
        res = "\n".join(res.split("\n")[1:])
    if res.endswith("```"):
        res = "\n".join(res.split("\n")[:-1])
    return json.loads(res.strip())

def main():
    print("Calling Azure OpenAI to translate layout labels...")
    translations = get_translations()
    print("Got translations successfully.")
    
    file_path = "frontend/src/App.jsx"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Split into translations block and layout block
    split_marker = "const STATE_COORDINATES = {"
    marker_pos = content.find(split_marker)
    if marker_pos == -1:
        print("Error: Could not find split marker!")
        return

    # Construct complete translations dictionary by merging base and new translations
    full_translations = {}
    for lang in ["en", "te", "hi", "mr"]:
        base_dict = base_translations[lang]
        new_dict = english_keys if lang == "en" else translations[lang]
        
        merged = {}
        merged.update(base_dict)
        merged.update(new_dict)
        full_translations[lang] = merged

    # Write translations to translations.json
    translations_path = "frontend/src/translations.json"
    with open(translations_path, "w", encoding="utf-8") as tf:
        json.dump(full_translations, tf, ensure_ascii=False, indent=2)
    print("Wrote translations to translations.json")

    # Perform text replacements for JSX elements in the layout block
    layout_block = content[marker_pos:]
    translations_block = content[:marker_pos]

    layout_block = layout_block.replace("Browse Crop Catalog", "{t('browseCropCatalog')}")
    layout_block = layout_block.replace("Explore State Suitability", "{t('exploreStateSuitability')}")
    layout_block = layout_block.replace('<h3 className="text-lg font-extrabold text-gray-900">Crop Catalog</h3>', '<h3 className="text-lg font-extrabold text-gray-900">{t(\'cropCatalog\')}</h3>')
    layout_block = layout_block.replace("Search and filter detailed parameters of Indian crop varieties.", "{t('cropCatalogDesc')}")
    layout_block = layout_block.replace('className="text-xs font-bold text-gray-500 uppercase">Season:', 'className="text-xs font-bold text-gray-500 uppercase">{t(\'seasonLabel\')}:')
    layout_block = layout_block.replace('value="All">All Seasons', 'value="All">{t(\'allSeasons\')}')
    layout_block = layout_block.replace('placeholder="Search crop by name or scientific term..."', 'placeholder={t(\'searchCropPlaceholder\')}')
    layout_block = layout_block.replace("Water Need", "{t('waterNeed')}")
    layout_block = layout_block.replace("Expected Yield", "{t('expectedYield')}")
    layout_block = layout_block.replace("Govt MSP", "{t('govtMsp')}")
    layout_block = layout_block.replace("Suitable Soils", "{t('suitableSoils')}")
    layout_block = layout_block.replace("No Soils Mapped", "{t('noSoilsMapped')}")
    layout_block = layout_block.replace("State: <strong", "{t('stateLabel')}: <strong")
    layout_block = layout_block.replace("Diseases & Details", "{t('diseasesDetails')}")
    layout_block = layout_block.replace("No crops found matching the criteria.", "{t('noCropsFound')}")
    
    layout_block = layout_block.replace('<h3 className="text-lg font-extrabold text-gray-900">State Suitability Map</h3>', '<h3 className="text-lg font-extrabold text-gray-900">{t(\'stateSuitabilityMap\')}</h3>')
    layout_block = layout_block.replace("Explore climate details and mapped primary crop varieties for each region.", "{t('stateSuitabilityMapDesc')}")
    layout_block = layout_block.replace('placeholder="Search state..."', 'placeholder={t(\'searchStatePlaceholder\')}')
    layout_block = layout_block.replace("No states matching that search.", "{t('noStatesMatching')}")
    layout_block = layout_block.replace("Climate Zone: {stateDetail.climate}", "{t('climateZone')}: {stateDetail.climate}")
    layout_block = layout_block.replace("Live Weather", "{t('liveWeather')}")
    layout_block = layout_block.replace("Wind speed: {dashboardWeather.windspeed} km/h", "{t('windSpeed')}: {dashboardWeather.windspeed} km/h")
    layout_block = layout_block.replace("km/h wind", "km/h {t('wind')}")
    layout_block = layout_block.replace("Agricultural Overview", "{t('agriculturalOverview')}")
    layout_block = layout_block.replace("Major Crops Cultivated", "{t('majorCropsCultivated')}")
    layout_block = layout_block.replace("{c.water_requirement} Water", "{c.water_requirement} {t('waterSuffix')}")
    layout_block = layout_block.replace("No crops mapped for this state yet.", "{t('noCropsMapped')}")
    layout_block = layout_block.replace("Select a state on the left to see details.", "{t('selectStateLeft')}")
    
    layout_block = layout_block.replace("Details</h3>", "{t('details')}</h3>")
    layout_block = layout_block.replace("Seasonality", "{t('seasonality')}")
    layout_block = layout_block.replace("Origin State", "{t('originState')}")
    layout_block = layout_block.replace("Water requirement", "{t('waterRequirement')}")
    layout_block = layout_block.replace("Govt Support Price (MSP)", "{t('govtSupportPriceMsp')}")
    layout_block = layout_block.replace("Known Crop Pathogens & Diseases", "{t('knownDiseases')}")
    layout_block = layout_block.replace("Symptoms:", "{t('symptomsLabel')}:")
    layout_block = layout_block.replace("View Treatment", "{t('viewTreatment')}")
    layout_block = layout_block.replace("No disease mappings currently added for this crop.", "{t('noDiseasesMapped')}")
    
    layout_block = layout_block.replace('placeholder="Search supported crops..."', 'placeholder={t(\'searchSupportedCrops\')}')
    layout_block = layout_block.replace("No Supported Crops Found", "{t('noSupportedCropsFound')}")
    layout_block = layout_block.replace("Try adjusting your search query or season filter.", "{t('tryAdjustingSearch')}")
    layout_block = layout_block.replace("Minimum Support Price", "{t('minimumSupportPrice')}")
    layout_block = layout_block.replace("Govt Backed", "{t('govtBacked')}")
    layout_block = layout_block.replace("Water Requirement:", "{t('waterRequirementLabel')}:")
    layout_block = layout_block.replace("Average Yield:", "{t('averageYield')}:")
    layout_block = layout_block.replace("View Detailed Guide & Diseases", "{t('viewDetailedGuide')}")
    
    layout_block = layout_block.replace("Crop Trend Line:", "{t('cropTrendLine')}:")
    layout_block = layout_block.replace(" Hist</span>", " {t('hist')}</span>")
    layout_block = layout_block.replace(" Base</span>", " {t('base')}</span>")
    layout_block = layout_block.replace(" Pred</span>", " {t('pred')}</span>")
    layout_block = layout_block.replace("Predicted Prices ({selectedMspYear}):", "{t('predictedPrices')} ({selectedMspYear}):")
    layout_block = layout_block.replace("No prediction data available.", "{t('noPredictionData')}")
    layout_block = layout_block.replace("Live Mandi Prices: {selectedCrop.crop_name}", "{t('liveMandiPricesPrefix')}: {selectedCrop.crop_name}")
    layout_block = layout_block.replace("Updates live", "{t('updatesLive')}")
    layout_block = layout_block.replace("Standard Quality", "{t('standardQuality')}")
    layout_block = layout_block.replace("'Stable'", "t('stable')")
    layout_block = layout_block.replace("Loading live prices...", "{t('loadingLivePrices')}")
    layout_block = layout_block.replace("Running ML Trend Model...", "{t('runningMlModel')}")
    layout_block = layout_block.replace("Best Crop of {selectedMspYear}", "{t('bestCropOf')} {selectedMspYear}")
    layout_block = layout_block.replace("Season: {mspPredictionsData.best_crop.season}", "{t('seasonPrefix')}: {mspPredictionsData.best_crop.season}")
    layout_block = layout_block.replace("Predicted Growth", "{t('predictedGrowth')}")

    # Re-apply Change 1: useEffect Axios language synchronization and cache refresh
    axios_sync_effect = """  // Sync axios language parameter and re-fetch core data when language changes
  useEffect(() => {
    i18n.changeLanguage(language);
    axios.defaults.params = { ...axios.defaults.params, lang: language };
    
    // Clear details cache to force re-fetch in the new language
    setStateDetailsCache({});
    
    // If we've already fetched the initial core data, re-fetch it in the new language
    if (states.length > 0) {
      fetchCoreData();
      
      // If a crop or disease modal detail was open, update it
      if (selectedCropDetail) {
        handleCropClick(selectedCropDetail.id);
      }
      if (selectedDiseaseDetail) {
        handleDiseaseClick(selectedDiseaseDetail.id);
      }
      
      // If we are currently displaying state details, re-fetch that too
      if (selectedStateId) {
        axios.get(`${API_BASE_URL}/states/${selectedStateId}`)
          .then(res => {
            setStateDetailsCache(prev => ({ ...prev, [selectedStateId]: res.data }));
            setStateDetail(res.data);
          })
          .catch(err => console.error(err));
      }
    }
  }, [language]);"""

    target_disease_click = """  const handleDiseaseClick = (diseaseId) => {
    axios.get(`${API_BASE_URL}/diseases/${diseaseId}`)
      .then(res => {
        setSelectedDiseaseDetail(res.data);
      })
      .catch(err => console.error(err));
  };"""

    layout_block = layout_block.replace(target_disease_click, target_disease_click + "\n\n" + axios_sync_effect)

    # Re-apply Change 2: Include language in scheduler submission
    target_scheduler_form = """      const response = await axios.post(`${API_BASE_URL}/gemini/schedule`, schedulerForm);"""
    replacement_scheduler_form = """      const response = await axios.post(`${API_BASE_URL}/gemini/schedule`, { ...schedulerForm, language });"""
    layout_block = layout_block.replace(target_scheduler_form, replacement_scheduler_form)

    # Reassemble and write back
    new_content = translations_block + layout_block
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully patched App.jsx safely without dictionary corruption.")

if __name__ == "__main__":
    main()
