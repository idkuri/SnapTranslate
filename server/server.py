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
        print(f"Request data: {request.form.get('from'), request.form.get('to')}")

        from_lang = request.form.get('from')
        to_lang = request.form.get('to')

        image_data = request.files['image'].read()
        image_mime_type = request.files['image'].content_type
        image = types.Part.from_bytes(data=image_data, mime_type=image_mime_type)

        response = client.models.generate_content(
            model="gemma-3-12b-it",
            contents=[image, f"Translate this image from {from_lang} to {to_lang}, only give me the original content and the translated content with no explanations in a format like this: '<original text>\n\n<translated text>'"],
        )

        return_data = response.text.split("\n\n")
        original_text = return_data[0].strip()
        translated_text = return_data[1].strip()

        return jsonify({"original": original_text, "translation": translated_text}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
