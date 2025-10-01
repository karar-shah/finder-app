const { BrowserWindow, Menu } = require("electron");
const path = require("path");

class WindowManager {
  constructor() {
    this.mainWindow = null;
    this.splashWindow = null;
  }

  createSplashWindow() {
    // Create the splash screen window
    this.splashWindow = new BrowserWindow({
      width: 500,
      height: 400,
      frame: false,
      transparent: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false, // Allow cross-origin requests
        allowRunningInsecureContent: true,
      },
    });

    this.splashWindow.loadFile("splash.html");

    this.splashWindow.on("closed", () => {
      this.splashWindow = null;
    });

    return this.splashWindow;
  }

  createMainWindow() {
    // Create the main application window
    this.mainWindow = new BrowserWindow({
      width: 900,
      height: 700,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        webSecurity: false,
        allowRunningInsecureContent: true,
        preload: path.join(__dirname, "../../preload.js"),
      },
      icon: path.join(__dirname, "../../icon.png"),
    });

    // Create menu
    this._createApplicationMenu();

    // Initial page load
    this.mainWindow.loadFile("index.html");

    // Show window when ready
    this.mainWindow.once("ready-to-show", () => {
      // Close the splash screen
      if (this.splashWindow) this.splashWindow.close();
      this.mainWindow.show();
    });

    // Handle window close
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  _createApplicationMenu() {
    const menu = Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            role: "quit",
          },
        ],
      },
      {
        label: "Navigate",
        submenu: [
          {
            label: "Upload Files",
            accelerator: process.platform === "darwin" ? "Cmd+1" : "Ctrl+1",
            click: () => {
              this.mainWindow.loadFile("index.html");
            },
          },
          {
            label: "Search Words",
            accelerator: process.platform === "darwin" ? "Cmd+2" : "Ctrl+2",
            click: () => {
              this.mainWindow.loadFile("words_table.html");
            },
          },
        ],
      },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
    ]);
    Menu.setApplicationMenu(menu);
  }

  getMainWindow() {
    return this.mainWindow;
  }

  getSplashWindow() {
    return this.splashWindow;
  }
}

module.exports = WindowManager;
