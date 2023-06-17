const { ipcRenderer } = require('electron');
const tesseract = require("node-tesseract-ocr")
const fs = require('fs');
const path = require('path');
const os = require('os');

async function startScript() {
    try {
        const status = await ipcRenderer.invoke('startScript');
    }
    catch (error) {
        console.log(error);
    }
}

const displayBtn = document.getElementById('selectDisplay');
displayBtn.onclick = startScript;

ipcRenderer.on('logMessage', (event, message) => {
    console.log(message);
});
