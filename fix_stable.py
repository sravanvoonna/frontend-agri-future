file_path = "frontend/src/App.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace invalid syntax with valid JS expression
content = content.replace("'{t('stable')}'", "t('stable')")
content = content.replace('"{t(\'stable\')}"', "t('stable')")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully fixed stable text syntax in App.jsx.")
