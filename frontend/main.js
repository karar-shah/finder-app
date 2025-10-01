process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
const { app, BrowserWindow } = require("electron");

// Import modular components
const WindowManager = require("./src/main/windowManager");
const IPCHandlers = require("./src/main/ipcHandlers");

// Initialize managers
const windowManager = new WindowManager();
const ipcHandlers = new IPCHandlers();

// App ready event
app.whenReady().then(() => {
  windowManager.createSplashWindow();

  // Create the main window after a delay to simulate loading
  // Increased delay to ensure splash screen completes its animation
  setTimeout(() => {
    windowManager.createMainWindow();
  }, 2500);
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow();
  }
});
