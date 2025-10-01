# Text Finder App - Modular Architecture

## Overview

This Electron application has been refactored into a modular architecture for better maintainability, readability, and separation of concerns. The app allows users to upload various file types and search for words within them.

## Project Structure

```
frontend/
├── main.js                          # Main Electron process entry point
├── preload.js                       # Preload script for secure communication
├── index.html                       # Upload page (modular version)
├── words_table.html                 # Search page (modular version)
├── splash.html                      # Splash screen
├── package.json                     # Project configuration
├── src/                             # Modular source code
│   ├── main/                        # Main process modules
│   │   ├── windowManager.js         # Window creation and management
│   │   └── ipcHandlers.js           # IPC communication handlers
│   └── renderer/                    # Renderer process modules
│       ├── apiClient.js             # HTTP requests and API communication
│       ├── fileManager.js           # File upload and management
│       └── searchManager.js         # Search functionality
├── index_original_backup.html       # Original monolithic index.html
├── words_table_original.html        # Original monolithic search page
├── index_modular.html               # New modular upload page
└── words_table_modular.html         # New modular search page
```

## Modular Components

### Main Process Modules (`src/main/`)

#### 1. WindowManager (`windowManager.js`)

- **Purpose**: Handles creation and management of application windows
- **Responsibilities**:
  - Create splash screen window
  - Create main application window
  - Setup application menu
  - Handle window lifecycle events

#### 2. IPCHandlers (`ipcHandlers.js`)

- **Purpose**: Manages Inter-Process Communication between main and renderer processes
- **Responsibilities**:
  - Handle HTTP requests from renderer
  - Handle file uploads with multipart form data
  - Process responses and error handling

### Renderer Process Modules (`src/renderer/`)

#### 1. APIClient (`apiClient.js`)

- **Purpose**: Centralized API communication layer
- **Responsibilities**:
  - Abstract HTTP requests for both Electron and web environments
  - Handle file uploads with proper format conversion
  - Manage API endpoints (upload, search, delete)
  - Error handling and response processing

#### 2. FileManager (`fileManager.js`)

- **Purpose**: Manages file-related operations on the upload page
- **Responsibilities**:
  - Handle file upload form submission
  - Display uploaded files in table format
  - Handle file deletion
  - Show status messages and loading states
  - Navigate between pages

#### 3. SearchManager (`searchManager.js`)

- **Purpose**: Manages search functionality on the search page
- **Responsibilities**:
  - Handle search form submission
  - Process search results and display them
  - Handle different search types (exact match, contains)
  - Show search status and error messages
  - Navigate between pages

## Benefits of Modular Architecture

### 1. **Separation of Concerns**

- Each module has a single, well-defined responsibility
- UI logic is separate from API communication
- Main process and renderer process code are clearly separated

### 2. **Maintainability**

- Easier to locate and fix bugs in specific functionality
- Changes to one feature don't affect others
- Clear code organization makes onboarding new developers easier

### 3. **Reusability**

- APIClient can be reused across different pages
- Components can be easily extracted for use in other projects
- Consistent patterns across all modules

### 4. **Testability**

- Each module can be tested independently
- Mock dependencies easily for unit testing
- Clear interfaces between components

### 5. **Scalability**

- Easy to add new features without affecting existing code
- Can extend functionality by adding new modules
- Clear patterns for future development

## How It Works

### Initialization Flow

1. **Main Process** (`main.js`):

   - Creates WindowManager and IPCHandlers instances
   - WindowManager creates splash and main windows
   - IPCHandlers sets up communication channels

2. **Upload Page** (`index.html`):

   - Initializes APIClient for backend communication
   - Creates FileManager with APIClient dependency
   - FileManager handles all file-related operations

3. **Search Page** (`words_table.html`):
   - Initializes APIClient for backend communication
   - Creates SearchManager with APIClient dependency
   - SearchManager handles all search-related operations

### Communication Flow

```
Renderer Process (UI) → APIClient → IPC → IPCHandlers → Backend API
                                         ↓
                     UI Updates ← APIClient ← IPC ← Response
```

## Usage

### Running the Application

```bash
# Install dependencies
npm install

# Start the application
npm start
```

### Development

- **Adding new features**: Create new modules in appropriate directories
- **Modifying existing features**: Edit the relevant module files
- **Testing**: Each module can be tested independently

## Migration Summary

### What We Accomplished

✅ **Separated Main Process Logic**:

- Window management moved to `WindowManager` class
- IPC communication moved to `IPCHandlers` class

✅ **Created Reusable Frontend Modules**:

- `APIClient` for all HTTP communication
- `FileManager` for file operations
- `SearchManager` for search functionality

✅ **Maintained Full Functionality**:

- All existing features work exactly as before
- No changes to user interface or experience
- Preserved all error handling and edge cases

✅ **Improved Code Organization**:

- Clear separation of concerns
- Each module has a single responsibility
- Easy to understand and maintain

### Benefits Achieved

- **Maintainability**: Easy to find and fix issues
- **Reusability**: Components can be used across pages
- **Testability**: Each module can be tested independently
- **Scalability**: Easy to add new features
- **Readability**: Clear, focused code modules

The application now has a solid, modular foundation that will make future development much easier while preserving all existing functionality!
