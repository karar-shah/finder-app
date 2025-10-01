# Text Finder App

A cross-platform desktop application for extracting and searching text from multiple file types.

## Features

- Upload and process multiple file formats:
  - Text files (`.txt`)
  - Word documents (`.docx`)
  - Excel spreadsheets (`.xlsx`)
  - PDF documents (`.pdf`)
  - CSV files (`.csv`)
  - Images (`.png`, `.jpg`, `.jpeg`)
  - Audio files (`.wav`)
  - Video files (`.mp4`)
- Extract text content from files using:
  - Direct text extraction
  - OCR (Optical Character Recognition) for images
  - Speech recognition for audio and video
- Search for words across all processed files:
  - Exact match search (case-insensitive)
  - Contains search (finds partial matches)
- Cross-platform compatibility (Windows, macOS, Linux)
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

## API Endpoints

- `POST /file/` - Upload files for processing
- `GET /filetbl/` - Get all extracted words
- `DELETE /filetbl/{id}` - Delete a specific word
- `POST /api/search/` - Search for words with options:
  - `wordsearch`: The word to search for
  - `search_type`: Either "exact" or "contains"

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
