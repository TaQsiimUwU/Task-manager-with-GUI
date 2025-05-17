const { contextBridge } = require('electron');

// Empty preload file as we've removed kill process functionality
// We keep this file in case we need to add IPC functionality later
contextBridge.exposeInMainWorld('electronAPI', {
  // No methods exposed to the renderer
});
