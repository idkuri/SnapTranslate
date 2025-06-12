const fs = require('fs');
const { ipcRenderer } = require('electron');
const path = require('path');

var isDev;
var pyPath;

(async () => {
    isDev =  await ipcRenderer.invoke('isDev');
})();


async function startScript() {
    try {
        console.log(pyPath);
        await ipcRenderer.invoke('startScript');

    }
    catch (error) {
        console.log(error);
    }
}

const displayBtn = document.getElementById('selectDisplay');
displayBtn.onclick = startScript;


ipcRenderer.on('fetchImage', async (event, message) => {
    const imgDisplay = document.getElementById('imageDisplay');
    const imageName = `tmp2211567.png`;
    imgDisplay.style.display = 'block';
    const imagePath = isDev ? imageName : path.join(process.resourcesPath, 'screenshot', imageName)
    const imageBuffer = fs.readFileSync(imagePath);
    
    // console.log(isDev);
    // console.log(path.join(__dirname, '..', '..', `tmp2211567.png?${Date.now()}`))

    const formData = new FormData();
    formData.append('translate_to', 'English');
    formData.append(
        'image', 
        new Blob([imageBuffer], {type: 'image/png'}), 
        imageName
    )
    imgDisplay.src = `${imagePath}?t=${Date.now()}`;


    try {
       const response = await fetch("http://localhost:5000/api/translate", {
            method: 'POST',
            body: formData
        })

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error:', error);
    }
});




// When document has loaded, initialise
document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

window.onbeforeunload = (event) => {
    win.removeAllListeners();
}

function handleWindowControls() {
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", async event => {
        const status = await ipcRenderer.invoke('minimize');
    });

    document.getElementById('max-button').addEventListener("click", async event => {
        const status = await ipcRenderer.invoke('maximize');
        toggleMaxRestoreButtons();
    });

    document.getElementById('restore-button').addEventListener("click", async  event => {
        const status = await ipcRenderer.invoke('unmaximize');
        toggleMaxRestoreButtons();
    });

    document.getElementById('close-button').addEventListener("click", async event => {
        const status = await ipcRenderer.invoke('close');
    });

    async function toggleMaxRestoreButtons() {
        const status = await ipcRenderer.invoke('isMaximized')
        console.log(status)
        if (status) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}

