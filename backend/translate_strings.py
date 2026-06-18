import os
import json
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

# Load env variables from backend/.env
env_path = os.path.join(os.path.dirname(__file__), ".env")
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

def translate_batch(batch_strings):
    prompt = f"""
    You are an expert translator specializing in agricultural terminology in India.
    Translate the following list of English strings into Hindi (hi), Telugu (te), and Marathi (mr).
    Ensure the translations are accurate, contextually relevant for farmers, and natural.
    
    Return the result STRICTLY as a JSON object where the keys are the original English strings and the values are objects containing the translations:
    {{
      "English string": {{
        "hi": "Hindi translation",
        "te": "Telugu translation",
        "mr": "Marathi translation"
      }}
    }}
    
    Do NOT include any markdown formatting, ```json, or ``` fences. Just return the raw JSON string.
    
    List of strings:
    {json.dumps(batch_strings, ensure_ascii=False, indent=2)}
    """
    
    messages = [
        {"role": "user", "content": prompt}
    ]
    
    try:
        response_text = call_azure_openai(messages, temperature=0.1).strip()
        # Clean response text from markdown code fences if present
        if response_text.startswith("```"):
            response_text = "\n".join(response_text.split("\n")[1:])
        if response_text.endswith("```"):
            response_text = "\n".join(response_text.split("\n")[:-1])
        response_text = response_text.strip()
        
        parsed = json.loads(response_text)
        return parsed
    except Exception as e:
        print(f"Error translating batch: {e}")
        # Return fallback with empty strings
        fallback = {}
        for s in batch_strings:
            fallback[s] = {"hi": s, "te": s, "mr": s}
        return fallback

def main():
    strings_file = os.path.join(os.path.dirname(__file__), "strings_to_translate.json")
    if not os.path.exists(strings_file):
        print(f"Strings file not found: {strings_file}")
        return

    with open(strings_file, "r", encoding="utf-8") as f:
        all_strings = json.load(f)

    print(f"Loaded {len(all_strings)} strings to translate.")
    
    # Chunk strings into batches
    batch_size = 40
    batches = [all_strings[i:i + batch_size] for i in range(0, len(all_strings), batch_size)]
    print(f"Created {len(batches)} batches of size {batch_size}.")

    translations_cache = {}
    
    # Run translations concurrently
    max_workers = 6
    print(f"Starting translation using {max_workers} threads...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(translate_batch, b): i for i, b in enumerate(batches)}
        
        for future in as_completed(futures):
            batch_idx = futures[future]
            try:
                result = future.result()
                translations_cache.update(result)
                print(f"Batch {batch_idx + 1}/{len(batches)} finished successfully. Cache size: {len(translations_cache)}")
            except Exception as e:
                print(f"Batch {batch_idx + 1} generated exception: {e}")

    cache_file = os.path.join(os.path.dirname(__file__), "translations_cache.json")
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(translations_cache, f, ensure_ascii=False, indent=2)
    print(f"Successfully wrote {len(translations_cache)} translations to {cache_file}.")

if __name__ == "__main__":
    main()
