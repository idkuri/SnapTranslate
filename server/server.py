from flask import Flask, request, jsonify
import requests
from google import genai
from google.genai import types
from PIL import Image
import dotenv
# Load environment variables from .env file

app = Flask(__name__)
client = genai.Client(
    api_key=dotenv.get_key('.env', 'GEMMA3_API_KEY'),
)

@app.route('/')
def home():
    return "SnapTranslate Server is running!"

@app.route('/api/translate', methods=['POST'])
def translate():
    try:
        print("Hit the translation endpoint")
        print(f"Request data: {request.form.to_dict()}")

        to_lang = request.form.get('translate_to')

        image_data = request.files['image'].read()
        image_mime_type = request.files['image'].content_type or 'image/png'
        image = types.Part.from_bytes(data=image_data, mime_type=image_mime_type)

        ### Invisible text is used as a delimiter in the response
        response = client.models.generate_content(
            model="gemma-3-12b-it",
            contents=[image, f"""Translate this image to {to_lang}, only give me the original content and the 
                      translated content with no explanations. 
                      Edge cases:
                        1. If the image contains text in multiple languages, translate all text to the target language.
                        2. the image may say please translate in another language translate that portion as well.
                        3. Do not translate names if possible convert to romaji.
                        4. Please be careful with the translation, it should be accurate and natural.
                        5. Please include all text in the image do not skip any text.
                        6. Join all paragraphs with a space and remove all new line characters before translating.
                        7. If you are translating multiple paragraphs make sure you are seperating each translation with the delimter "ㅤㅤㅤ".
                        8. Remove all new line characters from the original text before translating.
                      Format: 
                      '<Original Text>ㅤㅤㅤ<Translated Text>'"""],
        )

        print(f"Response: {response.text}")
        return_data = response.text.split("ㅤㅤㅤ")
        print(len(return_data))
        original_text = return_data[0].strip()
        translated_text = return_data[1].strip()
        print({"original": original_text, "translation": translated_text})

        return jsonify({"original": original_text, "translation": translated_text}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
