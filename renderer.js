const { ipcRenderer } = require('electron');

async function OpenMenu() {
    try {
        await ipcRenderer.invoke('getSources');
    }
    catch (error) {
        console.log(error);
    }
}

async function getActiveDisplay() {
    try {
        console.log("Hi")
        const videoElement = document.querySelector('video');
        const header = document.getElementById('selectDisplay')
        const result = await ipcRenderer.invoke('get/activeSource');
        const constraints = await ipcRenderer.invoke('get/stream');
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        header.innerText = result;
        videoElement.srcObject = stream;
        videoElement.play();
    }
    catch (error) {
        console.log(error);
    }
}

const displayBtn = document.getElementById('selectDisplay');
displayBtn.onclick = OpenMenu;


// window.electron.ipcRenderer.on('updateActiveSource', () => {
//     getActiveDisplay();
// })

ipcRenderer.on('updateActiveSource', () => {
    getActiveDisplay();
})
