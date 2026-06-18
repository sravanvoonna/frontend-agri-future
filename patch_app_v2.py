import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"frontend/src/App.jsx"
if not os.path.exists(file_path):
    print("File not found")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Add search helper variables before the return statement:
return_line_idx = None
for idx, line in enumerate(lines):
    if "return (" in line and "min-h-screen bg-gradient-to-tr" in lines[idx+1]:
        return_line_idx = idx
        break

if return_line_idx is not None:
    search_vars = [
        "  const filteredSearchCrops = crops.filter(c => \n",
        "    c.crop_name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || \n",
        "    (c.scientific_name && c.scientific_name.toLowerCase().includes(globalSearchQuery.toLowerCase()))\n",
        "  );\n",
        "  const filteredSearchSoils = soils.filter(s => \n",
        "    s.soil_name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || \n",
        "    (s.characteristics && s.characteristics.toLowerCase().includes(globalSearchQuery.toLowerCase()))\n",
        "  );\n",
        "  const filteredSearchDiseases = diseases.filter(d => \n",
        "    d.disease_name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || \n",
        "    (d.symptoms && d.symptoms.toLowerCase().includes(globalSearchQuery.toLowerCase()))\n",
        "  );\n",
        "  const filteredSearchChemicals = chemicals.filter(c => \n",
        "    c.chemical_name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || \n",
        "    (c.chemical_type && c.chemical_type.toLowerCase().includes(globalSearchQuery.toLowerCase()))\n",
        "  );\n",
        "  const totalSearchResults = filteredSearchCrops.length + filteredSearchSoils.length + filteredSearchDiseases.length + filteredSearchChemicals.length;\n\n"
    ]
    lines = lines[:return_line_idx] + search_vars + lines[return_line_idx:]
    print("Injected search variables.")
else:
    print("Could not find return statement!")

# 2. Add 'gov-schemes' tab to the sidebar navigation list:
gov_msp_idx = None
for idx, line in enumerate(lines):
    if "id: 'gov-msp'" in line:
        gov_msp_idx = idx
        break

if gov_msp_idx is not None:
    lines.insert(gov_msp_idx + 1, "            { id: 'gov-schemes', label: 'Govt Schemes Eligibility', icon: CheckCircle2 },\n")
    print("Injected gov-schemes sidebar tab.")
else:
    print("Could not find gov-msp sidebar tab!")

# 3. Update dashboard search input behavior:
onchange_start_idx = None
for idx, line in enumerate(lines):
    if "setGlobalSearchQuery(e.target.value);" in line and "setAdvSearchQuery(e.target.value);" in lines[idx+1] and "setActiveTab('adv-search');" in lines[idx+2]:
        onchange_start_idx = idx - 1
        break

if onchange_start_idx is not None:
    lines = lines[:onchange_start_idx] + ["                      onChange={(e) => setGlobalSearchQuery(e.target.value)}\n"] + lines[onchange_start_idx+5:]
    print("Updated search input onChange handler.")
else:
    print("Could not find onChange handler block!")

# Change class and add clear search button:
input_idx = None
for idx, line in enumerate(lines):
    if 'placeholder="Quick query..."' in line:
        input_idx = idx
        break

if input_idx is not None:
    for j in range(input_idx, input_idx + 10):
        if 'className="w-full pl-9 pr-4' in lines[j]:
            lines[j] = lines[j].replace('pr-4', 'pr-10')
            lines.insert(j + 2, "                    {globalSearchQuery && (\n                      <button \n                        onClick={() => setGlobalSearchQuery('')}\n                        className=\"absolute right-3 top-2.5 text-gray-400 hover:text-gray-650\"\n                      >\n                        <X className=\"h-4 w-4\" />\n                      </button>\n                    )}\n")
            print("Added clear search button.")
            break

# 4. Integrate search results directly into the dashboard tab container:
dashboard_heading_idx = None
for idx, line in enumerate(lines):
    if "activeTab === 'dashboard'" in line:
        dashboard_heading_idx = idx
        break

if dashboard_heading_idx is not None:
    for j in range(dashboard_heading_idx, dashboard_heading_idx + 15):
        if 'Real-time stats and advisory database' in lines[j]:
            lines[j] = '                    <p className="text-sm text-gray-500 mt-1">\n                      {globalSearchQuery ? `Search results for "${globalSearchQuery}"` : "Real-time stats and advisory database for farming operations."}\n                    </p>\n'
            print("Updated dashboard header title.")
            break

weather_line_idx = None
for idx, line in enumerate(lines):
    if "dashboardWeather && (" in line:
        weather_line_idx = idx
        break

if weather_line_idx is not None:
    search_ui_lines = [
        "                {globalSearchQuery ? (\n",
        "                  <div className=\"space-y-6 animate-fade-in text-left\">\n",
        "                    <div className=\"flex justify-between items-center bg-emerald-50 border border-emerald-150 p-4 rounded-xl\">\n",
        "                      <span className=\"text-xs font-bold text-emerald-800\">\n",
        "                        🔍 Found {totalSearchResults} matching resources across categories.\n",
        "                      </span>\n",
        "                      <button \n",
        "                        onClick={() => setGlobalSearchQuery('')}\n",
        "                        className=\"text-xs text-emerald-700 hover:text-emerald-950 font-black flex items-center\"\n",
        "                      >\n",
        "                        Clear Results\n",
        "                      </button>\n",
        "                    </div>\n\n",
        "                    <div className=\"space-y-6\">\n",
        "                      {/* Crops Results */}\n",
        "                      {filteredSearchCrops.length > 0 && (\n",
        "                        <div className=\"space-y-2.5\">\n",
        "                          <h3 className=\"text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center\">\n",
        "                            <Sprout className=\"h-4 w-4 mr-1.5 text-emerald-600\" /> Crops ({filteredSearchCrops.length})\n",
        "                          </h3>\n",
        "                          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n",
        "                            {filteredSearchCrops.map(c => (\n",
        "                              <div key={c.id} className=\"p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center\">\n",
        "                                <div>\n",
        "                                  <h4 className=\"font-extrabold text-base text-gray-900\">{c.crop_name}</h4>\n",
        "                                  <p className=\"text-xs text-gray-400 italic mt-0.5\">{c.scientific_name}</p>\n",
        "                                </div>\n",
        "                                <button\n",
        "                                  onClick={() => { handleCropClick(c.id); setActiveTab('crop-info'); }}\n",
        "                                  className=\"text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center shrink-0 ml-4\"\n",
        "                                >\n",
        "                                  <span>View Crop Profile</span>\n",
        "                                  <ChevronRight className=\"h-3 w-3 ml-0.5\" />\n",
        "                                </button>\n",
        "                              </div>\n",
        "                            ))}\n",
        "                          </div>\n",
        "                        </div>\n",
        "                      )}\n\n",
        "                      {/* Soils Results */}\n",
        "                      {filteredSearchSoils.length > 0 && (\n",
        "                        <div className=\"space-y-2.5 border-t border-gray-100 pt-5\">\n",
        "                          <h3 className=\"text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center\">\n",
        "                            <Database className=\"h-4 w-4 mr-1.5 text-amber-600\" /> Soils ({filteredSearchSoils.length})\n",
        "                          </h3>\n",
        "                          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n",
        "                            {filteredSearchSoils.map(s => (\n",
        "                              <div key={s.id} className=\"p-4 bg-white border border-gray-200 rounded-xl shadow-sm\">\n",
        "                                <h4 className=\"font-extrabold text-base text-gray-900\">{s.soil_name}</h4>\n",
        "                                <p className=\"text-xs text-gray-550 mt-1 line-clamp-2\">{s.characteristics}</p>\n",
        "                                <div className=\"flex justify-between items-center mt-2\">\n",
        "                                  <span className=\"text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block\">\n",
        "                                    pH: {s.ph_range}\n",
        "                                  </span>\n",
        "                                  <button\n",
        "                                    onClick={() => { setActiveTab('soil-info'); }}\n",
        "                                    className=\"text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center shrink-0\"\n",
        "                                  >\n",
        "                                    <span>View Soil Details</span>\n",
        "                                    <ChevronRight className=\"h-3 w-3 ml-0.5\" />\n",
        "                                  </button>\n",
        "                                </div>\n",
        "                              </div>\n",
        "                            ))}\n",
        "                          </div>\n",
        "                        </div>\n",
        "                      )}\n\n",
        "                      {/* Diseases Results */}\n",
        "                      {filteredSearchDiseases.length > 0 && (\n",
        "                        <div className=\"space-y-2.5 border-t border-gray-100 pt-5\">\n",
        "                          <h3 className=\"text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center\">\n",
        "                            <ShieldAlert className=\"h-4 w-4 mr-1.5 text-red-650\" /> Diseases ({filteredSearchDiseases.length})\n",
        "                          </h3>\n",
        "                          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n",
        "                            {filteredSearchDiseases.map(d => (\n",
        "                              <div key={d.id} className=\"p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center\">\n",
        "                                <div className=\"min-w-0\">\n",
        "                                  <h4 className=\"font-extrabold text-base text-gray-900 truncate\">{d.disease_name}</h4>\n",
        "                                  <p className=\"text-xs text-gray-500 mt-0.5 truncate\">{d.symptoms}</p>\n",
        "                                </div>\n",
        "                                <button\n",
        "                                  onClick={() => { handleDiseaseClick(d.id); setActiveTab('disease-mgmt'); }}\n",
        "                                  className=\"text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center shrink-0 ml-4\"\n",
        "                                >\n",
        "                                  <span>Advisory Details</span>\n",
        "                                  <ChevronRight className=\"h-3 w-3 ml-0.5\" />\n",
        "                                </button>\n",
        "                              </div>\n",
        "                            ))}\n",
        "                          </div>\n",
        "                        </div>\n",
        "                      )}\n\n",
        "                      {/* Chemicals Results */}\n",
        "                      {filteredSearchChemicals.length > 0 && (\n",
        "                        <div className=\"space-y-2.5 border-t border-gray-100 pt-5\">\n",
        "                          <h3 className=\"text-sm font-extrabold text-gray-400 uppercase tracking-wider flex items-center\">\n",
        "                            <Sliders className=\"h-4 w-4 mr-1.5 text-purple-600\" /> Chemicals ({filteredSearchChemicals.length})\n",
        "                          </h3>\n",
        "                          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n",
        "                            {filteredSearchChemicals.map(c => (\n",
        "                              <div key={c.id} className=\"p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between\">\n",
        "                                <div className=\"flex justify-between items-start\">\n",
        "                                  <h4 className=\"font-extrabold text-base text-gray-900\">{c.chemical_name}</h4>\n",
        "                                  <span className=\"text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded\">\n",
        "                                    {c.chemical_type}\n",
        "                                  </span>\n",
        "                                </div>\n",
        "                                <div className=\"flex justify-between items-center mt-3 text-xs\">\n",
        "                                  <span className=\"text-gray-500\">Dosage: <strong className=\"text-emerald-700 font-bold\">{c.dosage}</strong></span>\n",
        "                                  <button\n",
        "                                    onClick={() => { handleDiseaseClick(c.disease_id); setActiveTab('disease-mgmt'); }}\n",
        "                                    className=\"text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center\"\n",
        "                                  >\n",
        "                                    <span>Target Disease</span>\n",
        "                                    <ChevronRight className=\"h-3 w-3 ml-0.5\" />\n",
        "                                  </button>\n",
        "                                </div>\n",
        "                              </div>\n",
        "                            ))}\n",
        "                          </div>\n",
        "                        </div>\n",
        "                      )}\n\n",
        "                      {totalSearchResults === 0 && (\n",
        "                        <div className=\"bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-450 italic\">\n",
        "                          <Search className=\"h-10 w-10 mx-auto opacity-30 mb-3\" />\n",
        "                          No crops, soils, diseases, or chemical treatments matched \"{globalSearchQuery}\".\n",
        "                        </div>\n",
        "                      )}\n",
        "                    </div>\n",
        "                  </div>\n",
        "                ) : (\n",
        "                  <>\n"
    ]
    lines = lines[:weather_line_idx] + search_ui_lines + lines[weather_line_idx:]
    print("Injected search UI results container.")

state_select_idx = None
for idx, line in enumerate(lines):
    if "activeTab === 'state-select'" in line:
        state_select_idx = idx
        break

if state_select_idx is not None:
    for j in range(state_select_idx - 1, state_select_idx - 25, -1):
        if lines[j].strip() == ")}":
            lines.insert(j, "                  </>\n                )}\n")
            print("Closed search results conditional block.")
            break

# 5. Extract Govt Scheme Eligibility Wizard Card from 'gov-msp'
card_start_idx = None
card_end_idx = None
for idx, line in enumerate(lines):
    if "Govt Scheme Eligibility Wizard Card" in line:
        card_start_idx = idx
    if card_start_idx is not None and card_end_idx is None:
        if "Procurement Guidelines" in line and "Sider Card" in line:
            for j in range(idx - 1, card_start_idx, -1):
                if lines[j].strip() == "</div>" and lines[j-1].strip() == ")}":
                    card_end_idx = j + 2
                    break
            break

if card_start_idx is not None and card_end_idx is not None:
    print(f"Extracting wizard card from indices {card_start_idx} to {card_end_idx}")
    del lines[card_start_idx:card_end_idx]
    print("Removed eligibility wizard from gov-msp view.")

# 6. Insert the new full-page 'gov-schemes' tab view right before the 'soil-info' view:
soil_info_idx = None
for idx, line in enumerate(lines):
    if "activeTab === 'soil-info'" in line:
        soil_info_idx = idx
        break

if soil_info_idx is not None:
    for j in range(soil_info_idx - 1, soil_info_idx - 10, -1):
        if "SOIL INFORMATION MODULE" in lines[j]:
            soil_info_idx = j
            break
            
    gov_schemes_view = [
        "            {/* 4b. GOVT SCHEMES ELIGIBILITY MODULE */}\n",
        "            {activeTab === 'gov-schemes' && (\n",
        "              <div className=\"space-y-6\">\n",
        "                <div>\n",
        "                  <h2 className=\"text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight\">Government Schemes Eligibility</h2>\n",
        "                  <p className=\"text-sm text-gray-500 mt-1\">Interactive wizard to match your farm parameters with current central government subsidy schemes.</p>\n",
        "                </div>\n\n",
        "                <div className=\"max-w-3xl bg-white rounded-2xl border border-gray-200 p-8 shadow-md mx-auto text-left space-y-6 animate-fade-in\">\n",
        "                  <div className=\"border-b border-gray-100 pb-3\">\n",
        "                    <h3 className=\"font-extrabold text-lg text-gray-900 flex items-center\">\n",
        "                      <TrendingUp className=\"h-5 w-5 text-emerald-600 mr-2\" />\n",
        "                      Govt Scheme Eligibility Helper\n",
        "                    </h3>\n",
        "                    <p className=\"text-xs text-gray-500 mt-1\">Verify your eligibility for Central Government agricultural subsidies and support schemes.</p>\n",
        "                  </div>\n\n",
        "                  {/* Stepper display */}\n",
        "                  {schemeStep < 4 && (\n",
        "                    <div className=\"flex items-center justify-between text-xs font-black text-gray-450 border-b border-gray-100 pb-3 mb-4\">\n",
        "                      <span className={schemeStep === 1 ? \"text-emerald-700 font-black\" : \"\"}>1. Land size</span>\n",
        "                      <span>➔</span>\n",
        "                      <span className={schemeStep === 2 ? \"text-emerald-700 font-black\" : \"\"}>2. Crops</span>\n",
        "                      <span>➔</span>\n",
        "                      <span className={schemeStep === 3 ? \"text-emerald-700 font-black\" : \"\"}>3. Irrigation</span>\n",
        "                    </div>\n",
        "                  )}\n\n",
        "                  {/* Step 1 */}\n",
        "                  {schemeStep === 1 && (\n",
        "                    <div className=\"space-y-5\">\n",
        "                      <span className=\"text-xs font-extrabold text-gray-500 uppercase tracking-wider block\">Step 1: Choose Your Landholding Size</span>\n",
        "                      <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4\">\n",
        "                        {[\n",
        "                          { value: 'Marginal', label: 'Marginal (< 1 Ha)', desc: 'Very small landholding. Eligible for maximum support.' },\n",
        "                          { value: 'Small', label: 'Small (1-2 Ha)', desc: 'Small size landholder. Eligible for PM-KISAN.' },\n",
        "                          { value: 'Large', label: 'Medium/Large (> 2 Ha)', desc: 'Medium or large farming operations.' }\n",
        "                        ].map((opt) => (\n",
        "                          <button\n",
        "                            key={opt.value}\n",
        "                            type=\"button\"\n",
        "                            onClick={() => setSchemeLandSize(opt.value)}\n",
        "                            className={`p-4 border rounded-xl text-left space-y-1 transition-all ${\n",
        "                              schemeLandSize === opt.value\n",
        "                                ? 'border-emerald-500 bg-emerald-50/55 ring-2 ring-emerald-100'\n",
        "                                : 'border-gray-250 hover:border-gray-350'\n",
        "                            }`}\n",
        "                          >\n",
        "                            <span className=\"font-extrabold text-xs text-gray-900 block\">{opt.label}</span>\n",
        "                            <span className=\"text-[10px] text-gray-400 block font-semibold\">{opt.desc}</span>\n",
        "                          </button>\n",
        "                        ))}\n",
        "                      </div>\n",
        "                      <div className=\"pt-3 flex justify-end\">\n",
        "                        <button\n",
        "                          onClick={() => setSchemeStep(2)}\n",
        "                          className=\"bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1\"\n",
        "                        >\n",
        "                          <span>Next Step</span>\n",
        "                          <ChevronRight className=\"h-4 w-4\" />\n",
        "                        </button>\n",
        "                      </div>\n",
        "                    </div>\n",
        "                  )}\n\n",
        "                  {/* Step 2 */}\n",
        "                  {schemeStep === 2 && (\n",
        "                    <div className=\"space-y-5\">\n",
        "                      <span className=\"text-xs font-extrabold text-gray-500 uppercase tracking-wider block\">Step 2: Crop Categories Cultivated</span>\n",
        "                      <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4\">\n",
        "                        {[\n",
        "                          { value: 'Foodgrains', label: 'Foodgrains & Pulses', desc: 'Rice, wheat, millets, pulses, etc.' },\n",
        "                          { value: 'Oilseeds', label: 'Oilseeds Varieties', desc: 'Mustard, groundnut, soybean, sunflower.' },\n",
        "                          { value: 'Commercial', label: 'Commercial / Cash Crops', desc: 'Sugarcane, cotton, jute, horticulture.' }\n",
        "                        ].map((opt) => (\n",
        "                          <button\n",
        "                            key={opt.value}\n",
        "                            type=\"button\"\n",
        "                            onClick={() => setSchemeCropsType(opt.value)}\n",
        "                            className={`p-4 border rounded-xl text-left space-y-1 transition-all ${\n",
        "                              schemeCropsType === opt.value\n",
        "                                ? 'border-emerald-500 bg-emerald-50/55 ring-2 ring-emerald-100'\n",
        "                                : 'border-gray-250 hover:border-gray-350'\n",
        "                            }`}\n",
        "                          >\n",
        "                            <span className=\"font-extrabold text-xs text-gray-900 block\">{opt.label}</span>\n",
        "                            <span className=\"text-[10px] text-gray-400 block font-semibold\">{opt.desc}</span>\n",
        "                          </button>\n",
        "                        ))}\n",
        "                      </div>\n",
        "                      <div className=\"pt-3 flex justify-between\">\n",
        "                        <button\n",
        "                          onClick={() => setSchemeStep(1)}\n",
        "                          className=\"border border-gray-250 text-gray-700 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-all\"\n",
        "                        >\n",
        "                          Back\n",
        "                        </button>\n",
        "                        <button\n",
        "                          onClick={() => setSchemeStep(3)}\n",
        "                          className=\"bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1\"\n",
        "                        >\n",
        "                          <span>Next Step</span>\n",
        "                          <ChevronRight className=\"h-4 w-4\" />\n",
        "                        </button>\n",
        "                      </div>\n",
        "                    </div>\n",
        "                  )}\n\n",
        "                  {/* Step 3 */}\n",
        "                  {schemeStep === 3 && (\n",
        "                    <div className=\"space-y-5\">\n",
        "                      <span className=\"text-xs font-extrabold text-gray-500 uppercase tracking-wider block\">Step 3: Primary Irrigation Source</span>\n",
        "                      <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-4\">\n",
        "                        {[\n",
        "                          { value: 'Rainfed', label: 'Rainfed / Natural Climate', desc: 'Depending solely on monsoon rains. Traditional practices.' },\n",
        "                          { value: 'BorewellDrip', label: 'Borewell / Tube-well / Drip system', desc: 'Active groundwater extraction or micro-irrigation system.' }\n",
        "                        ].map((opt) => (\n",
        "                          <button\n",
        "                            key={opt.value}\n",
        "                            type=\"button\"\n",
        "                            onClick={() => setSchemeIrrigation(opt.value)}\n",
        "                            className={`p-4 border rounded-xl text-left space-y-1 transition-all ${\n",
        "                              schemeIrrigation === opt.value\n",
        "                                ? 'border-emerald-500 bg-emerald-50/55 ring-2 ring-emerald-100'\n",
        "                                : 'border-gray-250 hover:border-gray-350'\n",
        "                            }`}\n",
        "                          >\n",
        "                            <span className=\"font-extrabold text-xs text-gray-900 block\">{opt.label}</span>\n",
        "                            <span className=\"text-[10px] text-gray-400 block font-semibold\">{opt.desc}</span>\n",
        "                          </button>\n",
        "                        ))}\n",
        "                      </div>\n",
        "                      <div className=\"pt-3 flex justify-between\">\n",
        "                        <button\n",
        "                          onClick={() => setSchemeStep(2)}\n",
        "                          className=\"border border-gray-250 text-gray-700 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-all\"\n",
        "                        >\n",
        "                          Back\n",
        "                        </button>\n",
        "                        <button\n",
        "                          onClick={() => setSchemeStep(4)}\n",
        "                          className=\"bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1\"\n",
        "                        >\n",
        "                          <span>Calculate Eligibility</span>\n",
        "                          <ChevronRight className=\"h-4 w-4\" />\n",
        "                        </button>\n",
        "                      </div>\n",
        "                    </div>\n",
        "                  )}\n\n",
        "                  {/* Step 4: Results */}\n",
        "                  {schemeStep === 4 && (\n",
        "                    <div className=\"space-y-5\">\n",
        "                      <span className=\"text-xs font-extrabold text-gray-500 uppercase tracking-wider block\">Matched Government Schemes:</span>\n\n",
        "                      {(() => {\n",
        "                        const eligibleSchemes = [];\n\n",
        "                        if (schemeLandSize === 'Marginal' || schemeLandSize === 'Small') {\n",
        "                          eligibleSchemes.push({\n",
        "                            name: \"PM-KISAN Samman Nidhi\",\n",
        "                            benefit: \"₹6,000 per year direct income support paid in 3 installments.\",\n",
        "                            desc: \"Designed to help marginal and small farmers cover input cultivation costs.\"\n",
        "                          });\n",
        "                        }\n\n",
        "                        if (schemeIrrigation === 'BorewellDrip' || schemeLandSize === 'Small' || schemeLandSize === 'Marginal') {\n",
        "                          eligibleSchemes.push({\n",
        "                            name: \"PMKSY (Micro-Irrigation Subsidy)\",\n",
        "                            benefit: \"55% to 80% capital subsidy on installing drip & sprinkler tubes.\",\n",
        "                            desc: \"Improves water efficiency. High recommendation for cash crop growers.\"\n",
        "                          });\n",
        "                        }\n\n",
        "                        eligibleSchemes.push({\n",
        "                          name: \"PM Fasal Bima Yojana (PMFBY)\",\n",
        "                          benefit: \"Comprehensive crop insurance with nominal premium (1.5% - 5%).\",\n",
        "                          desc: \"Protects against yield losses from pests, droughts, storms, or floods.\"\n",
        "                        });\n\n",
        "                        if (schemeCropsType !== 'Commercial' && (schemeLandSize === 'Marginal' || schemeLandSize === 'Small')) {\n",
        "                          eligibleSchemes.push({\n",
        "                            name: \"Paramparagat Krishi Vikas Yojana (PKVY)\",\n",
        "                            benefit: \"₹50,000 assistance per hectare for organic inputs & packaging.\",\n",
        "                            desc: \"Supports clusters of small farmers converting to chemical-free organic farming.\"\n",
        "                          });\n",
        "                        }\n\n",
        "                        return (\n",
        "                          <div className=\"space-y-4\">\n",
        "                            {eligibleSchemes.map((sch, sIdx) => (\n",
        "                              <div key={sIdx} className=\"bg-emerald-50/50 border border-emerald-150 rounded-xl p-5 space-y-2 text-xs\">\n",
        "                                <h5 className=\"font-extrabold text-emerald-900 text-sm flex items-center justify-between\">\n",
        "                                  {sch.name}\n",
        "                                  <span className=\"bg-emerald-200 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-300/30\">\n",
        "                                    Eligible\n",
        "                                  </span>\n",
        "                                </h5>\n",
        "                                <p className=\"text-emerald-700 font-bold text-xs\">🛡️ {sch.benefit}</p>\n",
        "                                <p className=\"text-gray-655 text-xs leading-relaxed\">{sch.desc}</p>\n",
        "                                <div className=\"pt-2 flex justify-end\">\n",
        "                                  <a\n",
        "                                    href=\"https://pmkisan.gov.in/\"\n",
        "                                    target=\"_blank\"\n",
        "                                    rel=\"noreferrer\"\n",
        "                                    className=\"px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all\"\n",
        "                                  >\n",
        "                                    Apply Now\n",
        "                                  </a>\n",
        "                                </div>\n",
        "                              </div>\n",
        "                            ))}\n",
        "                          </div>\n",
        "                        );\n",
        "                      })()}\n\n",
        "                      <div className=\"flex justify-center border-t border-gray-150 pt-5\">\n",
        "                        <button\n",
        "                          onClick={() => {\n",
        "                            setSchemeStep(1);\n",
        "                            setSchemeLandSize('Marginal');\n",
        "                            setSchemeCropsType('Foodgrains');\n",
        "                            setSchemeIrrigation('Rainfed');\n",
        "                          }}\n",
        "                          className=\"bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-sm\"\n",
        "                        >\n",
        "                          Check Again / Restart\n",
        "                        </button>\n",
        "                      </div>\n",
        "                    </div>\n",
        "                  )}\n",
        "                </div>\n",
        "              </div>\n",
        "            )}\n\n"
    ]
    lines = lines[:soil_info_idx] + gov_schemes_view + lines[soil_info_idx:]
    print("Added govt-schemes activeTab container.")

# Write results
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Writing complete.")
