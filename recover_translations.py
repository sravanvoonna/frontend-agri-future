import json

log_path = r"C:\Users\srava\.gemini\antigravity-ide\brain\6b197d0e-63fa-4d9b-abf7-d566ade5afc5\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if "welcomeHeader" in line and "const TRANSLATIONS" in line:
            pos = line.find("const TRANSLATIONS")
            snippet = line[pos:pos+50000]
            # Replace escaped characters to make it readable
            snippet_clean = snippet.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
            
            with open("recovered_block.txt", "w", encoding="utf-8") as out:
                out.write(snippet_clean)
            print("Successfully wrote recovered_block.txt")
            break
    else:
        print("Could not find TRANSLATIONS block containing welcomeHeader")
