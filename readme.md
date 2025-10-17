# Text Finder App

A modern, cross-platform desktop application for extracting and searching text from multiple file types with support for both individual files and entire directories.

## Features

### File Processing

- **Multiple File Formats Support**:
  - Text files (`.txt`)
  - Word documents (`.docx`)
  - Excel spreadsheets (`.xlsx`)
  - PDF documents (`.pdf`)
  - CSV files (`.csv`)
  - Images (`.png`, `.jpg`, `.jpeg`) - OCR support
  - Audio files (`.wav`) - Speech recognition
  - Video files (`.mp4`) - Audio extraction + speech recognition

### Directory Upload

- Upload entire directories with automatic file detection
- Recursively processes all supported files within subdirectories
- Batch processing with detailed progress feedback
- Maintains original file structure and naming

### Text Extraction

- **Direct text extraction** for document formats
- **OCR (Optical Character Recognition)** for images using Tesseract
- **Speech recognition** for audio and video files using Google Speech API
- **Intelligent word indexing** for fast search operations

### Search Capabilities

- **Exact Match Search** (case-insensitive)
- **Contains Search** (partial word matching)
- **Cross-file search** across all processed documents
- **Real-time search statistics** showing match counts and file sources

### Modern UI/UX

- **Clean, minimalistic design** with #3629B7 primary color scheme
- **Drag & drop interface** for intuitive file uploads
- **Smooth animations** and micro-interactions
- **Responsive design** that works on different screen sizes
- **Real-time feedback** during upload and processing

## Architecture

### Project Structure

```
Text Finder App/
├── backend/                      # Django REST API
│   ├── advancedTFA/              # Django project settings
│   │   ├── settings.py           # Main configuration
│   │   ├── urls.py               # URL routing
│   │   └── wsgi.py               # WSGI configuration
│   ├── TextFinderApp/            # Main Django app
│   │   ├── migrations/           # Database migrations
│   │   ├── templates/            # HTML templates
│   │   ├── models.py             # Data models (UploadedFiles, FileWords)
│   │   ├── views.py              # API endpoints and file processing
│   │   ├── serializers.py        # API serializers
│   │   └── urls.py               # App-specific URL routes
│   ├── media/                    # Uploaded files storage
│   ├── manage.py                 # Django management script
│   └── requirements.txt          # Python dependencies
│
└── frontend/                     # Electron.js desktop app
    ├── src/                      # Modular source code
    │   ├── main/                 # Main process modules
    │   │   ├── windowManager.js  # Window creation and management
    │   │   └── ipcHandlers.js    # IPC communication handlers
    │   └── renderer/             # Renderer process modules
    │       ├── apiClient.js      # HTTP API client
    │       ├── fileManager.js    # File/directory upload management
    │       ├── searchManager.js  # Search functionality
    │       └── themeManager.js   # UI theme management
    ├── styles/                   # CSS stylesheets
    │   └── modern-theme.css      # Main application styles
    ├── splash.html               # Splash/loading screen
    ├── index.html                # File upload interface
    ├── words_table.html          # Search interface
    ├── main.js                   # Electron main process
    ├── preload.js                # Preload script for IPC
    └── package.json              # Node.js dependencies
```

## Setup Instructions

### Backend (Django)

1. Create and activate a virtual environment:

```bash
# Create virtual environment
python -m venv env

# Activate on Windows
env\Scripts\activate

# Activate on macOS/Linux
source env/bin/activate
```

2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Ensure Tesseract OCR is installed for image processing:

- **Windows**: Download and install from [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
- **macOS**: `brew install tesseract`
- **Linux**: `sudo apt install tesseract-ocr`

4. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create media directories:

```bash
mkdir -p media/media
```

6. Start the development server:

```bash
python manage.py runserver
```

The Django server will run at `http://127.0.0.1:8000/`.

### Frontend (Electron)

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the Electron app:

```bash
npm start
```

## Build for Distribution

To build the Electron app for distribution:

```bash
# For all platforms
npm run dist

# For specific platforms
npm run dist:mac
npm run dist:win
npm run dist:linux
```

## 🛠️ Setup Instructions

### Backend (Django)

1. **Set up Python environment** (Anaconda recommended):

```bash
# If using Anaconda
conda create -n textfinder python=3.12
conda activate textfinder

# Or using venv
python -m venv env
source env/bin/activate  # macOS/Linux
# env\Scripts\activate   # Windows
```

2. **Install dependencies**:

```bash
cd backend
pip install -r requirements.txt
```

3. **Install Tesseract OCR** for image processing:

- **macOS**: `brew install tesseract`
- **Windows**: Download from [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
- **Linux**: `sudo apt install tesseract-ocr`

4. **Initialize database**:

```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create media directories**:

```bash
mkdir -p media/media
```

6. **Start the development server**:

```bash
python manage.py runserver
```

The Django server will run at `http://127.0.0.1:8000/`

### Frontend (Electron)

1. **Install Node.js dependencies**:

```bash
cd frontend
npm install
```

2. **Start the Electron app**:

```bash
npm start
```

## Build for Distribution

```bash
cd frontend

# Build for all platforms
npm run dist

# Build for specific platforms
npm run dist:mac
npm run dist:win
npm run dist:linux
```

## API Endpoints

### File Operations

- `POST /file/` - Upload individual files for processing
- `POST /upload-directory/` - Upload directory as ZIP for batch processing
- `GET /filetbl/` - Get all extracted words and file information
- `DELETE /filetbl/{id}` - Delete a specific word entry

### Search Operations

- `POST /api/search/` - Search for words with options:
  - `wordsearch`: The word to search for
  - `search_type`: `"exact"` or `"contains"`

## Database Schema

### UploadedFiles Model

- `id`: Primary key
- `file`: FileField storing uploaded files
- `original_filename`: Original name of uploaded file

### FileWords Model

- `id`: Primary key
- `word`: Extracted word/text
- `file_id`: Foreign key to UploadedFiles

## UI Design System

### Color Scheme

- **Primary**: #3629B7 (Rich blue-purple)
- **Background**: White/Light gray gradients
- **Accent**: Bootstrap compatible colors

### Key UI Components

- **Drag & Drop Upload Area**: Visual feedback for file operations
- **Mode Toggle**: Switch between files and directory upload
- **Search Interface**: Real-time search with statistics
- **Results Table**: Clean display with file icons and match counts

## How Directory Upload Works

1. **Frontend**: User selects directory using native file picker
2. **ZIP Creation**: JavaScript creates ZIP file maintaining directory structure
3. **Upload**: ZIP file sent to `/upload-directory/` endpoint
4. **Backend Processing**:
   - ZIP extracted to temporary directory
   - All supported files recursively processed
   - Text extracted and stored in database
   - Temporary files cleaned up
5. **Response**: Detailed results showing processed files and any errors

## Modular Architecture

### Main Process (`src/main/`)

- **WindowManager**: Handles Electron window creation and lifecycle
- **IPCHandlers**: Manages communication between main and renderer processes

### Renderer Process (`src/renderer/`)

- **APIClient**: HTTP client supporting both Electron and web environments
- **FileManager**: File/directory upload and management functionality
- **SearchManager**: Word search and results display
- **ThemeManager**: UI theme and styling management

## Requirements

### Backend

- Python 3.12+
- Django 5.0+
- Tesseract OCR
- Various Python packages (see requirements.txt)

### Frontend

- Node.js 22+
- Electron 37+
- Modern web browser APIs

## Troubleshooting

### Common Issues

1. **Tesseract not found**: Ensure Tesseract is installed and in PATH
2. **Audio processing fails**: Check if speech_recognition dependencies are installed
3. **Directory upload not working**: Ensure ZIP file creation is working in browser
4. **CORS errors**: Check Django CORS settings for web deployment

## Dependencies

### Backend (Python)

- Django & Django REST Framework
- python-docx (Word processing)
- openpyxl (Excel processing)
- PyPDF2 (PDF processing)
- SpeechRecognition (Audio processing)
- pytesseract (OCR for images)
- Pillow (Image processing)
- moviepy (Video processing)

### Frontend (JavaScript)

- Electron (Desktop app framework)
- Bootstrap 5 (UI components)
- jQuery (AJAX requests)

## Troubleshooting

- **Tesseract OCR errors**: Ensure Tesseract is properly installed and available in your system PATH
- **File upload issues**: Check the media directory permissions
- **Speech recognition failures**: Ensure you have an active internet connection for Google's speech API

## Notes

- Make sure all required system dependencies (like Tesseract OCR) are installed for full functionality
- The backend server must be running for the app to work properly
- For production, secure the application appropriately (disable DEBUG, protect API endpoints, etc.)
