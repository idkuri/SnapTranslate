from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "SnapTranslate Server is running!"


@app.route('/api/translate', methods=['GET', 'POST'])
def translate():
    return {"message": "This is the translation API endpoint."}
