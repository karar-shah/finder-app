# Text Finder App - Modular Structure

This project has been refactored into a modular architecture for better maintainability and code organization.

## Project Structure

```
frontend/
├── main.js                           # Main Electron process entry point
├── preload.js                        # Preload script for IPC communication
├── index.html                        # Upload files page
├── words_table.html                  # Search words page
├── splash.html                       # Splash screen
├── package.json                      # Project configuration
├── src/                              # Modular source code
│   ├── main/                         # Main process modules
│   │   ├── windowManager.js          # Window creation and management
│   │   └── ipcHandlers.js            # IPC communication handlers
│   └── renderer/                     # Renderer process modules
│       ├── apiClient.js              # HTTP API client (works in both Electron and web)
│       ├── fileManager.js            # File upload and management functionality
│       └── searchManager.js          # Word search functionality
└── *_backup.html                     # Original files (preserved as backups)
```

## Module Descriptions

### Main Process Modules (`src/main/`)

**WindowManager** (`windowManager.js`)

- Handles creation and management of splash and main windows
- Sets up application menu with navigation shortcuts
- Manages window lifecycle events

**IPCHandlers** (`ipcHandlers.js`)

- Handles IPC communication between main and renderer processes
- Manages HTTP requests and file uploads from renderer process
- Provides secure bridge for network operations

### Renderer Process Modules (`src/renderer/`)

**APIClient** (`apiClient.js`)

- Universal HTTP client that works in both Electron and web environments
- Handles all API communications (GET, POST, DELETE requests)
- Manages file uploads and downloads
- Automatically detects environment (Electron vs web) and uses appropriate methods

**FileManager** (`fileManager.js`)

- Manages file upload functionality
- Handles file list display and management
- Provides file deletion capabilities
- Shows upload progress and status messages

**SearchManager** (`searchManager.js`)

- Handles word search functionality
- Manages search form interactions
- Displays search results in a formatted table
- Supports both exact match and contains search types

## Key Benefits of Modular Structure

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Reusability**: Modules can be easily reused across different parts of the app
3. **Maintainability**: Changes to one feature don't affect others
4. **Testability**: Individual modules can be tested in isolation
5. **Readability**: Code is more organized and easier to understand

## How to Run

The application works exactly the same as before:

```bash
npm start
```

## File Backups

Original files have been preserved with `_backup` or `_original_backup` suffixes:

- `index_original_backup.html` - Original upload page
- `words_table_original_backup.html` - Original search page
- `main_original_backup.js` - Original main process file

## Environment Compatibility

The modular structure maintains full compatibility with:

- Electron environment (desktop app)
- Web browser environment (if needed)
- All existing functionality and UI remain unchanged

## Adding New Features

To add new features:

1. **For main process features**: Add new modules to `src/main/`
2. **For renderer features**: Add new modules to `src/renderer/`
3. **Import modules**: Add script tags to HTML files or require statements in Node.js files
4. **Initialize**: Create instances and call init methods in the appropriate HTML files

Example:

```javascript
// In HTML file
<script src="src/renderer/newFeature.js"></script>
<script>
  const newFeature = new NewFeature(apiClient);
  newFeature.init();
</script>
```
