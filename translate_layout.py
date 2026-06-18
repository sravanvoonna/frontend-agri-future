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

def patch_app_jsx(translations):
    file_path = "frontend/src/App.jsx"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update TRANSLATIONS in App.jsx
    for lang in ["en", "te", "hi", "mr"]:
        lang_dict = english_keys if lang == "en" else translations[lang]
        
        # Locate the start of the language object, e.g. "  en: {"
        search_pattern = rf"({lang}:\s*\{{)"
        match = re.search(search_pattern, content)
        if match:
            start_pos = match.end()
            # Construct the lines to insert
            lines_to_insert = "\n"
            for k, v in lang_dict.items():
                escaped_v = v.replace('"', '\\"')
                lines_to_insert += f'    {k}: "{escaped_v}",\n'
            
            content = content[:start_pos] + lines_to_insert + content[start_pos:]
            print(f"Patched {lang} translation block.")
        else:
            print(f"Could not find block for {lang}")

    # 2. Perform text replacements for JSX elements
    replacements = [
        ("Browse Crop Catalog", "{t('browseCropCatalog')}"),
        ("Explore State Suitability", "{t('exploreStateSuitability')}"),
        (">Crop Catalog<", ">{t('cropCatalog')}<"),
        ("Search and filter detailed parameters of Indian crop varieties.", "{t('cropCatalogDesc')}"),
        (">Season:<", ">{t('seasonLabel')}:<"),
        ("All Seasons", "{t('allSeasons')}"),
        ('placeholder="Search crop by name or scientific term..."', 'placeholder={t(\'searchCropPlaceholder\')}'),
        ("Water Need", "{t('waterNeed')}"),
        ("Expected Yield", "{t('expectedYield')}"),
        ("Govt MSP", "{t('govtMsp')}"),
        ("Suitable Soils", "{t('suitableSoils')}"),
        ("No Soils Mapped", "{t('noSoilsMapped')}"),
        ("State: <strong", "{t('stateLabel')}: <strong"),
        ("Diseases & Details", "{t('diseasesDetails')}"),
        ("No crops found matching the criteria.", "{t('noCropsFound')}"),
        ("State Suitability Map", "{t('stateSuitabilityMap')}"),
        ("Explore climate details and mapped primary crop varieties for each region.", "{t('stateSuitabilityMapDesc')}"),
        ('placeholder="Search state..."', 'placeholder={t(\'searchStatePlaceholder\')}'),
        ("No states matching that search.", "{t('noStatesMatching')}"),
        ("Climate Zone: ", "Climate Zone: {" + "t('climateZone')}: "),
        ("Live Weather", "{t('liveWeather')}"),
        ("wind", "{t('wind')}"),
        ("Agricultural Overview", "{t('agriculturalOverview')}"),
        ("Major Crops Cultivated", "{t('majorCropsCultivated')}"),
        (" Water</span>", " \" + t('waterSuffix') + \"</span>\""),
        ("No crops mapped for this state yet.", "{t('noCropsMapped')}"),
        ("Select a state on the left to see details.", "{t('selectStateLeft')}"),
        (" Details</h3>", " \" + t('details') + \"</h3>\""),
        ("Seasonality", "{t('seasonality')}"),
        ("Origin State", "{t('originState')}"),
        ("Water requirement", "{t('waterRequirement')}"),
        ("Govt Support Price (MSP)", "{t('govtSupportPriceMsp')}"),
        ("Known Crop Pathogens & Diseases", "{t('knownDiseases')}"),
        ("Symptoms:", "{t('symptomsLabel')}:"),
        ("View Treatment", "{t('viewTreatment')}"),
        ("No disease mappings currently added for this crop.", "{t('noDiseasesMapped')}"),
        ('placeholder="Search supported crops..."', 'placeholder={t(\'searchSupportedCrops\')}'),
        ("No Supported Crops Found", "{t('noSupportedCropsFound')}"),
        ("Try adjusting your search query or season filter.", "{t('tryAdjustingSearch')}"),
        ("Minimum Support Price", "{t('minimumSupportPrice')}"),
        ("Govt Backed", "{t('govtBacked')}"),
        ("Water Requirement:", "{t('waterRequirementLabel')}:"),
        ("Average Yield:", "{t('averageYield')}:"),
        ("View Detailed Guide & Diseases", "{t('viewDetailedGuide')}"),
        ("Crop Trend Line:", "{t('cropTrendLine')}:"),
        (" Hist", " \" + t('hist') + \"\""),
        (" Base", " \" + t('base') + \"\""),
        (" Pred", " \" + t('pred') + \"\""),
        ("Predicted Prices (", "{t('predictedPrices')} ("),
        ("No prediction data available.", "{t('noPredictionData')}"),
        ("Live Mandi Prices: ", "Live Mandi Prices: "),
        ("Updates live", "{t('updatesLive')}"),
        ("Standard Quality", "{t('standardQuality')}"),
        ("Stable", "{t('stable')}"),
        ("Loading live prices...", "{t('loadingLivePrices')}"),
        ("Running ML Trend Model...", "{t('runningMlModel')}"),
        ("Best Crop of ", "Best Crop of "),
        ("Season: ", "Season: "),
        ("Predicted Growth", "{t('predictedGrowth')}")
    ]

    # Dynamic text replacement that doesn't break syntax
    # Let's perform simple string replacements
    # Since these are distinct literals, it is mostly safe
    
    # We will do some specific regex and literal replacements:
    # 1. Browse Crop Catalog buttons:
    content = content.replace("Browse Crop Catalog", "{t('browseCropCatalog')}")
    content = content.replace("Explore State Suitability", "{t('exploreStateSuitability')}")
    content = content.replace('<h3 className="text-lg font-extrabold text-gray-900">Crop Catalog</h3>', '<h3 className="text-lg font-extrabold text-gray-900">{t(\'cropCatalog\')}</h3>')
    content = content.replace("Search and filter detailed parameters of Indian crop varieties.", "{t('cropCatalogDesc')}")
    content = content.replace('className="text-xs font-bold text-gray-500 uppercase">Season:', 'className="text-xs font-bold text-gray-500 uppercase">{t(\'seasonLabel\')}:')
    content = content.replace('value="All">All Seasons', 'value="All">{t(\'allSeasons\')}')
    content = content.replace('placeholder="Search crop by name or scientific term..."', 'placeholder={t(\'searchCropPlaceholder\')}')
    content = content.replace("Water Need", "{t('waterNeed')}")
    content = content.replace("Expected Yield", "{t('expectedYield')}")
    content = content.replace("Govt MSP", "{t('govtMsp')}")
    content = content.replace("Suitable Soils", "{t('suitableSoils')}")
    content = content.replace("No Soils Mapped", "{t('noSoilsMapped')}")
    content = content.replace("State: <strong", "{t('stateLabel')}: <strong")
    content = content.replace("Diseases & Details", "{t('diseasesDetails')}")
    content = content.replace("No crops found matching the criteria.", "{t('noCropsFound')}")
    
    content = content.replace('<h3 className="text-lg font-extrabold text-gray-900">State Suitability Map</h3>', '<h3 className="text-lg font-extrabold text-gray-900">{t(\'stateSuitabilityMap\')}</h3>')
    content = content.replace("Explore climate details and mapped primary crop varieties for each region.", "{t('stateSuitabilityMapDesc')}")
    content = content.replace('placeholder="Search state..."', 'placeholder={t(\'searchStatePlaceholder\')}')
    content = content.replace("No states matching that search.", "{t('noStatesMatching')}")
    content = content.replace("Climate Zone: {stateDetail.climate}", "{t('climateZone')}: {stateDetail.climate}")
    content = content.replace("Live Weather", "{t('liveWeather')}")
    content = content.replace("wind", "{t('wind')}")
    content = content.replace("Agricultural Overview", "{t('agriculturalOverview')}")
    content = content.replace("Major Crops Cultivated", "{t('majorCropsCultivated')}")
    content = content.replace("{c.water_requirement} Water", "{c.water_requirement} {t('waterSuffix')}")
    content = content.replace("No crops mapped for this state yet.", "{t('noCropsMapped')}")
    content = content.replace("Select a state on the left to see details.", "{t('selectStateLeft')}")
    
    content = content.replace("Details</h3>", "{t('details')}</h3>")
    content = content.replace("Seasonality", "{t('seasonality')}")
    content = content.replace("Origin State", "{t('originState')}")
    content = content.replace("Water requirement", "{t('waterRequirement')}")
    content = content.replace("Govt Support Price (MSP)", "{t('govtSupportPriceMsp')}")
    content = content.replace("Known Crop Pathogens & Diseases", "{t('knownDiseases')}")
    content = content.replace("Symptoms:", "{t('symptomsLabel')}:")
    content = content.replace("View Treatment", "{t('viewTreatment')}")
    content = content.replace("No disease mappings currently added for this crop.", "{t('noDiseasesMapped')}")
    
    content = content.replace('placeholder="Search supported crops..."', 'placeholder={t(\'searchSupportedCrops\')}')
    content = content.replace("No Supported Crops Found", "{t('noSupportedCropsFound')}")
    content = content.replace("Try adjusting your search query or season filter.", "{t('tryAdjustingSearch')}")
    content = content.replace("Minimum Support Price", "{t('minimumSupportPrice')}")
    content = content.replace("Govt Backed", "{t('govtBacked')}")
    content = content.replace("Water Requirement:", "{t('waterRequirementLabel')}:")
    content = content.replace("Average Yield:", "{t('averageYield')}:")
    content = content.replace("View Detailed Guide & Diseases", "{t('viewDetailedGuide')}")
    
    content = content.replace("Crop Trend Line:", "{t('cropTrendLine')}:")
    content = content.replace(" Hist", " {t('hist')}")
    content = content.replace(" Base", " {t('base')}")
    content = content.replace(" Pred", " {t('pred')}")
    content = content.replace("Predicted Prices ({selectedMspYear}):", "{t('predictedPrices')} ({selectedMspYear}):")
    content = content.replace("No prediction data available.", "{t('noPredictionData')}")
    content = content.replace("Live Mandi Prices: {selectedCrop.crop_name}", "{t('liveMandiPricesPrefix')}: {selectedCrop.crop_name}")
    content = content.replace("Updates live", "{t('updatesLive')}")
    content = content.replace("Standard Quality", "{t('standardQuality')}")
    content = content.replace("Stable", "{t('stable')}")
    content = content.replace("Loading live prices...", "{t('loadingLivePrices')}")
    content = content.replace("Running ML Trend Model...", "{t('runningMlModel')}")
    content = content.replace("Best Crop of {selectedMspYear}", "{t('bestCropOf')} {selectedMspYear}")
    content = content.replace("Season: {mspPredictionsData.best_crop.season}", "{t('seasonPrefix')}: {mspPredictionsData.best_crop.season}")
    content = content.replace("Predicted Growth", "{t('predictedGrowth')}")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully patched App.jsx text labels.")

def main():
    print("Calling Azure OpenAI to translate layout labels...")
    translations = get_translations()
    print("Got translations successfully.")
    patch_app_jsx(translations)

if __name__ == "__main__":
    main()
