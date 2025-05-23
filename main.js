const { app, BrowserWindow } = require('electron');
const { globalShortcut } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let win;

function createWindow() {
   win = new BrowserWindow({
    width: 1920,
    height: 1080,
    resizable: true,
    // frame: false,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, "frontend/img/icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('frontend/renderer.html');
}

// Launch the Flask backend
app.whenReady().then(() => {
  spawn('python3', ['backend/run.py'], { cwd: __dirname });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Register global shortcut for F11 to toggle fullscreen
app.on('ready', () => {
    globalShortcut.register('F11', () => {
        const isFullScreen = win.isFullScreen();
        win.setFullScreen(!isFullScreen);
    });
});


app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



