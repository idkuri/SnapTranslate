const { ipcRenderer } = require('electron');
const tesseract = require("node-tesseract-ocr")
const fs = require('fs');
const path = require('path');
const os = require('os');

async function startScript() {
    try {
        await ipcRenderer.invoke('startScript');

    }
    catch (error) {
        console.log(error);
    }
}

const displayBtn = document.getElementById('selectDisplay');
displayBtn.onclick = startScript;


ipcRenderer.on('fetchImage', (event, message) => {
    console.log("EEEE")
    const imgDisplay = document.getElementById('imageDisplay');
    imgDisplay.style.display = 'block';
    imgDisplay.src = `photo.png?${Date.now()}`;
});

