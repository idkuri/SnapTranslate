const { app, BrowserWindow, ipcMain} = require('electron')
const { spawn } = require('child_process');
const path = require('path')

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

  ipcMain.handle('startScript', async (event, args) => {
    win.minimize();
    const pythonProcess = spawn('python', ['screenshot.py']);
    
  pythonProcess.on('exit', function (code) {
    if (code === 200) {
      console.log("Successful screenshot")
    }
    else {
      console.log("An Error has occured screenshotting Please check error in screenshot.py")
      exit(400)
    }

  });
})

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