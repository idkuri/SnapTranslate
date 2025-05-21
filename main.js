const { app, BrowserWindow, ipcMain, session, Menu} = require('electron')
const { spawn } = require('child_process');
const path = require('path')
const { dialog } = require('electron');
const fs = require('fs');
const { start } = require('repl');
const { exit } = require('process');

var isDev = process.env.APP_DEV ? true : false;
var pythonProcess;

const startPythonProcess = () => {
  var pyExe = isDev ? path.join(__dirname, 'screenshot.py') : path.join(process.resourcesPath, 'screenshot', 'screenshot.exe')

  try {
    pythonProcess = isDev ? spawn("python", [pyExe], {stdio: ["pipe", "pipe", "pipe"]}) : spawn(pyExe, [], {stdio: ["pipe", "pipe", "pipe"]});
  }
  catch (error) {
    console.log(error);
    exit(1);
  }

}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    // transparent: true,
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
    fs.unlink(path.join('./tmp2211567.png'), () => {
      console.log('File deleted successfully.');
    });
    pythonProcess.stdin.write('exit\n');
    if (process.platform !== 'darwin') {
      app.quit()
    }
    win.close();
  })

  ipcMain.handle('isMaximized', async (event, args) => {
    return win.isMaximized();
  })
    
  ipcMain.handle('isDev', async(event, args) => {
    return isDev;
  })

  pythonProcess.stdout.on('data', function (data) {
    message = data.toString().trim();
    if (message === "end") {
      win.webContents.send('fetchImage');
      win.setOpacity(1);
    }
    else {
      console.log(message)
    }
  });

  ipcMain.handle('startScript', async (event, args) => {
    try {
      win.setOpacity(0);
      pythonProcess.stdin.write('start\n');
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

const main = () => {
  startPythonProcess();
  if (isDev) {
    pythonProcess.stdin.write('dev\n');
  }
}

main();