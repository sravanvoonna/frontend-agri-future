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

    translations_block = content[:marker_pos]
    layout_block = content[marker_pos:]

    # 1. Update TRANSLATIONS in the translations block
    for lang in ["en", "te", "hi", "mr"]:
        lang_dict = english_keys if lang == "en" else translations[lang]
        
        search_pattern = rf"({lang}:\s*\{{)"
        match = re.search(search_pattern, translations_block)
        if match:
            start_pos = match.end()
            lines_to_insert = "\n"
            for k, v in lang_dict.items():
                escaped_v = v.replace('"', '\\"')
                lines_to_insert += f'    {k}: "{escaped_v}",\n'
            
            translations_block = translations_block[:start_pos] + lines_to_insert + translations_block[start_pos:]
            print(f"Patched {lang} translation block.")
        else:
            print(f"Could not find block for {lang}")

    # 2. Perform text replacements for JSX elements in the layout block
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
    layout_block = layout_block.replace("wind", "{t('wind')}")
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
    layout_block = layout_block.replace(" Hist", " {t('hist')}")
    layout_block = layout_block.replace(" Base", " {t('base')}")
    layout_block = layout_block.replace(" Pred", " {t('pred')}")
    layout_block = layout_block.replace("Predicted Prices ({selectedMspYear}):", "{t('predictedPrices')} ({selectedMspYear}):")
    layout_block = layout_block.replace("No prediction data available.", "{t('noPredictionData')}")
    layout_block = layout_block.replace("Live Mandi Prices: {selectedCrop.crop_name}", "{t('liveMandiPricesPrefix')}: {selectedCrop.crop_name}")
    layout_block = layout_block.replace("Updates live", "{t('updatesLive')}")
    layout_block = layout_block.replace("Standard Quality", "{t('standardQuality')}")
    layout_block = layout_block.replace("Stable", "{t('stable')}")
    layout_block = layout_block.replace("Loading live prices...", "{t('loadingLivePrices')}")
    layout_block = layout_block.replace("Running ML Trend Model...", "{t('runningMlModel')}")
    layout_block = layout_block.replace("Best Crop of {selectedMspYear}", "{t('bestCropOf')} {selectedMspYear}")
    layout_block = layout_block.replace("Season: {mspPredictionsData.best_crop.season}", "{t('seasonPrefix')}: {mspPredictionsData.best_crop.season}")
    layout_block = layout_block.replace("Predicted Growth", "{t('predictedGrowth')}")

    # Re-apply Change 1: useEffect Axios language synchronization and cache refresh
    axios_sync_effect = """  // Sync axios language parameter and re-fetch core data when language changes
  useEffect(() => {
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
