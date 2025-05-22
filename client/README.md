# **Setup Guide For SnapTranslate Frontend**

**Virtual Environment for Python**
Creating the Virtual Environment:
```bash
python -m venv venv
```
Running the Virtual Environment:
```bash
./venv/Scripts/activate
```

**Install Dependencies**

SnapTranslate uses Node version v22.15.1 please install the appropriate node version.
Type the following into the terminal:
```bash
npm install
pip install -r requirements.txt
```

**Run in development mode**

Type the following into the terminal:
```bash
npm run dev
```

**Building the Project**

Type the following into the terminal:
```bash
npm run build
```
The output is stored in the generated dist directory

If there are existing build files please run before running build:
```bash
npm run clean 
```
