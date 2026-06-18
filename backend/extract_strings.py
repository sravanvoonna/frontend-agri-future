import os
import json
from flask import Flask
from models import db, State, Soil, Crop, Disease, Chemical
from dotenv import load_dotenv

load_dotenv(override=True)

app = Flask(__name__)
db_path = os.path.join(os.path.dirname(__file__), "agriculture.db")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

with app.app_context():
    unique_strings = set()
    
    # 1. States
    for s in State.query.all():
        unique_strings.add(s.state_name)
        unique_strings.add(s.climate)
        unique_strings.add(s.description)
        
    # 2. Soils
    for s in Soil.query.all():
        unique_strings.add(s.soil_name)
        unique_strings.add(s.characteristics)
        unique_strings.add(s.ph_range)
        
    # 3. Crops
    for c in Crop.query.all():
        unique_strings.add(c.crop_name)
        unique_strings.add(c.scientific_name)
        unique_strings.add(c.season)
        unique_strings.add(c.water_requirement)
        unique_strings.add(c.yield_val)
        unique_strings.add(c.msp)
        
    # 4. Diseases
    for d in Disease.query.all():
        unique_strings.add(d.disease_name)
        unique_strings.add(d.symptoms)
        unique_strings.add(d.causes)
        unique_strings.add(d.prevention)
        
    # 5. Chemicals
    for c in Chemical.query.all():
        unique_strings.add(c.chemical_name)
        unique_strings.add(c.chemical_type)
        unique_strings.add(c.dosage)
        unique_strings.add(c.application_method)
        unique_strings.add(c.safety_precautions)

    # Filter out empty/None and numeric/short strings
    filtered = []
    for s in unique_strings:
        if s and not s.isdigit() and len(s.strip()) > 1:
            filtered.append(s.strip())
            
    print(f"Total unique strings to translate: {len(filtered)}")
    # Write them to strings_to_translate.json
    with open("strings_to_translate.json", "w", encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)
    print("Wrote strings_to_translate.json")
