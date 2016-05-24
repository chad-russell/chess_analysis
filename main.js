'use strict';

const {app, BrowserWindow, ipcMain} = require('electron');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

ipcMain.on('app-quit', (event, arg) => app.quit());

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

var openFile = null;

app.on('open-file', (event, path) => {
  event.preventDefault();
  openFile = path;
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 100000, height: 100000});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  process.argv.forEach((a) => {
    if (a.endsWith('.pgn')) {
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('import-pgn', a);
      });
    }
  });

  if (openFile) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('import-pgn', openFile);
    });
  }
});
