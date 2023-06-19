const { app, BrowserWindow, ipcMain, session, Menu} = require('electron')
const { spawn } = require('child_process');
const path = require('path')
const { dialog } = require('electron');
const fs = require('fs');


var isDev = process.env.APP_DEV ? true : false;
var pyExe = isDev ? path.join(__dirname, '/screenshot/screenshot.exe') : path.join(__dirname, '..', '/screenshot/screenshot.exe')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    // titleBarStyle: 'hidden',
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
  })
  win.loadFile('index.html')
  if (isDev) {
    win.webContents.openDevTools()
  }

  
  ipcMain.handle('minimize', async (event, args) => {
    win.minimize();
  })

  ipcMain.handle('maximize', async (event, args) => {
    win.maximize();
  })

  ipcMain.handle('unmaximize', async (event, args) => {
    win.unmaximize();
  })
  ipcMain.handle('close', async (event, args) => {
    win.close();
  })

  ipcMain.handle('isMaximized', async (event, args) => {
    return win.isMaximized();
  })
    
  ipcMain.handle('isDev', async(event, args) => {
    return isDev;
  })

  ipcMain.handle('startScript', async (event, args) => {
    try {
      win.hide();
      const pythonProcess = spawn(pyExe);
      pythonProcess.on('exit', function (code) {
        if (code === 0) {
          win.webContents.send('fetchImage');
          console.log("Successful screenshot")
          win.show();
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
  Menu.setApplicationMenu(null);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
  })
})

app.on('window-all-closed', () => {
    fs.unlink(path.join('./tmp2211567.png'), () => {
      console.log('File deleted successfully.');
    });
    if (process.platform !== 'darwin') {
      app.quit()
    }
})