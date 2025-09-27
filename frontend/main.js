process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let splashWindow;

function createSplashWindow() {
  // Create the splash screen window
  splashWindow = new BrowserWindow({
    width: 500, 
    height: 400,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  splashWindow.loadFile('splash.html');

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  // Create the main application window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  // Create a menu for navigation
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          role: 'quit'
        }
      ]
    },
    {
      label: "Navigate",
      submenu: [
        {
          label: "Upload Files",
          accelerator: process.platform === 'darwin' ? 'Cmd+1' : 'Ctrl+1',
          click: () => {
            mainWindow.loadFile("index.html");
          },
        },
        {
          label: "Search Words",
          accelerator: process.platform === 'darwin' ? 'Cmd+2' : 'Ctrl+2',
          click: () => {
            mainWindow.loadFile("words_table.html");
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  // Initial page load
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    // Close the splash screen
    if (splashWindow) splashWindow.close();
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready event
app.whenReady().then(() => {
  createSplashWindow();
  
  // Create the main window after a delay to simulate loading
  setTimeout(() => {
    createMainWindow();
  }, 3000);
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});