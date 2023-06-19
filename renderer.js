const { ipcRenderer } = require('electron');
const path = require('path');

let isDev;

(async () => {
    isDev =  await ipcRenderer.invoke('isDev');
})();


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
    const imgDisplay = document.getElementById('imageDisplay');
    imgDisplay.style.display = 'block';
    console.log(isDev);
    console.log(path.join(__dirname, '..', '..', `tmp2211567.png?${Date.now()}`))
    imgDisplay.src = isDev ? `tmp2211567.png?${Date.now()}` : path.join(__dirname, '..', '..', `tmp2211567.png?${Date.now()}`);
});




// When document has loaded, initialise
document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

window.onbeforeunload = (event) => {
    /* If window is reloaded, remove win event listeners
    (DOM element listeners get auto garbage collected but not
    Electron win listeners as the win is not dereferenced unless closed) */
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

