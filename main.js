const { app, BrowserWindow, ipcMain, desktopCapturer, Menu, navigator} = require('electron')
const path = require('path')

let selectedSource = null
let constraints = null

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, "preload.js")
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()

  ipcMain.handle('getSources', async (event, args) => {
    const sources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    })
    const videoMenu = Menu.buildFromTemplate(
        sources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    )
    videoMenu.popup();
    return sources
})

ipcMain.handle('get/activeSource', async (event, args) => {
    console.log(selectedSource);
    return selectedSource;
})

ipcMain.handle('get/stream', async () => {
    return constraints;
})


async function selectSource(source) {
    selectedSource = source.name;
    // console.log(selectedSource);

    constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    }
    win.webContents.send('updateActiveSource');
}
}

app.on('ready', () => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
  })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})