# Text Finder App

A cross-platform desktop application for extracting and searching text from multiple file types.

## Features

- Upload and process multiple file formats:
  - Text files (`.txt`)
  - Word documents (`.docx`)
  - Excel spreadsheets (`.xlsx`)
  - Images (`.png`, `.jpg`)
  - Audio files (`.wav`)
  - Video files (`.mp4`)
- Extract text content from files using:
  - Direct text extraction
  - OCR (Optical Character Recognition) for images
  - Speech recognition for audio and video
- Search for specific words across all processed files
- Clean user interface with upload and search screens

## Project Structure

```
/
├── backend/                      # Django REST API
│   ├── advancedTFA/              # Django project settings
│   ├── TextFinderApp/            # Main Django app
│   │   ├── migrations/           # Database migrations
│   │   ├── templates/            # HTML templates
│   │   ├── admin.py              # Admin configuration
│   │   ├── models.py             # Database models
│   │   ├── serializers.py        # API serializers
│   │   ├── views.py              # API and view functions
│   │   └── urls.py               # URL routes
│   ├── manage.py                 # Django management script
│   └── requirements.txt          # Python dependencies
│
└── frontend/                     # Electron.js desktop app
    ├── splash.html               # Splash/loading screen
    ├── index.html                # File upload screen
    ├── words_table.html          # Search screen
    ├── main.js                   # Electron main process
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

3. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

4. Start the development server:

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

## Dependencies

### Backend (Python)

- Django
- Django REST Framework
- python-docx (Word processing)
- openpyxl (Excel processing)
- SpeechRecognition (Audio processing)
- pytesseract (OCR for images)
- Pillow (Image processing)
- moviepy (Video processing)

### Frontend (JavaScript)

- Electron
- Bootstrap 5 (UI)
- jQuery (AJAX requests)

## Notes

- Make sure all required system dependencies (like Tesseract OCR) are installed for full functionality
- The backend server must be running for the app to work properly
- For production, secure the application appropriately (disable DEBUG, protect API endpoints, etc.)