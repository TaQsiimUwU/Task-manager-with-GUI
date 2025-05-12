const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile('frontend/renderer.html');
}

// Launch the Flask backend
app.whenReady().then(() => {
  spawn('python3', ['backend/app.py'], { cwd: __dirname });
  createWindow();
});
