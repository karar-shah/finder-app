# TEXT FINDER APP

## Desktop Application for Multi-Format Text Extraction and Search

**Project Documentation**

---

## TABLE OF CONTENTS

### CHAPTER 1: INTRODUCTION

1.1. Background  
1.2. Goals and Objectives  
1.3. Gap Analysis  
1.4. Project Plan  
&nbsp;&nbsp;&nbsp;&nbsp;1.4.1. Work Breakdown Structure  
&nbsp;&nbsp;&nbsp;&nbsp;1.4.2. Gantt Chart  
&nbsp;&nbsp;&nbsp;&nbsp;1.4.3. Team Members  
1.5. Report Outline

### CHAPTER 2: SYSTEM REQUIREMENTS AND SPECIFICATION

2.1. Purpose  
&nbsp;&nbsp;&nbsp;&nbsp;2.1.1. Document Conventions  
&nbsp;&nbsp;&nbsp;&nbsp;2.1.2. Intended Audience  
2.2. Overall Description  
&nbsp;&nbsp;&nbsp;&nbsp;2.2.1. Service Perspective  
&nbsp;&nbsp;&nbsp;&nbsp;2.2.2. Service Function  
&nbsp;&nbsp;&nbsp;&nbsp;2.2.3. Product Functions  
&nbsp;&nbsp;&nbsp;&nbsp;2.2.4. User Classes and Characteristics  
&nbsp;&nbsp;&nbsp;&nbsp;2.2.5. Assumptions and Dependencies  
2.3. External Interface Requirements  
&nbsp;&nbsp;&nbsp;&nbsp;2.3.1. User Interfaces  
&nbsp;&nbsp;&nbsp;&nbsp;2.3.2. Hardware Interface  
&nbsp;&nbsp;&nbsp;&nbsp;2.3.3. Software Interface  
2.4. System Features  
&nbsp;&nbsp;&nbsp;&nbsp;2.4.1. File Upload  
&nbsp;&nbsp;&nbsp;&nbsp;2.4.2. Directory Upload  
&nbsp;&nbsp;&nbsp;&nbsp;2.4.3. Text Extraction  
&nbsp;&nbsp;&nbsp;&nbsp;2.4.4. Word Search  
2.5. Other Nonfunctional Requirements  
&nbsp;&nbsp;&nbsp;&nbsp;2.5.1. Performance Requirements  
&nbsp;&nbsp;&nbsp;&nbsp;2.5.2. Safety Requirements  
&nbsp;&nbsp;&nbsp;&nbsp;2.5.3. Software Quality Attributes  
2.6. Other Requirements

### CHAPTER 3: USE CASE ANALYSIS

3.1. Use Case Model  
3.2. Fully Dressed Use Cases

### CHAPTER 4: SYSTEM DESIGN

4.1. Architecture Diagram  
4.2. Domain Model  
4.3. Entity Relationship Diagram  
4.4. Class Diagram  
4.5. Sequence / Collaboration Diagram  
4.6. Operation Contracts  
4.7. Activity Diagram  
4.8. State Transition Diagram (File Upload)  
4.9. State Transition Diagram (Directory Upload)  
4.10. State Transition Diagram (Text Extraction)  
4.11. State Transition Diagram (Word Search)  
4.12. Component Diagram  
4.13. Deployment Diagram  
4.14. REST API Endpoints  
4.15. User Interface Design  
&nbsp;&nbsp;&nbsp;&nbsp;4.15.1. Splash Screen  
&nbsp;&nbsp;&nbsp;&nbsp;4.15.2. File Upload Screen  
&nbsp;&nbsp;&nbsp;&nbsp;4.15.3. Uploaded Files View  
&nbsp;&nbsp;&nbsp;&nbsp;4.15.4. Search Configuration Screen  
&nbsp;&nbsp;&nbsp;&nbsp;4.15.5. Search Results View  
&nbsp;&nbsp;&nbsp;&nbsp;4.15.6. Statistics Dashboard

### CHAPTER 5: IMPLEMENTATION

5.1. Important Flow Control  
5.2. Components, Libraries and Stubs  
5.3. Deployment Environment  
5.4. Tools and Techniques  
5.5. Best Practices / Coding Standards

### CHAPTER 6: TEST AND EVALUATION

6.1. Testing and Evaluation  
6.2. Use Case Testing  
6.3. Boundary Value Analysis  
6.4. Performance Testing  
6.5. Stress Testing  
6.6. Improvement

### REFERENCES

---

## CHAPTER 1: INTRODUCTION

### 1.1. Background

The Text Finder App is a desktop application built to extract and index text content from multiple file formats. The system processes documents, spreadsheets, PDFs, images, audio files, and videos, converting their content into searchable text records. This enables users to perform word-based searches across their entire file collection regardless of original format.

The application implements a client-server architecture with an Electron-based desktop frontend communicating with a Django REST API backend. Files uploaded through the desktop interface are processed on the backend using format-specific extraction libraries. Text documents undergo direct parsing, images are processed through Tesseract OCR, and audio/video files are transcribed using Google's Speech Recognition API.

Extracted words are tokenized and stored in a SQLite database with foreign key relationships linking each word to its source file. This database structure enables efficient search operations with two query modes: exact word matching (case-insensitive) and substring matching for partial word searches.

The system runs entirely on localhost (127.0.0.1:8000) with no external hosting requirements. All file processing occurs locally except for audio and video transcription, which requires internet connectivity to access Google's Speech Recognition service.

### 1.2. Goals and Objectives

**Primary Goal:**  
Develop a desktop application that extracts text from ten supported file formats and enables cross-file word search through indexed database storage.

**Specific Objectives (Code-Verified):**

1. **Multi-Format Text Extraction:** Implement extraction for TXT, DOCX, XLSX, PDF, CSV, PNG, JPG, JPEG, WAV, and MP4 files using format-specific processing methods.

2. **Database Indexing:** Store extracted words in SQLite database with foreign key relationships to source files, enabling efficient query operations.

3. **Dual Search Modes:** Provide exact word matching (`word__iexact`) and substring matching (`word__icontains`) search capabilities, both case-insensitive.

4. **Directory Batch Processing:** Support recursive directory upload via ZIP archive creation, processing all supported files within the directory structure.

5. **Electron Desktop Interface:** Deliver native desktop application with drag-and-drop file upload, mode toggle between files and directory uploads, and real-time status feedback.

6. **REST API Backend:** Implement Django REST Framework endpoints for file upload (`/file/`), directory upload (`/upload-directory/`), search (`/api/search/`), file deletion (`/api/delete-file/<id>`), and bulk operations (`/api/clear-all/`).

7. **IPC Communication:** Establish secure inter-process communication between Electron main and renderer processes using contextBridge and ipcRenderer.

8. **Modular Frontend Architecture:** Structure frontend code into specialized managers: APIClient (HTTP requests), FileManager (upload operations), SearchManager (search functionality), and WindowManager (window lifecycle).

### 1.3. Gap Analysis

**Identified Gaps Addressed by Implementation:**

1. **Unified Format Processing:** Traditional tools require separate applications for documents, images, and media files. Text Finder App consolidates processing through a single interface with automatic format detection via file extension.

2. **Local-First Architecture:** Cloud services require upload and raise privacy concerns. This application processes all files locally except audio/video transcription, which uses Google Speech Recognition API.

3. **Cross-File Search:** Operating system search tools scan filenames and basic metadata. Text Finder App indexes actual content at the word level, enabling searches across file contents regardless of format.

4. **Batch Directory Support:** Manual file selection becomes cumbersome for large collections. Directory upload feature processes entire folder structures in a single operation.

5. **Persistent Indexing:** Re-processing files for each search is inefficient. Text Finder App extracts text once during upload and maintains persistent word indexes for instant search.

### 1.4. Project Plan

#### 1.4.1. Work Breakdown Structure

**1. Backend Development (Completed)**

- 1.1 Django project configuration (settings.py)
- 1.2 Database models (UploadedFiles, FileWords)
- 1.3 File upload endpoint (`file()` function)
- 1.4 Directory upload endpoint (`upload_directory()` function)
- 1.5 Format-specific extraction logic (TXT, DOCX, XLSX, PDF, CSV, PNG/JPG/JPEG, WAV, MP4)
- 1.6 Search API endpoints (FileWordsSearchAPIView)
- 1.7 File deletion endpoints (FileDeleteAPIView, `clear_all_files()`)
- 1.8 Serializers for API responses
- 1.9 URL routing configuration
- 1.10 CORS middleware setup

**2. Frontend Development (Completed)**

- 2.1 Electron main process (main.js)
- 2.2 Window management (WindowManager class)
- 2.3 IPC handlers (IPCHandlers class)
- 2.4 Preload script with contextBridge
- 2.5 API client module (APIClient class)
- 2.6 File manager module (FileManager class)
- 2.7 Search manager module (SearchManager class)
- 2.8 Splash screen (splash.html)
- 2.9 Upload interface (index.html)
- 2.10 Search interface (words_table.html)
- 2.11 CSS styling (modern-theme.css)

**3. Integration (Completed)**

- 3.1 HTTP request routing through IPC
- 3.2 File upload with FormData via IPC
- 3.3 ZIP creation for directory uploads
- 3.4 API response handling
- 3.5 Error handling and user feedback

**4. Documentation (In Progress)**

- 4.1 Technical specification
- 4.2 API documentation
- 4.3 Setup instructions
- 4.4 Architecture diagrams

#### 1.4.2. Gantt Chart

**[PLACEHOLDER: Gantt Chart Diagram]**

_Figure 1.1: Project timeline showing development phases and milestones_

#### 1.4.3. Team Members

**Technical Stack (Code-Verified):**

**Backend Technologies:**

- Django 5.0.6 - Web framework
- Django REST Framework 3.15.2 - API framework
- django-cors-headers 4.3.1 - CORS middleware
- SQLite 3 - Database engine

**Frontend Technologies:**

- Electron 37.5.1 - Desktop application framework
- jQuery 3.7.1 - DOM manipulation and AJAX
- JSZip 3.10.1 - ZIP file creation
- Bootstrap Icons 1.11.3 - Icon library

**Text Extraction Libraries:**

- python-docx 1.1.2 - DOCX file processing
- openpyxl 3.1.2 - XLSX file processing
- PyPDF2 - PDF text extraction
- pytesseract 0.3.13 - OCR interface
- Pillow 11.2.1 - Image processing
- SpeechRecognition 3.10.4 - Audio transcription
- moviepy 2.2.1 - Video processing

**External Dependencies:**

- Tesseract OCR Engine - System-level OCR software
- Google Speech Recognition API - Cloud transcription service

### 1.5. Report Outline

This documentation follows a structured approach to comprehensively describe the Text Finder App system:

**Chapter 1: Introduction** establishes project context, defining the problem space, objectives, and development plan. It provides background on multi-format text extraction challenges and outlines the solution approach.

**Chapter 2: System Requirements and Specification** details functional and non-functional requirements. It defines system purpose, target audience, external interfaces, core features, and quality attributes. This chapter serves as the authoritative reference for system capabilities and constraints.

**Chapter 3: Use Case Analysis** presents user interactions through use case diagrams and fully dressed use case descriptions. Each use case specifies preconditions, postconditions, main flows, and alternative flows, documenting complete system behavior from user perspective.

**Chapter 4: System Design** provides technical architecture details. It includes architecture diagrams, domain models, entity relationships, class diagrams, sequence diagrams, operation contracts, activity diagrams, state machines, component diagrams, deployment diagrams, REST API specifications, and user interface designs. This chapter documents all design decisions and system structure.

**Chapter 5: Implementation** describes the actual codebase structure, flow control mechanisms, component interactions, libraries utilized, deployment environment configuration, development tools, and coding standards applied. It bridges design specifications with concrete implementation.

**Chapter 6: Test and Evaluation** outlines testing strategies including use case testing, boundary value analysis, performance testing, and stress testing. It presents test results, identifies issues discovered, and proposes improvements for future iterations.

**References** lists all external resources, libraries, frameworks, APIs, and documentation consulted during development.

Each chapter builds upon previous sections, progressing from high-level concepts to detailed implementation specifics, ensuring comprehensive system documentation.

---

## CHAPTER 2: SYSTEM REQUIREMENTS AND SPECIFICATION

### 2.1. Purpose

#### 2.1.1. Document Conventions

This document employs the following conventions for clarity and consistency:

- **Bold text** indicates primary concepts, feature names, or emphasis
- _Italic text_ denotes technical terms, file names, or variable names
- `Code formatting` represents code snippets, API endpoints, file paths, and terminal commands
- **MUST**, **SHALL**, **SHOULD** follow RFC 2119 terminology for requirement levels:
  - **MUST/SHALL**: Absolute requirement
  - **SHOULD**: Recommended but not mandatory
  - **MAY**: Optional feature
- Numbered lists indicate sequential steps or hierarchical relationships
- Bullet points present related items without implied sequence

**Requirement Priority Levels:**

- **P0 (Critical)**: Core functionality; system inoperable without it
- **P1 (High)**: Major features; significant impact on user experience
- **P2 (Medium)**: Important but not critical; workarounds possible
- **P3 (Low)**: Nice-to-have features; minimal impact if absent

#### 2.1.2. Intended Audience

This specification serves multiple stakeholders with distinct information needs:

**Developers:**  
Technical implementation details, API specifications, database schemas, processing algorithms, and integration requirements. Provides guidance for extending functionality, debugging issues, and maintaining code quality.

**System Architects:**  
High-level architecture, component interactions, technology stack decisions, scalability considerations, and design patterns employed. Enables assessment of system structure and future evolution planning.

**Quality Assurance Engineers:**  
Functional requirements, acceptance criteria, expected behaviors, error handling specifications, and performance benchmarks. Facilitates test case development and validation procedures.

**Project Managers:**  
Feature scope, deliverables, requirement priorities, dependencies, and constraints. Supports project planning, resource allocation, and stakeholder communication.

**End Users:**  
System capabilities, supported file formats, operational constraints, and expected outcomes. While technical in nature, sections describing features and interfaces inform user expectations.

**Documentation Writers:**  
Complete system behavior specification enabling creation of user manuals, tutorials, and help documentation.

### 2.2. Overall Description

#### 2.2.1. Service Perspective

The Text Finder App operates as a standalone desktop application with client-server architecture. The system consists of two primary components:

**Electron Desktop Client:**  
Provides native operating system integration, file system access, and graphical user interface. Runs on macOS, Windows, and Linux platforms without browser dependencies. Handles user interactions, file selection, and result presentation.

**Django REST API Server:**  
Executes on localhost (127.0.0.1:8000) processing file uploads, performing text extraction, managing database operations, and serving search queries. Operates independently from the desktop client, enabling potential future web or mobile interfaces.

**System Boundaries:**

- Self-contained application requiring no external service accounts for core functionality
- Google Speech Recognition API used for audio/video processing (internet connection required)
- Local file system for uploaded file storage
- SQLite database for persistent data storage
- No cloud dependencies for text extraction or search operations

**Operating Environment:**

- Desktop computers running macOS 10.13+, Windows 10+, or Linux distributions
- Minimum 4GB RAM recommended for processing large files
- 500MB free disk space for application and temporary file processing
- Internet connection required only for audio/video file processing

#### 2.2.2. Service Function

The Text Finder App provides centralized text extraction and search across heterogeneous file formats, eliminating the need for format-specific tools or manual conversion workflows.

**Core Functions:**

1. **Format-Agnostic Upload:**  
   Accepts files regardless of format through unified interface. System automatically detects file type via extension and routes to appropriate extraction handler.

2. **Intelligent Text Extraction:**  
   Applies format-specific processing: direct text parsing for structured documents, OCR for visual content, speech recognition for audio streams. Extraction occurs transparently without user configuration.

3. **Word-Level Indexing:**  
   Tokenizes extracted text into individual words, storing each with file association. Enables granular search operations and frequency analysis.

4. **Cross-File Search:**  
   Queries indexed words across all uploaded files simultaneously. Returns aggregated results showing which files contain search terms and match frequencies.

5. **Batch Processing:**  
   Processes entire directory structures recursively. Maintains file organization while extracting text from all supported formats within the hierarchy.

6. **Result Presentation:**  
   Displays search matches grouped by source file with occurrence counts. Provides statistics on total matches and files containing the search term.

#### 2.2.3. Product Functions

**Primary Functions:**

**F1: File Upload (P0)**

- Single file upload via file picker or drag-and-drop
- Multiple file selection support
- Supported formats: TXT, DOCX, XLSX, PDF, CSV, PNG, JPG, JPEG, WAV, MP4
- Upload progress indication
- Error handling for unsupported formats

**F2: Directory Upload (P0)**

- Recursive directory selection
- Automatic ZIP creation from directory structure
- Batch processing of all supported files
- Progress reporting per file
- Maintains original file paths and names

**F3: Text Extraction (P0)**

- **Text Documents:** Direct content parsing from TXT files
- **Word Documents:** Paragraph and text extraction from DOCX files via python-docx
- **Excel Spreadsheets:** Cell content extraction from XLSX files via openpyxl
- **PDF Documents:** Text layer extraction via PyPDF2
- **CSV Files:** Comma-separated value parsing with word tokenization
- **Images:** OCR processing via Tesseract for PNG, JPG, JPEG formats
- **Audio Files:** Speech-to-text transcription for WAV files via Google Speech Recognition
- **Video Files:** Audio extraction followed by speech recognition for MP4 files

**F4: Word Indexing (P0)**

- Tokenization of extracted text into individual words
- Storage of word-file associations in database
- Duplicate word handling (same word appearing multiple times)
- Case-insensitive storage
- Special character handling

**F5: Word Search (P0)**

- **Exact Match:** Case-insensitive complete word matching
- **Contains Match:** Substring search within words
- Real-time search execution
- Result aggregation by source file
- Match count statistics

**F6: File Management (P1)**

- View list of uploaded files
- Individual file deletion with cascade delete of associated words
- Bulk file deletion
- Physical file removal from storage
- Database record cleanup

**F7: Search Results Display (P1)**

- Tabular presentation of matches
- File name and word display
- Occurrence count per file
- Total matches and files found statistics
- Visual indicators for result status

**F8: User Interface (P1)**

- Splash screen during application launch
- Upload mode toggle (files vs. directory)
- Drag-and-drop zones
- Status notifications
- Responsive layout
- Consistent color scheme (#3629B7 primary color)

#### 2.2.4. User Classes and Characteristics

**Primary User Class: Information Workers**

**Characteristics:**

- Manages document collections across multiple formats
- Requires frequent text searching across files
- Values efficiency and consolidated workflows
- Comfortable with desktop applications
- Privacy-conscious regarding document handling

**Technical Proficiency:** Basic to intermediate computer skills; familiar with file management, drag-and-drop operations, and desktop application usage

**Usage Frequency:** Daily to weekly, depending on document processing needs

**Key Requirements:**

- Simple, intuitive interface
- Fast search results
- Support for commonly used file formats
- Local processing for sensitive documents
- Minimal configuration required

**Secondary User Class: Researchers and Analysts**

**Characteristics:**

- Processes large volumes of research materials
- Works with diverse file types (papers, datasets, transcripts)
- Needs cross-reference capabilities
- Operates with structured workflows

**Technical Proficiency:** Intermediate to advanced; comfortable with technical tools and APIs

**Usage Frequency:** Daily; intensive usage periods during active research

**Key Requirements:**

- Batch processing capabilities
- Accurate text extraction
- Comprehensive search options
- Performance with large file collections

**Tertiary User Class: Legal and Compliance Professionals**

**Characteristics:**

- Reviews contracts, agreements, and correspondence
- Requires keyword discovery across document sets
- Values accuracy and completeness
- Handles confidential information

**Technical Proficiency:** Basic to intermediate

**Usage Frequency:** Daily; sustained usage during case preparation

**Key Requirements:**

- Precise text extraction
- Audit trail capabilities
- Local processing (no cloud upload)
- Support for PDF and DOCX formats

#### 2.2.5. Assumptions and Dependencies

**Assumptions:**

1. **Single User Operation:**  
   Application designed for single-user desktop environment. No concurrent multi-user access required. Each installation operates independently.

2. **Local Network Environment:**  
   Backend server runs on localhost. No production deployment to remote servers anticipated in current scope.

3. **File Format Compliance:**  
   Uploaded files adhere to standard format specifications. Corrupted or malformed files may fail processing.

4. **Reasonable File Sizes:**  
   Individual files do not exceed practical memory limits (~100MB). Extremely large files may cause processing delays or failures.

5. **Internet Access for Media:**  
   Audio and video processing requires internet connectivity for Google Speech Recognition API. Other file types process offline.

6. **Operating System Permissions:**  
   Application has necessary file system read/write permissions. User grants access when prompted.

7. **Python Runtime Available:**  
   Django backend requires Python 3.12+ runtime environment properly configured.

8. **Node.js Runtime Available:**  
   Electron frontend requires Node.js 22+ for execution.

**Dependencies:**

**External Libraries (Backend):**

- Django 5.0.6 - Web framework and ORM
- djangorestframework 3.15.2 - REST API framework
- django-cors-headers 4.3.1 - CORS middleware
- python-docx 1.1.2 - DOCX file processing
- openpyxl 3.1.2 - XLSX file processing
- PyPDF2 - PDF text extraction
- pytesseract 0.3.13 - OCR wrapper for Tesseract
- Pillow 11.2.1 - Image processing
- SpeechRecognition 3.10.4 - Audio transcription
- moviepy 2.2.1 - Video processing

**External Libraries (Frontend):**

- Electron 37.5.1 - Desktop application framework
- jQuery 3.7.1 - DOM manipulation and AJAX
- JSZip 3.10.1 - ZIP file creation
- Bootstrap Icons 1.11.3 - UI iconography

**External Services:**

- Google Speech Recognition API - Audio/video transcription (free tier)

**System Dependencies:**

- Tesseract OCR Engine - Must be installed separately on host system
- FFmpeg - Required by moviepy for video processing
- SQLite 3 - Bundled with Python; no separate installation needed

**Operating System Requirements:**

- File system write access for media storage
- Network socket availability for localhost server
- System PATH configuration for external binaries (Tesseract)

### 2.3. External Interface Requirements

#### 2.3.1. User Interfaces

**UI-1: Splash Screen**

- **Purpose:** Display during application launch
- **Elements:**
  - Application logo with gradient effect
  - Application title and subtitle
  - Loading progress indicator
  - Animated transitions
- **Duration:** 2.5 seconds minimum
- **Behavior:** Automatically transitions to main upload screen

**UI-2: File Upload Screen**

- **Purpose:** Primary interface for file and directory uploads
- **Layout:** Two-column responsive layout
- **Left Column Elements:**
  - Upload mode toggle (Files/Directory radio buttons)
  - Drag-and-drop zone with visual feedback
  - Hidden file input elements
  - Upload button with icon
  - Status message area
  - Quick action buttons (Search, Clear All)
- **Right Column Elements:**
  - Uploaded files table
  - File count badge
  - File name display with word count
  - Delete buttons per file
- **Interactions:**
  - Drag-and-drop file selection
  - Click to open native file picker
  - Mode toggle changes upload behavior
  - Visual feedback on hover and drag-over
  - Status messages fade after 5 seconds

**UI-3: Search Screen**

- **Purpose:** Word search interface and results display
- **Layout:** Sidebar with content area
- **Sidebar Elements:**
  - Search term input field
  - Search button
  - Search type radio buttons (Exact/Contains)
  - Statistics cards (Total matches, Files found)
  - Back to Upload button
- **Content Area Elements:**
  - Default ready state with instructions
  - Results table (Word match, Found in file, Count columns)
  - Loading spinner during search
  - No results state with message
  - Results count badge
- **Interactions:**
  - Form submission triggers search
  - Radio button changes update placeholder text
  - Results animate in with slide-up effect
  - Empty state displays when no matches found

**UI-4: Visual Design System**

- **Primary Color:** #3629B7 (Brand blue-purple)
- **Typography:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Font Sizes:**
  - Headers: 1.5rem - 2rem
  - Body: 1rem
  - Small text: 0.875rem
- **Spacing:** 8px base unit with 4px, 8px, 16px, 24px, 32px scale
- **Border Radius:** 12px for cards, 8px for buttons, 6px for inputs
- **Shadows:** Layered shadows for depth (0 2px 8px, 0 4px 16px)
- **Animations:**
  - Fade-in: 0.3s ease
  - Slide-up: 0.4s ease
  - Loading spinner: continuous rotation

#### 2.3.2. Hardware Interface

**HW-1: File System Access**

- **Interface Type:** Operating system file system APIs
- **Operations:**
  - Read access to user-selected files
  - Write access to application media directory
  - Directory traversal for recursive uploads
  - File deletion capabilities
- **Paths:**
  - Media storage: `backend/media/media/`
  - Database file: `backend/db.sqlite3`
- **Constraints:**
  - File size limited by available disk space
  - Path length limitations per operating system
  - File permission requirements

**HW-2: Network Interface**

- **Interface Type:** Local loopback (127.0.0.1)
- **Protocol:** HTTP/1.1
- **Port:** 8000 (configurable)
- **Operations:**
  - POST requests for file uploads
  - GET requests for data retrieval
  - DELETE requests for file removal
- **Constraints:**
  - Port must be available (not in use by other applications)
  - Firewall must permit localhost connections

**HW-3: Memory Requirements**

- **Minimum RAM:** 4GB
- **Recommended RAM:** 8GB+
- **Memory Usage:**
  - Electron process: ~100-200MB baseline
  - Django process: ~50-100MB baseline
  - File processing: Variable based on file size
  - Peak usage during large file processing: May reach 1-2GB

**HW-4: Storage Requirements**

- **Application Size:** ~500MB including dependencies
- **Media Storage:** Grows with uploaded files (1:1 ratio with original files)
- **Database Storage:** Approximately 1KB per 10 extracted words
- **Temporary Storage:** Up to 2x largest file size during processing

#### 2.3.3. Software Interface

**SW-1: Django REST Framework**

- **Interface:** HTTP REST API
- **Base URL:** `http://127.0.0.1:8000`
- **Content Type:** application/json, multipart/form-data
- **Authentication:** None (localhost only)
- **CORS:** Enabled for all origins (development mode)

**SW-2: SQLite Database**

- **Interface:** Django ORM
- **Version:** SQLite 3.x
- **Location:** `backend/db.sqlite3`
- **Tables:**
  - `TextFinderApp_uploadedfiles`: File metadata and references
  - `TextFinderApp_filewords`: Extracted word records
- **Operations:** INSERT, SELECT, DELETE via Django models

**SW-3: Tesseract OCR Engine**

- **Interface:** Command-line execution via pytesseract wrapper
- **Version:** 4.x or 5.x
- **Input:** Image file paths
- **Output:** Text strings
- **Configuration:**
  - Language: English (eng)
  - PSM mode: Auto
  - Windows path: `C:\Program Files\Tesseract-OCR\tesseract.exe`

**SW-4: Google Speech Recognition API**

- **Interface:** HTTP API via SpeechRecognition library
- **Service:** Google Web Speech API
- **Input:** Audio data (WAV format)
- **Output:** Transcribed text strings
- **Language:** English (en)
- **Constraints:**
  - Requires internet connection
  - Free tier usage limits apply
  - No API key required (public endpoint)

**SW-5: Electron IPC (Inter-Process Communication)**

- **Interface:** contextBridge and ipcRenderer
- **Purpose:** Communication between main and renderer processes
- **Channels:**
  - `http-request`: General HTTP requests
  - `upload-files`: File upload operations
  - `upload-directory`: Directory upload operations
- **Data Format:** JSON-serializable objects

**SW-6: Operating System APIs**

- **File Dialogs:** Native file picker via Electron dialog module
- **Window Management:** BrowserWindow creation and lifecycle
- **Menu System:** Native menus via Electron Menu module
- **Process Management:** Node.js child_process for external commands

### 2.4. System Features

#### 2.4.1. File Upload

**Description:**  
Enables users to select and upload individual files for text extraction and indexing.

**Priority:** P0 (Critical)

**Functional Requirements:**

**FR-1.1:** System SHALL accept file uploads through drag-and-drop interface  
**FR-1.2:** System SHALL accept file uploads through native file picker dialog  
**FR-1.3:** System SHALL support multiple file selection in single upload operation  
**FR-1.4:** System SHALL restrict uploads to supported file extensions: .txt, .docx, .xlsx, .pdf, .csv, .png, .jpg, .jpeg, .wav, .mp4  
**FR-1.5:** System SHALL display visual feedback during file selection (filename and count)  
**FR-1.6:** System SHALL create database record in UploadedFiles table for each file  
**FR-1.7:** System SHALL store uploaded files in `media/media/` directory  
**FR-1.8:** System SHALL preserve original filename in database record  
**FR-1.9:** System SHALL generate unique storage filename to prevent collisions  
**FR-1.10:** System SHALL return upload success status with file count and word count  
**FR-1.11:** System SHALL display error messages for unsupported file types  
**FR-1.12:** System SHALL show upload progress indicator during processing

**Stimulus/Response Sequences:**

**Scenario 1: Successful Single File Upload**

1. User drags TXT file onto upload zone
2. System highlights upload zone (drag-over visual feedback)
3. User releases file
4. System displays filename in upload area
5. User clicks Upload button
6. System shows "Uploading files..." status with spinner
7. System saves file to media directory
8. System extracts text and stores words in database
9. System displays "Files uploaded successfully!" message
10. System refreshes uploaded files table

**Scenario 2: Multiple File Upload**

1. User clicks upload area
2. System opens native file picker
3. User selects 3 DOCX files
4. System displays "3 file(s) selected" with filenames
5. User clicks Upload button
6. System processes each file sequentially
7. System displays success message
8. System updates files table with all 3 files

**Scenario 3: Unsupported File Type**

1. User selects .exe file
2. User clicks Upload button
3. System attempts processing
4. System detects unsupported extension
5. System displays error message
6. System does not create database records

#### 2.4.2. Directory Upload

**Description:**  
Enables users to upload entire directory structures for recursive batch processing.

**Priority:** P0 (Critical)

**Functional Requirements:**

**FR-2.1:** System SHALL provide directory selection mode toggle  
**FR-2.2:** System SHALL accept directory selection via native OS directory picker  
**FR-2.3:** System SHALL create ZIP archive from selected directory in-memory  
**FR-2.4:** System SHALL send ZIP archive to server for processing  
**FR-2.5:** System SHALL extract ZIP contents to temporary directory on server  
**FR-2.6:** System SHALL recursively process all supported files in directory tree  
**FR-2.7:** System SHALL maintain original file paths as original_filename  
**FR-2.8:** System SHALL display processing status for directory operations  
**FR-2.9:** System SHALL show count of files found in selected directory  
**FR-2.10:** System SHALL report success count and error count after processing  
**FR-2.11:** System SHALL clean up temporary files after processing completion  
**FR-2.12:** System SHALL handle nested subdirectories to arbitrary depth

**Stimulus/Response Sequences:**

**Scenario 1: Directory Upload with Mixed Files**

1. User toggles to "Directory" mode
2. System updates UI to show directory upload instructions
3. User clicks upload area
4. System opens directory selection dialog
5. User selects folder containing 10 files (5 supported, 5 unsupported)
6. System displays "Directory selected: FolderName" with "10 files found"
7. User clicks "Upload Directory" button
8. System creates ZIP from directory contents
9. System uploads ZIP to server
10. System shows "Processing directory..." status
11. Server extracts ZIP and processes each file
12. Server successfully processes 5 supported files
13. Server skips 5 unsupported files
14. System displays "Successfully processed 5 files" message
15. System shows details: "✓ 5 files processed successfully"

**Scenario 2: Empty Directory**

1. User selects empty directory
2. System displays "0 files found in directory"
3. User clicks Upload button
4. System displays warning "No supported files found in the directory"
5. System does not create database records

#### 2.4.3. Text Extraction

**Description:**  
Extracts textual content from uploaded files using format-specific processing methods.

**Priority:** P0 (Critical)

**Functional Requirements:**

**FR-3.1:** System SHALL detect file format based on file extension  
**FR-3.2:** System SHALL extract text from TXT files using UTF-8 encoding  
**FR-3.3:** System SHALL extract paragraph text from DOCX files using python-docx library  
**FR-3.4:** System SHALL extract cell contents from XLSX files using openpyxl library  
**FR-3.5:** System SHALL extract text layer from PDF files using PyPDF2 library  
**FR-3.6:** System SHALL parse CSV files and extract cell contents as words  
**FR-3.7:** System SHALL perform OCR on PNG, JPG, JPEG files using Tesseract  
**FR-3.8:** System SHALL transcribe WAV audio files using Google Speech Recognition  
**FR-3.9:** System SHALL extract audio from MP4 video files using moviepy  
**FR-3.10:** System SHALL transcribe extracted audio using speech recognition  
**FR-3.11:** System SHALL tokenize extracted text into individual words (space-delimited)  
**FR-3.12:** System SHALL create FileWords record for each unique word occurrence  
**FR-3.13:** System SHALL associate each word with source file via foreign key  
**FR-3.14:** System SHALL handle extraction failures gracefully with error messages  
**FR-3.15:** System SHALL clean up temporary audio files after video processing

**Processing Method by File Type:**

| File Extension    | Extraction Method                 | Library/Tool                    | Output                      |
| ----------------- | --------------------------------- | ------------------------------- | --------------------------- |
| .txt              | Direct text read                  | Python built-in                 | Raw text string             |
| .docx             | Paragraph extraction              | python-docx                     | Concatenated paragraph text |
| .xlsx             | Cell value iteration              | openpyxl                        | Cell contents as strings    |
| .pdf              | Page text extraction              | PyPDF2                          | Concatenated page text      |
| .csv              | Row/cell parsing                  | Python csv module               | Cell contents               |
| .png, .jpg, .jpeg | Optical Character Recognition     | Tesseract OCR (via pytesseract) | Recognized text             |
| .wav              | Speech-to-text                    | Google Speech Recognition API   | Transcribed text            |
| .mp4              | Audio extraction + speech-to-text | moviepy + Speech Recognition    | Transcribed text            |

**Stimulus/Response Sequences:**

**Scenario 1: Text File Extraction**

1. System receives uploaded TXT file
2. System opens file with UTF-8 encoding
3. System reads entire file content
4. System splits content on whitespace
5. System creates word dictionary with indices
6. System saves each word to FileWords table
7. System returns success with word count

**Scenario 2: Image OCR Extraction**

1. System receives uploaded PNG file
2. System verifies Tesseract installation
3. System opens image using Pillow
4. System calls pytesseract.image_to_string()
5. System receives recognized text
6. System tokenizes text into words
7. System saves words to database
8. System returns success with word count

**Scenario 3: Video Processing**

1. System receives uploaded MP4 file
2. System creates VideoFileClip object
3. System generates temporary WAV file path
4. System extracts audio track to WAV
5. System initializes speech recognizer
6. System transcribes audio to text
7. System tokenizes transcription
8. System saves words to database
9. System deletes temporary WAV file
10. System returns success with word count

#### 2.4.4. Word Search

**Description:**  
Searches indexed words across all uploaded files with configurable matching strategies.

**Priority:** P0 (Critical)

**Functional Requirements:**

**FR-4.1:** System SHALL provide text input field for search term entry  
**FR-4.2:** System SHALL support exact match search (case-insensitive)  
**FR-4.3:** System SHALL support contains match search (substring, case-insensitive)  
**FR-4.4:** System SHALL query FileWords table based on selected search type  
**FR-4.5:** System SHALL use `word__iexact` filter for exact matching  
**FR-4.6:** System SHALL use `word__icontains` filter for substring matching  
**FR-4.7:** System SHALL return all matching FileWords records with associated file information  
**FR-4.8:** System SHALL aggregate results by source file  
**FR-4.9:** System SHALL calculate match count per file  
**FR-4.10:** System SHALL display total match count across all files  
**FR-4.11:** System SHALL display unique file count containing matches  
**FR-4.12:** System SHALL present results in tabular format  
**FR-4.13:** System SHALL show original filename for each result  
**FR-4.14:** System SHALL display "No results found" message when no matches exist  
**FR-4.15:** System SHALL update search placeholder text based on selected match type

**Stimulus/Response Sequences:**

**Scenario 1: Exact Match Search - Results Found**

1. User enters "python" in search field
2. User selects "Exact match" radio button
3. User clicks Search button
4. System disables search button, shows "Searching..." with spinner
5. System sends POST request with {"wordsearch": "python", "search_type": "exact"}
6. Backend queries: `FileWords.objects.filter(word__iexact="python")`
7. Backend finds 15 matching records across 3 files
8. Backend returns JSON with total_results: 15 and results array
9. System processes results, groups by filename
10. System displays statistics: "15 Total Matches, 3 Files Found"
11. System populates results table with 3 rows
12. System shows match counts per file
13. System re-enables search button

**Scenario 2: Contains Match Search**

1. User enters "test" in search field
2. User selects "Contains word" radio button
3. System updates placeholder to "Enter text to find within words..."
4. User clicks Search button
5. System queries with contains filter
6. Backend finds words: "test", "testing", "unittest", "latest"
7. System displays all matching words with their files
8. Results show partial matches highlighted

**Scenario 3: No Results Found**

1. User searches for "xyz123"
2. System executes query
3. Backend returns empty results array
4. System hides results table
5. System displays "No results found" state with message
6. System shows 0 matches and 0 files in statistics

### 2.5. Other Nonfunctional Requirements

#### 2.5.1. Performance Requirements

**PR-1: File Upload Response Time**

- Individual file uploads SHALL complete within 5 seconds for files under 10MB
- Directory uploads SHALL process at minimum rate of 2 files per second
- Upload progress indicators MUST update within 500ms of state changes

**PR-2: Text Extraction Speed**

- Text-based formats (TXT, DOCX, XLSX, PDF, CSV) SHALL process within 2 seconds per file
- Image OCR SHALL complete within 10 seconds for standard resolution images (up to 3000x3000 pixels)
- Audio transcription SHALL process at rate of 1 minute audio per 30 seconds processing time
- Video processing SHALL extract audio and transcribe within 2x video duration

**PR-3: Search Response Time**

- Exact match searches SHALL return results within 1 second for databases containing up to 100,000 words
- Contains match searches SHALL return results within 2 seconds for same database size
- Search interface SHALL remain responsive during query execution

**PR-4: UI Responsiveness**

- Button clicks and interactions SHALL provide visual feedback within 100ms
- Page transitions SHALL complete within 300ms
- Status message updates SHALL appear within 200ms of operation completion

**PR-5: Concurrent Operations**

- System SHALL handle 5 concurrent file uploads without degradation
- Database operations SHALL support 10 concurrent read queries
- UI SHALL remain responsive during background processing

**PR-6: Resource Utilization**

- Application SHALL NOT exceed 2GB RAM usage under normal operation
- File processing SHALL NOT block UI thread for more than 100ms
- Temporary files SHALL be deleted within 5 seconds of processing completion

#### 2.5.2. Safety Requirements

**SR-1: Data Integrity**

- System SHALL maintain referential integrity between FileWords and UploadedFiles tables
- File deletion SHALL cascade delete all associated word records
- Database transactions SHALL be atomic (all-or-nothing operations)
- Corrupted file uploads SHALL NOT create partial database records

**SR-2: File System Safety**

- System SHALL verify write permissions before file operations
- System SHALL handle disk full conditions gracefully
- System SHALL NOT overwrite existing files in media directory
- System SHALL generate unique filenames using hash-based naming

**SR-3: Error Handling**

- System SHALL catch and log all exceptions during file processing
- Failed uploads SHALL NOT crash the application
- Database connection failures SHALL display user-friendly error messages
- System SHALL recover gracefully from external service failures (OCR, speech recognition)

**SR-4: Input Validation**

- System SHALL validate file extensions before processing
- System SHALL reject files exceeding size limits
- System SHALL sanitize filenames to prevent path traversal attacks
- System SHALL validate search input for SQL injection patterns

**SR-5: Process Isolation**

- Electron renderer process SHALL operate in sandboxed environment
- Context isolation SHALL be enabled between main and renderer processes
- Node integration SHALL be disabled in renderer process
- IPC communication SHALL use secure contextBridge API

#### 2.5.3. Software Quality Attributes

**Usability:**

- Interface SHALL be navigable without training or documentation
- Error messages SHALL clearly indicate problem and resolution steps
- Visual feedback SHALL confirm all user actions within 200ms
- Drag-and-drop SHALL provide clear visual cues (highlighted zones, cursor changes)
- Search results SHALL be scannable with clear visual hierarchy

**Reliability:**

- Application SHALL run continuously for 8+ hours without crashes
- Failed operations SHALL NOT corrupt existing data
- System SHALL recover from network interruptions during audio/video processing
- Database operations SHALL maintain consistency under concurrent access

**Maintainability:**

- Code SHALL follow modular architecture with clear separation of concerns
- Functions SHALL have single responsibility and limited complexity
- API endpoints SHALL follow RESTful conventions
- Database schema SHALL use clear, descriptive naming
- Comments SHALL explain complex logic and business rules

**Portability:**

- Application SHALL run on macOS 10.13+, Windows 10+, Linux (Ubuntu 18.04+)
- System SHALL detect and adapt to platform-specific paths (Tesseract location)
- UI SHALL adapt to different screen resolutions (1280x720 minimum)
- Application SHALL build for all platforms using electron-builder

**Scalability:**

- System SHALL handle databases containing 1,000,000+ words without degradation
- File table SHALL efficiently display 1000+ uploaded files
- Search operations SHALL use database indexing for performance
- System SHALL process directories containing 500+ files

**Security:**

- System SHALL run on localhost only (127.0.0.1)
- No authentication required (single-user desktop application)
- Uploaded files SHALL remain on local file system
- No telemetry or external data transmission (except Google Speech API for audio/video)
- CORS SHALL be restricted in production deployment

### 2.6. Other Requirements

**Legal Requirements:**

**LR-1: Open Source Licensing**

- Application SHALL comply with licenses of all dependencies
- Django (BSD License), Electron (MIT License), Python libraries (various permissive licenses)
- Attribution SHALL be provided for all third-party components

**LR-2: API Usage Terms**

- Google Speech Recognition API usage SHALL comply with Google's terms of service
- Application SHALL NOT exceed API rate limits
- Users SHALL be informed that audio/video processing uses external service

**Localization Requirements:**

**LOC-1: Language Support**

- Current version: English language UI only
- Text extraction: English language optimized (Tesseract OCR English model, Google Speech Recognition English)
- Future versions MAY support additional languages

**Documentation Requirements:**

**DOC-1: Technical Documentation**

- System architecture SHALL be documented
- API endpoints SHALL include request/response examples
- Database schema SHALL be documented with ER diagrams
- Setup instructions SHALL cover all platforms

**DOC-2: User Documentation**

- User guide SHALL explain all features
- Troubleshooting section SHALL address common issues
- File format support SHALL be clearly listed

**Installation Requirements:**

**INST-1: Dependency Installation**

- Application SHALL provide clear installation instructions
- External dependencies (Tesseract) SHALL be documented
- Installation package SHALL be under 200MB
- First-time setup SHALL complete within 10 minutes

**INST-2: Distribution**

- Application SHALL be packaged as native installers (.dmg for macOS, .exe for Windows, .AppImage for Linux)
- Installers SHALL include all necessary dependencies except system-level requirements
- Auto-update capability MAY be implemented in future versions

---
