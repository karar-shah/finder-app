const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // HTTP request method
  httpRequest: (options) => ipcRenderer.invoke("http-request", options),

  // File upload method
  uploadFiles: (files, uploadUrl) =>
    ipcRenderer.invoke("upload-files", files, uploadUrl),

  // Directory upload method
  uploadDirectory: (files, uploadUrl) =>
    ipcRenderer.invoke("upload-directory", files, uploadUrl),

  // Check if running in Electron
  isElectron: true,

  // Platform info
  platform: process.platform,
});
