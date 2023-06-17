const { app, BrowserWindow, ipcMain, session} = require('electron')
const { spawn } = require('child_process');
const path = require('path')
const { dialog } = require('electron');


var isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false;
var pyExe = isDev ? path.join(__dirname, '/screenshot/screenshot.exe') : path.join(__dirname, '..', '/screenshot/screenshot.exe')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
  })

  win.loadFile('index.html')
  if (isDev) {
    win.webContents.openDevTools()
  }

  ipcMain.handle('startScript', async (event, args) => {
    try {
      win.minimize();
      const pythonProcess = spawn(pyExe);
      pythonProcess.on('exit', function (code) {
        if (code === 0) {
          win.webContents.send('logMessage', 'Successful screenshot');
          console.log("Successful screenshot")
          win.restore();
        }
        else {
          console.log("An Error has occured screenshotting Please check error in screenshot.py")
          console.log(code)
        }
    
      });
    }
    catch (err) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Alert',
        message: err.toString(),
        buttons: ['OK'],
      });
    }
    
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