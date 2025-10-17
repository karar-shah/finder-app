# Text Finder App - Use Case Models & Fully Dressed Use Cases Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Actors Identification](#actors-identification)
3. [Use Case Models](#use-case-models)
4. [Fully Dressed Use Cases](#fully-dressed-use-cases)
5. [Use Case Tables](#use-case-tables)
6. [System Architecture Context](#system-architecture-context)

## System Overview

The Text Finder App is a file processing and text extraction system that allows users to upload various file formats, extract text content, and search through the extracted words. The system supports multiple file types including documents, images, audio, and video files.

### Core System Capabilities

- Multi-format file upload and processing
- Directory/batch file processing
- Text extraction using various techniques (OCR, speech recognition, document parsing)
- Word indexing and storage
- Text search functionality
- File and data management

## Actors Identification

### Primary Actors

1. **End User** - The person using the application to upload files and search for text
2. **System Administrator** - Manages the system, database, and file storage

### Secondary Actors

1. **External APIs**:
   - Google Speech Recognition API (for audio processing)
   - Tesseract OCR Engine (for image text extraction)
2. **File System** - For storing uploaded files
3. **Database** - For storing file metadata and extracted words

## Use Case Models

### High-Level Use Cases

#### 1. File Management Use Cases

- UC01: Upload Single File
- UC02: Upload Directory (Batch Upload)
- UC03: Delete Individual Word
- UC04: Delete Entire File
- UC05: Clear All Files

#### 2. Text Processing Use Cases

- UC06: Extract Text from Document Files
- UC07: Extract Text from Images (OCR)
- UC08: Extract Text from Audio Files
- UC09: Extract Text from Video Files
- UC10: Process Multiple File Formats

#### 3. Search and Retrieval Use Cases

- UC11: Search Words (Exact Match)
- UC12: Search Words (Contains Match)
- UC13: View All Extracted Words
- UC14: Get File Processing Results

### Use Case Diagram Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Text Finder System                       │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   File Upload   │◄──►│     Text Processing            │ │
│  │   & Management  │    │                                │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
│           │                           │                     │
│           ▼                           ▼                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            Search & Retrieval                           │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ▲                                            ▲
         │                                            │
    [End User]                              [System Administrator]
```

## Fully Dressed Use Cases

### UC01: Upload Single File

**Use Case ID**: UC01  
**Use Case Name**: Upload Single File  
**Created By**: System Analyst  
**Date Created**: [Current Date]  
**Last Updated**: [Current Date]

#### Brief Description

Allows a user to upload a single file to the system for text extraction and processing.

#### Primary Actor

End User

#### Secondary Actors

- File System
- Database
- External Processing APIs (Google Speech API, Tesseract OCR)

#### Preconditions

- System is running and accessible
- User has access to the upload interface
- File to be uploaded exists and is accessible

#### Main Success Scenario

1. User selects file upload option
2. System displays file selection interface
3. User selects a file from their local system
4. System validates file type against supported formats
5. System uploads and stores the file in the media directory
6. System creates a record in UploadedFiles table with file metadata
7. System determines file type and routes to appropriate text extraction method:
   - TXT files: Direct text reading
   - DOCX files: Document parsing using python-docx
   - XLSX files: Spreadsheet parsing using openpyxl
   - PDF files: Text extraction using PyPDF2
   - WAV files: Speech recognition using Google Speech API
   - MP4 files: Audio extraction + speech recognition
   - PNG/JPG/JPEG files: OCR using Tesseract
   - CSV files: Cell content parsing
8. System extracts individual words from the processed text
9. System stores each word in FileWords table with reference to the uploaded file
10. System returns success response with processing statistics
11. User receives confirmation of successful upload and word count

#### Alternative Flows

**A1: Unsupported File Type**

- 4a. System detects unsupported file format
- 4b. System returns error message indicating unsupported file type
- 4c. Use case ends

**A2: File Processing Error**

- 8a. Error occurs during text extraction (e.g., corrupted file, API failure)
- 8b. System logs error details
- 8c. System cleans up database record for the failed file
- 8d. System returns error message to user
- 8e. Use case ends

**A3: Empty or No Text Content**

- 8a. Text extraction completes but no readable content found
- 8b. System creates file record but no word entries
- 8c. System returns success with zero word count
- 8d. Use case continues

#### Postconditions

**Success Postcondition:**

- File is stored in the system's media directory
- File metadata record exists in UploadedFiles table
- Extracted words are stored in FileWords table
- User receives confirmation of processing results

**Failure Postcondition:**

- No file record is created in database
- No physical file is stored
- User receives error notification

#### Business Rules

- BR01: Only supported file types are processed
- BR02: Each word is stored individually for granular search capabilities
- BR03: Original filename is preserved for user reference
- BR04: File processing must be atomic (all-or-nothing)

#### Special Requirements

- SR01: System must handle files up to reasonable size limits
- SR02: Text extraction must preserve word boundaries
- SR03: System must provide progress feedback for large files

#### Technology and Data Variations

- Files are stored in configurable media directory
- Database uses Django ORM with SQLite/PostgreSQL
- External APIs require internet connectivity

---

### UC02: Upload Directory (Batch Upload)

**Use Case ID**: UC02  
**Use Case Name**: Upload Directory (Batch Processing)  
**Created By**: System Analyst  
**Date Created**: [Current Date]

#### Brief Description

Allows users to upload an entire directory structure as a ZIP file for batch processing of multiple files.

#### Primary Actor

End User

#### Secondary Actors

- File System
- Database
- External Processing APIs

#### Preconditions

- System is running and accessible
- User has a ZIP file containing the directory to upload
- ZIP file contains at least one supported file type

#### Main Success Scenario

1. User selects directory upload option
2. System displays ZIP file upload interface
3. User selects a ZIP file containing their directory
4. System validates that uploaded file is a valid ZIP archive
5. System creates temporary directory for extraction
6. System extracts ZIP file contents to temporary directory
7. System recursively scans extracted directory for supported file types
8. For each supported file found:
   a. System processes file using same logic as UC01 (single file upload)
   b. System maintains relative path structure in original_filename
   c. System creates UploadedFiles record and extracts words
9. System compiles processing results for all files
10. System cleans up temporary directory
11. System returns summary of processing results including:
    - Number of files processed successfully
    - Number of files with errors
    - Total words extracted
    - List of processed files with individual results
12. User receives comprehensive processing report

#### Alternative Flows

**A1: Invalid ZIP File**

- 4a. System cannot extract ZIP file (corrupted or invalid format)
- 4b. System returns error message
- 4c. Use case ends

**A2: No Supported Files Found**

- 7a. ZIP contains no files with supported extensions
- 7b. System returns warning message indicating no processable files
- 7c. Use case ends with warning status

**A3: Partial Processing Failure**

- 8a. Some files process successfully, others fail
- 8b. System continues processing remaining files
- 8c. System returns partial success status with detailed error list
- 8d. Successfully processed files remain in system

#### Postconditions

**Success Postcondition:**

- All processable files are stored and indexed
- Batch processing summary is available
- Directory structure is preserved in filenames

**Failure Postcondition:**

- No files are processed if ZIP is invalid
- Partial results stored if some files succeed

---

### UC11: Search Words (Exact Match)

**Use Case ID**: UC11  
**Use Case Name**: Search Words with Exact Match  
**Created By**: System Analyst  
**Date Created**: [Current Date]

#### Brief Description

Allows users to search for exact word matches across all processed files.

#### Primary Actor

End User

#### Secondary Actors

Database

#### Preconditions

- System has processed files with extracted words
- At least one word exists in the FileWords table

#### Main Success Scenario

1. User accesses search functionality
2. System displays search interface
3. User enters search term
4. User selects "exact match" search type (or system defaults to exact)
5. System queries FileWords table using case-insensitive exact match
6. System retrieves matching word records with associated file information
7. System formats results including:
   - Word ID
   - Matched word
   - Source file path
   - Original filename
   - File ID
8. System returns formatted search results
9. User reviews search results

#### Alternative Flows

**A1: No Matches Found**

- 5a. Query returns no matching records
- 5b. System returns empty result set with appropriate message
- 5c. User receives "no matches found" notification

**A2: Empty Search Term**

- 3a. User submits empty or whitespace-only search term
- 3b. System validates input and rejects empty search
- 3c. System prompts user for valid search term

#### Postconditions

**Success Postcondition:**

- User receives relevant search results
- Results include file context information

**Failure Postcondition:**

- User receives appropriate feedback for no matches or invalid input

---

### UC12: Search Words (Contains Match)

**Use Case ID**: UC12  
**Use Case Name**: Search Words with Partial Match  
**Created By**: System Analyst  
**Date Created**: [Current Date]

#### Brief Description

Allows users to search for words that contain the search term as a substring.

#### Primary Actor

End User

#### Secondary Actors

Database

#### Preconditions

- System has processed files with extracted words
- At least one word exists in the FileWords table

#### Main Success Scenario

1. User accesses search functionality
2. System displays search interface with search type options
3. User enters search term
4. User selects "contains" search type
5. System queries FileWords table using case-insensitive substring match
6. System retrieves all words containing the search term
7. System formats results with file context information
8. System returns search results ordered by relevance
9. User reviews expanded search results

#### Alternative Flows

Similar to UC11 with additional consideration for potentially larger result sets.

---

### UC04: Delete Entire File

**Use Case ID**: UC04  
**Use Case Name**: Delete Entire File and Associated Data  
**Created By**: System Analyst  
**Date Created**: [Current Date]

#### Brief Description

Allows users to completely remove a file and all its associated word data from the system.

#### Primary Actor

End User (or System Administrator)

#### Secondary Actors

- Database
- File System

#### Preconditions

- File exists in the system (UploadedFiles record exists)
- User has appropriate permissions to delete files

#### Main Success Scenario

1. User selects file deletion option
2. System displays list of uploaded files or user provides file ID
3. User selects specific file to delete
4. System confirms deletion request
5. System retrieves file record from UploadedFiles table
6. System deletes all associated word records from FileWords table
7. System attempts to delete physical file from media directory
8. System removes UploadedFiles database record
9. System confirms successful deletion
10. User receives confirmation message

#### Alternative Flows

**A1: File Not Found**

- 5a. System cannot find file record with provided ID
- 5b. System returns "file not found" error
- 5c. Use case ends

**A2: Physical File Delete Failure**

- 7a. Physical file cannot be deleted (permissions, file in use, etc.)
- 7b. System logs warning but continues with database cleanup
- 7c. System completes database deletion
- 7d. System reports partial success with warning

#### Postconditions

**Success Postcondition:**

- File record removed from database
- All associated word records removed
- Physical file deleted from storage
- System storage space freed

---

### UC03: Delete Individual Word

**Use Case ID**: UC03  
**Use Case Name**: Delete Individual Word  
**Created By**: System Analyst  
**Date Created**: October 16, 2025  
**Last Updated**: October 16, 2025

#### Brief Description

Allows users to delete a specific word entry from the system while maintaining the associated file and other words from the same file.

#### Primary Actor

End User

#### Secondary Actors

- Database
- System Administrator (for oversight)

#### Preconditions

- System contains processed files with extracted words
- Target word record exists in FileWords table
- User has access to word management interface

#### Main Success Scenario

1. User accesses word management or search results interface
2. System displays list of extracted words with file context
3. User identifies specific word to delete
4. User selects delete option for the target word
5. System retrieves word record from FileWords table
6. System identifies associated file information
7. System checks if this is the last remaining word from the source file
8. If NOT the last word:
   a. System deletes only the selected FileWords record
   b. System maintains UploadedFiles record and other associated words
9. If IS the last word from the file:
   a. System invokes UC04 (Delete Entire File) process
   b. System deletes all associated data including physical file
10. System updates word count statistics
11. System returns updated word list excluding deleted entry
12. User receives confirmation of successful deletion

#### Alternative Flows

**A1: Word Record Not Found**

- 5a. System cannot locate word record with provided ID
- 5b. System logs word lookup error
- 5c. System returns "word not found" error message
- 5d. Use case ends without changes

**A2: Database Deletion Error**

- 8a. Database deletion operation fails due to constraints or connectivity
- 8b. System logs database error details
- 8c. System returns database error message
- 8d. No changes made to system state

**A3: Last Word Triggers File Deletion**

- 7a. System detects this is the only remaining word from source file
- 7b. System automatically triggers complete file deletion (UC04)
- 7c. System deletes FileWords record, UploadedFiles record, and physical file
- 7d. System returns file deletion confirmation instead of word deletion

**A4: Cascading Deletion Issues**

- 9b. File deletion process encounters errors (following UC04 alternative flows)
- 9c. System handles file deletion errors appropriately
- 9d. System reports partial success or failure based on UC04 results

#### Postconditions

**Success Postcondition (Word Only):**

- Specific FileWords record removed from database
- Associated UploadedFiles record and physical file remain intact
- Other words from same file remain accessible
- Updated word list available to user

**Success Postcondition (Last Word - File Deleted):**

- FileWords record deleted
- Associated UploadedFiles record deleted
- Physical file removed from storage
- No remaining data from the source file

**Failure Postcondition:**

- No changes made to database or file system
- Original word record remains intact
- Error message provided to user
- System state unchanged

#### Business Rules

- BR05: Deletion operations cascade appropriately
- BR34: Individual word deletion preserves file integrity when other words remain
- BR35: Last word deletion automatically triggers complete file removal
- BR36: Word deletion maintains referential integrity in database
- BR37: Users can selectively manage extracted content

#### Special Requirements

- SR22: System provides clear indication when word deletion will trigger file deletion
- SR23: Deletion operations are atomic (complete success or no changes)
- SR24: System maintains audit trail of deletion operations
- SR25: User interface clearly shows impact of deletion operations

#### Technology and Data Variations

- Uses Django ORM CASCADE relationships for data integrity
- Database transactions ensure atomic operations
- REST API provides consistent deletion interface
- Frontend updates dynamically after successful deletion

---

### UC05: Clear All Files

**Use Case ID**: UC05  
**Use Case Name**: Clear All Files and System Data  
**Created By**: System Analyst  
**Date Created**: October 16, 2025  
**Last Updated**: October 16, 2025

#### Brief Description

Allows system administrators to completely clear all uploaded files and associated data from the system, effectively resetting the application to its initial state.

#### Primary Actor

System Administrator

#### Secondary Actors

- Database
- File System
- End User (notification recipient)

#### Preconditions

- System is running and accessible
- Administrator has appropriate permissions
- System contains uploaded files or data to be cleared

#### Main Success Scenario

1. System Administrator accesses system management interface
2. Administrator selects "Clear All Files" operation
3. System displays confirmation dialog with warning about data loss
4. Administrator confirms the deletion operation
5. System begins batch deletion process
6. For each uploaded file in the system:
   a. System deletes all associated FileWords records
   b. System attempts to delete physical file from media directory
   c. System removes UploadedFiles database record
   d. System logs deletion results
7. System compiles deletion summary including:
   - Total files deleted successfully
   - Any files that failed to delete
   - Storage space freed
   - Any orphaned data cleaned up
8. System updates file counters and statistics
9. System returns comprehensive deletion report
10. Administrator receives confirmation of system reset

#### Alternative Flows

**A1: No Files to Delete**

- 5a. System detects no uploaded files exist
- 5b. System returns message indicating system is already clear
- 5c. Use case ends with informational status

**A2: Partial Deletion Failure**

- 6a. Some files delete successfully, others fail due to system errors
- 6b. System continues processing remaining files
- 6c. System logs all errors for administrator review
- 6d. System returns partial success report with detailed error list

**A3: Permission Errors**

- 6b. Physical file deletion fails due to file system permissions
- 6c. System logs warning but continues with database cleanup
- 6d. System reports files that couldn't be physically removed

#### Postconditions

**Success Postcondition:**

- All UploadedFiles records removed from database
- All FileWords records removed from database
- All physical files removed from media directory
- System returned to clean initial state
- Administrator receives comprehensive deletion report

**Failure Postcondition:**

- System partially cleared with detailed error report
- Remaining data identified for manual cleanup

#### Business Rules

- BR05: Only administrators can perform system-wide deletion
- BR07: System must provide detailed logging of all deletion operations
- BR08: Confirmation required before irreversible operations
- BR09: System must attempt to clean up orphaned data

#### Special Requirements

- SR04: Operation must be logged for audit purposes
- SR05: System must handle large datasets efficiently
- SR06: Progress indication for long-running operations

---

### UC06: Extract Text from Document Files

**Use Case ID**: UC06  
**Use Case Name**: Extract Text from Document Files  
**Created By**: System Analyst  
**Date Created**: October 16, 2025

#### Brief Description

System capability to extract readable text content from various document file formats including TXT, DOCX, XLSX, PDF, and CSV files.

#### Primary Actor

System (Internal Process)

#### Secondary Actors

- File Processing Libraries (PyPDF2, python-docx, openpyxl)
- Database
- File System

#### Preconditions

- Valid document file has been uploaded to the system
- File is accessible in the media directory
- Required processing libraries are available

#### Main Success Scenario

1. System receives document file processing request
2. System determines document file type from extension
3. System selects appropriate extraction method:
   - **TXT files**: Opens file with UTF-8 encoding and reads content directly
   - **DOCX files**: Uses python-docx to parse paragraphs and extract text
   - **XLSX files**: Uses openpyxl to iterate through cells and extract values
   - **PDF files**: Uses PyPDF2 to extract text from all pages
   - **CSV files**: Uses CSV reader to extract cell content as text
4. System processes extracted text to identify individual words
5. System splits text content using whitespace delimiters
6. System filters out empty strings and invalid characters
7. System creates word index with position information
8. System stores extracted words in FileWords table with file reference
9. System returns extraction statistics including word count and processing status

#### Alternative Flows

**A1: Corrupted or Unreadable File**

- 3a. Library fails to parse document due to corruption
- 3b. System logs specific error details
- 3c. System raises exception with descriptive error message
- 3d. Calling process handles cleanup

**A2: Empty Document**

- 4a. Document contains no readable text content
- 4b. System completes processing with zero words extracted
- 4c. System returns success status with empty result set

**A3: Encoding Issues (TXT files)**

- 3a. UTF-8 decoding fails for TXT files
- 3b. System attempts alternative encoding detection
- 3c. If successful, continues with detected encoding
- 3d. If unsuccessful, raises encoding error

**A4: Password Protected Documents**

- 3a. Document requires password for access (PDF/Office files)
- 3b. System cannot access content without credentials
- 3c. System raises authentication error

#### Postconditions

**Success Postcondition:**

- Text successfully extracted from document
- Individual words identified and stored
- File processing marked as successful
- Word count and statistics available

**Failure Postcondition:**

- Error logged with specific failure reason
- No partial data stored in case of failure
- File processing marked as failed

#### Business Rules

- BR10: All document types use consistent word extraction methodology
- BR11: Text extraction must preserve word boundaries
- BR12: System handles encoding issues gracefully
- BR13: Large documents processed efficiently without memory overflow

---

### UC07: Extract Text from Images (OCR)

**Use Case ID**: UC07  
**Use Case Name**: Extract Text from Images using OCR  
**Created By**: System Analyst  
**Date Created**: October 16, 2025

#### Brief Description

Uses Optical Character Recognition (OCR) technology via Tesseract to extract text content from image files (PNG, JPG, JPEG).

#### Primary Actor

System (Internal Process)

#### Secondary Actors

- Tesseract OCR Engine
- PIL (Python Imaging Library)
- Database
- File System

#### Preconditions

- Valid image file uploaded to system
- Tesseract OCR engine installed and configured
- Image file is readable and contains text content

#### Main Success Scenario

1. System receives image processing request
2. System validates image file format (PNG, JPG, JPEG)
3. System configures Tesseract path based on operating system:
   - Windows: Points to Tesseract installation directory
   - macOS/Linux: Uses system PATH configuration
4. System opens image file using PIL (Python Imaging Library)
5. System calls Tesseract OCR engine via pytesseract
6. Tesseract analyzes image and extracts readable text
7. System receives OCR results as text string
8. System processes extracted text to identify words
9. System splits text by whitespace and filters valid words
10. System stores extracted words in database with file reference
11. System returns OCR processing results with word count

#### Alternative Flows

**A1: Tesseract Not Available**

- 3a. System cannot locate Tesseract executable
- 3b. System logs configuration error
- 3c. System raises TesseractNotFoundError
- 3d. Processing fails with clear error message

**A2: Image Contains No Text**

- 6a. Tesseract completes analysis but finds no readable text
- 6b. System receives empty string result
- 6c. System processes as successful operation with zero words
- 6d. Returns success status with empty word list

**A3: Poor Image Quality**

- 5a. Image quality too poor for accurate OCR
- 6a. Tesseract returns garbled or incorrect text
- 6b. System processes whatever text is extracted
- 6c. May result in non-dictionary words being stored

**A4: Unsupported Image Format**

- 4a. PIL cannot open or process image file
- 4b. System logs image processing error
- 4c. System raises image format exception

#### Postconditions

**Success Postcondition:**

- Text extracted from image using OCR
- Recognized words stored in database
- OCR processing marked as completed
- Statistics available for extracted content

**Failure Postcondition:**

- OCR error logged with specific details
- No partial OCR data stored
- Image processing marked as failed

#### Business Rules

- BR14: OCR accuracy depends on image quality and text clarity
- BR15: System attempts OCR on all supported image formats
- BR16: OCR results processed same as other text extraction methods
- BR17: Tesseract configuration must be OS-appropriate

#### Special Requirements

- SR07: Tesseract OCR engine must be properly installed
- SR08: System handles OCR processing timeouts gracefully
- SR09: Large images processed without memory issues

---

### UC08: Extract Text from Audio Files

**Use Case ID**: UC08  
**Use Case Name**: Extract Text from Audio Files using Speech Recognition  
**Created By**: System Analyst  
**Date Created**: October 16, 2025

#### Brief Description

Converts spoken content in audio files (WAV format) to text using Google Speech Recognition API.

#### Primary Actor

System (Internal Process)

#### Secondary Actors

- Google Speech Recognition API
- SpeechRecognition Library
- Database
- File System

#### Preconditions

- Valid WAV audio file uploaded to system
- Internet connectivity available for Google Speech API
- Audio file contains intelligible speech content

#### Main Success Scenario

1. System receives audio processing request for WAV file
2. System initializes speech recognition engine
3. System opens WAV audio file using SpeechRecognition library
4. System creates audio source from file
5. System records complete audio content into memory
6. System calls Google Speech Recognition API with audio data
7. API processes audio and returns transcribed text
8. System receives transcription results
9. System processes transcribed text to extract individual words
10. System splits transcription by whitespace to identify words
11. System stores extracted words in database with file reference
12. System returns speech recognition results with word count

#### Alternative Flows

**A1: Speech Recognition API Unavailable**

- 6a. Google Speech API returns request error (network/service issue)
- 6b. System logs API connectivity error
- 6c. System raises RequestError with descriptive message
- 6d. Processing fails with external service error

**A2: Audio Content Unintelligible**

- 7a. Google Speech API cannot understand audio content
- 7b. System receives UnknownValueError from speech recognition
- 7c. System logs that audio could not be transcribed
- 7d. Processing completes with zero words extracted

**A3: Audio File Format Issues**

- 4a. Audio file corrupted or invalid WAV format
- 4b. SpeechRecognition library cannot process file
- 4c. System logs audio format error
- 4d. System raises audio processing exception

**A4: Network Connectivity Issues**

- 6a. Network connection fails during API call
- 6b. System receives timeout or connection error
- 6c. System logs network connectivity issue
- 6d. Processing fails with network error

#### Postconditions

**Success Postcondition:**

- Audio successfully transcribed to text
- Transcribed words stored in database
- Speech recognition marked as successful
- Transcription accuracy dependent on audio quality

**Failure Postcondition:**

- Speech recognition error logged with details
- No partial transcription data stored
- Audio processing marked as failed

#### Business Rules

- BR18: Speech recognition requires internet connectivity
- BR19: Transcription accuracy depends on audio quality and clarity
- BR20: System supports English language speech recognition
- BR21: API usage subject to Google Speech Recognition limits

#### Special Requirements

- SR10: Internet connection required for speech recognition
- SR11: System handles API rate limits and quotas
- SR12: Audio processing timeouts handled gracefully

---

### UC09: Extract Text from Video Files

**Use Case ID**: UC09  
**Use Case Name**: Extract Text from Video Files  
**Created By**: System Analyst  
**Date Created**: October 16, 2025

#### Brief Description

Extracts audio track from video files (MP4) and converts speech content to text using audio processing pipeline.

#### Primary Actor

System (Internal Process)

#### Secondary Actors

- MoviePy Library (Video Processing)
- Google Speech Recognition API (via UC08)
- Temporary File System
- Database

#### Preconditions

- Valid MP4 video file uploaded to system
- Video file contains audio track with speech
- MoviePy library available for video processing
- Requirements from UC08 (internet connectivity, etc.)

#### Main Success Scenario

1. System receives video processing request for MP4 file
2. System loads video file using MoviePy VideoFileClip
3. System extracts audio track from video file
4. System creates temporary WAV file for audio content
5. System writes extracted audio to temporary file location
6. System invokes UC08 (Extract Text from Audio Files) with temporary audio file
7. Speech recognition processes temporary audio file (following UC08 flow)
8. System receives transcription results from audio processing
9. System cleans up temporary audio file
10. System stores extracted words in database with original video file reference
11. System returns video processing results with transcribed word count

#### Alternative Flows

**A1: Video File Has No Audio Track**

- 3a. MoviePy detects no audio stream in video file
- 3b. System logs that video contains no audio content
- 3c. Processing completes successfully with zero words extracted
- 3d. Returns success status with empty result

**A2: Video Processing Error**

- 2a. MoviePy cannot load or process video file
- 2b. System logs video format or corruption error
- 2c. System raises video processing exception
- 2d. Processing fails without creating temporary files

**A3: Audio Extraction Failure**

- 4a. Error occurs during audio extraction from video
- 4b. System logs audio extraction error
- 4c. System cleans up any partial temporary files
- 4d. Processing fails with audio extraction error

**A4: Speech Recognition Failure (from UC08)**

- 7a. Audio processing fails (following UC08 alternative flows)
- 7b. System receives error from speech recognition process
- 7c. System cleans up temporary audio file
- 7d. Processing fails with speech recognition error

**A5: Temporary File Cleanup Issues**

- 9a. System cannot delete temporary audio file
- 9b. System logs cleanup warning but continues
- 9c. Processing marked as successful with cleanup warning

#### Postconditions

**Success Postcondition:**

- Video audio successfully extracted and transcribed
- Transcribed words stored with video file reference
- Temporary files cleaned up
- Video processing marked as successful

**Failure Postcondition:**

- Video processing error logged
- Temporary files cleaned up (if created)
- No partial transcription data stored
- Video processing marked as failed

#### Business Rules

- BR22: Video processing depends on UC08 capabilities
- BR23: Only MP4 format supported for video processing
- BR24: Temporary files must be cleaned up after processing
- BR25: Video processing inherits audio recognition limitations

#### Special Requirements

- SR13: Sufficient temporary storage for audio extraction
- SR14: MoviePy library properly installed and configured
- SR15: Video processing handles large files efficiently

---

### UC10: Process Multiple File Formats

**Use Case ID**: UC10  
**Use Case Name**: Process Multiple File Formats  
**Created By**: System Analyst  
**Date Created**: October 16, 2025

#### Brief Description

Orchestrates the processing of various file types by routing to appropriate text extraction methods and handling the overall file processing workflow.

#### Primary Actor

System (Internal Process)

#### Secondary Actors

- All UC06-UC09 processing capabilities
- Database
- File System
- Error Logging System

#### Preconditions

- File uploaded and stored in system
- File type determined from extension
- Appropriate processing libraries available

#### Main Success Scenario

1. System receives file processing request with file metadata
2. System validates file exists in media directory
3. System determines file type from extension
4. System routes to appropriate processing method:
   - Document files (TXT, DOCX, XLSX, PDF, CSV) → UC06
   - Image files (PNG, JPG, JPEG) → UC07
   - Audio files (WAV) → UC08
   - Video files (MP4) → UC09
5. System invokes selected processing method
6. Processing method completes and returns extraction results
7. System validates processing results
8. System updates file processing status in database
9. System compiles final processing statistics
10. System returns comprehensive processing report

#### Alternative Flows

**A1: Unsupported File Type**

- 3a. File extension not in supported format list
- 3b. System logs unsupported file type error
- 3c. System raises ValueError with supported formats list
- 3d. Processing fails with clear error message

**A2: File Not Found**

- 2a. Uploaded file missing from expected media location
- 2b. System logs file system error
- 2c. System raises FileNotFoundError
- 2d. Processing cannot proceed

**A3: Processing Method Failure**

- 5a. Selected processing method raises exception
- 5b. System catches and logs specific processing error
- 5c. System performs cleanup operations
- 5d. System raises processing error with context

**A4: Database Update Failure**

- 8a. Error occurs updating processing status
- 8b. System logs database error
- 8c. Text extraction succeeded but metadata update failed
- 8d. System raises database error for handling

#### Postconditions

**Success Postcondition:**

- File successfully processed using appropriate method
- Extracted text stored in database
- Processing statistics available
- File status updated to completed

**Failure Postcondition:**

- Processing error logged with specific details
- File status remains as failed/pending
- No partial data committed to database
- Clear error message available for user

#### Business Rules

- BR26: System supports specific list of file formats
- BR27: Each file type uses most appropriate extraction method
- BR28: Processing must be atomic (success or complete failure)
- BR29: System provides consistent error handling across all formats

#### Special Requirements

- SR16: System gracefully handles unsupported file types
- SR17: Processing routing must be easily extendable
- SR18: Consistent error reporting across all processing methods

---

### UC13: View All Extracted Words

**Use Case ID**: UC13  
**Use Case Name**: View All Extracted Words  
**Created By**: System Analyst  
**Date Created**: October 16, 2025

#### Brief Description

Allows users to retrieve and view all words that have been extracted from processed files in the system.

#### Primary Actor

End User

#### Secondary Actors

- Database
- FileWords Serializer

#### Preconditions

- System contains processed files with extracted words
- At least one word exists in the FileWords table
- User has access to the word viewing interface

#### Main Success Scenario

1. User requests to view all extracted words
2. System accesses word viewing interface
3. System queries FileWords table to retrieve all word records
4. System joins FileWords with UploadedFiles to get file context
5. System applies FileWordsSerializer to format data consistently
6. System compiles word list including:
   - Word ID
   - Extracted word text
   - Source file path
   - Original filename
   - File ID reference
7. System orders results (by word, file, or insertion order)
8. System returns formatted word collection with metadata
9. User receives complete list of all extracted words with file context

#### Alternative Flows

**A1: No Words in System**

- 3a. FileWords table contains no records
- 3b. System returns empty result set
- 3c. System provides message indicating no processed files
- 3d. User receives empty list with informational message

**A2: Large Result Set**

- 6a. System contains very large number of extracted words
- 6b. System may implement pagination or limiting
- 6c. System returns subset with pagination information
- 6d. User can request additional pages if needed

**A3: Database Query Error**

- 3a. Database query fails due to connectivity or system error
- 3b. System logs database error details
- 3c. System returns database error message
- 3d. User receives error notification

#### Postconditions

**Success Postcondition:**

- Complete list of extracted words retrieved
- Each word includes associated file information
- Data formatted consistently for user consumption
- User has comprehensive view of system content

**Failure Postcondition:**

- User receives appropriate error message
- System error logged for investigation
- No partial data returned

#### Business Rules

- BR30: All extracted words are visible to users
- BR31: Word list includes file context for traceability
- BR32: Results formatted consistently using system serializers
- BR33: System handles large datasets appropriately

#### Special Requirements

- SR19: System handles large word collections efficiently
- SR20: Results include sufficient context for user understanding
- SR21: Word list may require pagination for performance

#### Technology and Data Variations

- Results serialized using Django REST Framework serializers
- Database queries optimized for performance
- May implement pagination for large datasets
- Supports various result ordering options

---

## Use Case Tables

### Use Case Priority and Complexity Matrix

| Use Case ID | Use Case Name               | Priority | Complexity | Risk Level | Dependencies               |
| ----------- | --------------------------- | -------- | ---------- | ---------- | -------------------------- |
| UC01        | Upload Single File          | High     | Medium     | Medium     | External APIs, File System |
| UC02        | Upload Directory            | High     | High       | High       | UC01, File System          |
| UC03        | Delete Individual Word      | Medium   | Low        | Low        | Database                   |
| UC04        | Delete Entire File          | Medium   | Medium     | Low        | Database, File System      |
| UC05        | Clear All Files             | Low      | Medium     | Medium     | UC04, Database             |
| UC06        | Extract Text from Documents | High     | Medium     | Low        | File Processing Libraries  |
| UC07        | Extract Text from Images    | Medium   | High       | High       | Tesseract OCR              |
| UC08        | Extract Text from Audio     | Medium   | High       | High       | Google Speech API          |
| UC09        | Extract Text from Video     | Low      | High       | High       | UC08, Video Processing     |
| UC10        | Process Multiple Formats    | High     | High       | Medium     | UC06-UC09                  |
| UC11        | Search Exact Match          | High     | Low        | Low        | Database                   |
| UC12        | Search Contains Match       | High     | Low        | Low        | Database                   |
| UC13        | View All Words              | Medium   | Low        | Low        | Database                   |
| UC14        | Get Processing Results      | Medium   | Low        | Low        | Database                   |

### Actor-Use Case Relationship Matrix

| Use Case | End User  | System Admin | Google Speech API | Tesseract OCR | File System | Database  |
| -------- | --------- | ------------ | ----------------- | ------------- | ----------- | --------- |
| UC01     | Primary   | -            | Secondary         | Secondary     | Secondary   | Secondary |
| UC02     | Primary   | -            | Secondary         | Secondary     | Secondary   | Secondary |
| UC03     | Primary   | Secondary    | -                 | -             | -           | Secondary |
| UC04     | Primary   | Primary      | -                 | -             | Secondary   | Secondary |
| UC05     | Secondary | Primary      | -                 | -             | Secondary   | Secondary |
| UC11     | Primary   | -            | -                 | -             | -           | Secondary |
| UC12     | Primary   | -            | -                 | -             | -           | Secondary |

### Use Case Traceability Matrix

| Use Case ID | Related Requirements | Business Rules   | API Endpoints                | Database Tables          |
| ----------- | -------------------- | ---------------- | ---------------------------- | ------------------------ |
| UC01        | FR001, FR002         | BR01, BR02, BR04 | `/file/`                     | UploadedFiles, FileWords |
| UC02        | FR001, FR003         | BR01, BR02, BR04 | `/upload-directory/`         | UploadedFiles, FileWords |
| UC03        | FR004                | BR05             | `/filetbl/<id>`              | FileWords                |
| UC04        | FR005                | BR05             | `/api/delete-file/<file_id>` | UploadedFiles, FileWords |
| UC05        | FR006                | BR05             | `/api/clear-all/`            | UploadedFiles, FileWords |
| UC11        | FR007                | BR06             | `/api/search/`               | FileWords                |
| UC12        | FR007                | BR06             | `/api/search/`               | FileWords                |

## System Architecture Context

### Data Flow Architecture

```
[User Interface]
       ↓
[Django REST API Views]
       ↓
[Business Logic Layer]
       ↓
[External Services] ← → [Database Layer] ← → [File Storage]
```

### Key Components Integration

#### Models Layer

- **UploadedFiles**: Stores file metadata and references
- **FileWords**: Stores extracted words with file relationships

#### Views Layer

- **File Upload Views**: Handle single and batch file processing
- **Search Views**: Provide word search functionality
- **Management Views**: Handle deletion and cleanup operations

#### External Integrations

- **Google Speech Recognition**: For audio and video text extraction
- **Tesseract OCR**: For image text extraction
- **Various Document Parsers**: PyPDF2, python-docx, openpyxl

### Business Rules Summary

- **BR01**: Only supported file formats are processed
- **BR02**: Words are stored individually for granular search
- **BR03**: Original filenames are preserved
- **BR04**: File processing is atomic (all-or-nothing)
- **BR05**: Deletion operations cascade appropriately
- **BR06**: Search supports both exact and partial matching

### Non-Functional Requirements Context

#### Performance Requirements

- Support for concurrent file uploads
- Efficient text extraction for large files
- Optimized database queries for search operations

#### Security Requirements

- CSRF protection for file uploads
- Input validation for all file types
- Secure file storage with proper permissions

#### Scalability Requirements

- Configurable media storage location
- Database abstraction for different database backends
- Modular text extraction pipeline

This documentation provides a comprehensive foundation for understanding the Text Finder App's use cases, which can be used for system design, testing, and further development planning.
