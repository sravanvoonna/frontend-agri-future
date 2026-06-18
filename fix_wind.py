file_path = "frontend/src/App.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Revert window
content = content.replace("{t('wind')}ow", "window")

# Revert windspeed
content = content.replace("{t('wind')}speed", "windspeed")

# Revert translation key mapping in translations dictionary
content = content.replace("    {t('wind')}:", "    wind:")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully fixed window, windspeed, and wind keys in App.jsx.")
