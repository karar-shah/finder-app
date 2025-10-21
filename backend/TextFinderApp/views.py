from django.shortcuts import render, HttpResponse
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.files.base import ContentFile
from .models import UploadedFiles, FileWords
from django.conf import settings
import os
import shutil
import zipfile
import tempfile
import speech_recognition as sr
from docx import Document
from openpyxl import load_workbook
# import easyocr
from PIL import Image
from moviepy.editor import VideoFileClip
import pytesseract
from rest_framework.views import APIView
from .serializers import FileWordsSerializers
from rest_framework.response import Response
from rest_framework import status
setting = settings.MEDIA_URL

import warnings
warnings.filterwarnings("ignore")  # suppress all warnings (use with caution)


# Create your views here.
def delete_file_completely(file_id):
    """
    Completely delete a file and all its associated data
    Returns: (success: bool, message: str)
    """
    try:
        # Get the uploaded file record
        uploaded_file = UploadedFiles.objects.get(id=file_id)
        
        # Delete all associated word records
        FileWords.objects.filter(file_id_id=file_id).delete()
        
        # Delete the physical file if it exists
        if uploaded_file.file and os.path.exists(uploaded_file.file.path):
            try:
                os.remove(uploaded_file.file.path)
                print(f"Deleted physical file: {uploaded_file.file.path}")
            except Exception as e:
                print(f"Error deleting physical file {uploaded_file.file.path}: {e}")
        
        # Delete the database record
        uploaded_file.delete()
        
        return True, f"File {uploaded_file.original_filename or uploaded_file.file.name} deleted successfully"
        
    except UploadedFiles.DoesNotExist:
        return False, f"File with ID {file_id} not found"
    except Exception as e:
        return False, f"Error deleting file: {str(e)}"
def get_supported_extensions():
    """Return list of supported file extensions"""
    return ['txt', 'docx', 'xlsx', 'pdf', 'wav', 'mp4', 'png', 'jpg', 'jpeg', 'csv']

def check_duplicate_file(original_filename):
    """
    Check if a file with the same original_filename already exists
    Returns: (is_duplicate: bool, existing_file_id: int or None)
    """
    # Check for files with same original_filename (we store full path or filename here)
    existing_file = UploadedFiles.objects.filter(original_filename=original_filename).first()

    if existing_file:
        return True, existing_file.id

    return False, None

def process_single_file(file_path, original_filename=None):
    """Process a single file and extract words"""
    import fitz  # PyMuPDF
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    file_extension = os.path.splitext(file_path)[1].lower().lstrip('.')
    if not original_filename:
        original_filename = os.path.basename(file_path)
    
    print(f"Processing file: {original_filename} (extension: {file_extension})")
    
    # original_filename contains either the filename (for single uploads)
    # or the relative path (for directory uploads). We'll store the
    # full value in UploadedFiles.original_filename and use it for
    # duplicate detection (path-only check as requested).
    filename_only = os.path.basename(original_filename)
    full_path = original_filename  # This is the relative path from directory root or simple filename

    # Check for duplicate file based on original_filename only
    is_duplicate, existing_id = check_duplicate_file(full_path)
    
    if is_duplicate:
        print(f"Skipping duplicate file: {full_path}")
        return {
            'file': filename_only,
            'status': 'skipped',
            'message': 'Duplicate file (same path)',
            'file_id': existing_id
        }
    
    # Create file record - we'll create a copy in media directory
    with open(file_path, 'rb') as source_file:
        file_content = source_file.read()
        
    # Create a unique filename using timestamp and hash to avoid collisions
    import time
    timestamp = int(time.time() * 1000)  # milliseconds
    base_name = os.path.splitext(filename_only)[0]
    extension = os.path.splitext(filename_only)[1]
    media_filename = f"{base_name}_{timestamp}_{hash(full_path) % 100000}{extension}"
    
    # Save to UploadedFiles storing the full path/filename in original_filename
    document = UploadedFiles(
        original_filename=full_path
    )
    document.file.save(media_filename, ContentFile(file_content), save=True)
    
    file_id = document.id
    saved_path = document.file.path
    
    word_dict = {}
    
    try:
        if file_extension == 'txt':
            with open(saved_path, mode='r', encoding='utf-8') as f:
                data = f.read().split()
                for id, word in enumerate(data):
                    word_dict[word] = id + 1
                    
        elif file_extension == 'docx':
            doc = Document(saved_path)
            data = []
            for para in doc.paragraphs:
                data.extend(para.text.split())
            for id, word in enumerate(data):
                word_dict[word] = id + 1
                
        elif file_extension == 'xlsx':
            wb = load_workbook(saved_path)
            sheet = wb.active
            data = []
            for row in sheet.iter_rows(values_only=True):
                for cell in row:
                    if cell is not None:
                        data.append(str(cell))
            for id, word in enumerate(data):
                word_dict[word] = id + 1
            wb.close()
            
        elif file_extension == 'pdf':
            text = ""
            try:
                # Use PyMuPDF (fitz) for better text extraction
                pdf_document = fitz.open(saved_path)
                print(f"PDF has {pdf_document.page_count} pages")
                
                for page_num in range(pdf_document.page_count):
                    page = pdf_document[page_num]
                    page_text = page.get_text("text")  # Extract text with better accuracy
                    if page_text:
                        text += page_text + " "
                    print(f"Page {page_num + 1}: Extracted {len(page_text.split())} words")
                
                pdf_document.close()
                print(f"Total text length: {len(text)} characters")
            except Exception as pdf_error:
                print(f"Error extracting text from PDF: {pdf_error}")
                raise
            
            # Split into words and preserve all occurrences
            data = text.split()
            print(f"Total words extracted from PDF: {len(data)}")
            for id, word in enumerate(data):
                if word.strip():  # Only process non-empty words
                    word_dict[word] = id + 1
                
        elif file_extension == 'wav':
            recognizer = sr.Recognizer()
            with sr.AudioFile(saved_path) as source:
                audio = recognizer.record(source)
                try:
                    text = recognizer.recognize_google(audio, language="en")
                    data = text.split()
                    for id, word in enumerate(data):
                        word_dict[word] = id + 1
                except sr.UnknownValueError:
                    print("Google Speech Recognition could not understand audio")
                except sr.RequestError as e:
                    print(f"Could not request results from Google Speech Recognition service; {e}")
                    
        elif file_extension == 'mp4':
            video = VideoFileClip(saved_path)
            import tempfile
            temp_dir = tempfile.gettempdir()
            temp_audio_path = os.path.join(temp_dir, f"extracted_audio_{file_id}.wav")
            video.audio.write_audiofile(temp_audio_path)
            recognizer = sr.Recognizer()
            with sr.AudioFile(temp_audio_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data)
                data = text.split()
                for id, word in enumerate(data):
                    word_dict[word] = id + 1
            # Clean up temp audio file
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
                
        elif file_extension in ['png', 'jpg', 'jpeg']:
            # Set Tesseract command based on OS
            if os.name == 'nt':  # Windows
                pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"
            img = Image.open(saved_path)
            text = pytesseract.image_to_string(img)
            data = text.split()
            for id, word in enumerate(data):
                word_dict[word] = id + 1
                
        elif file_extension == 'csv':
            import csv
            data = []
            with open(saved_path, 'r', encoding='utf-8') as csv_file:
                csv_reader = csv.reader(csv_file)
                for row in csv_reader:
                    for cell in row:
                        words = cell.split()
                        data.extend(words)
            for id, word in enumerate(data):
                word_dict[word] = id + 1
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
            
        # Save ALL words to database (including duplicates)
        # Use word_dict to track unique words for reporting, but save all occurrences
        saved_word_count = 0
        for word in word_dict.keys():
            if word.strip():  # Only save non-empty words
                word_record = FileWords(word=word, file_id_id=file_id)
                word_record.save()
                saved_word_count += 1
        
        print(f"Saved {saved_word_count} unique words out of {len(data) if 'data' in locals() else 0} total words")
                
        return {
            'file': original_filename, 
            'words': len(word_dict),
            'total_words': len(data) if 'data' in locals() else len(word_dict),
            'file_id': file_id,
            'status': 'success'
        }
        
    except Exception as e:
        # If processing fails, clean up the database record
        try:
            document.delete()
        except:
            pass
        raise e

@csrf_exempt
def upload_directory(request):
    """Handle directory upload via ZIP file"""
    
    if request.method == "POST":
        print("Request method: POST")
        print("Request FILES:", request.FILES.keys())
        print("Request POST:", request.POST.keys())
        
        zip_file = request.FILES.get('directory_zip')
        
        if not zip_file:
            print("No ZIP file found in request.FILES")
            return JsonResponse({'status': 'error', 'message': 'No ZIP file provided'}, status=400)
        
        results = []
        temp_dir = None
        
        try:
            # Create temporary directory
            temp_dir = tempfile.mkdtemp()
            
            # Save and extract ZIP file
            zip_path = os.path.join(temp_dir, 'upload.zip')
            with open(zip_path, 'wb') as f:
                for chunk in zip_file.chunks():
                    f.write(chunk)
            
            # Extract ZIP file
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Get supported extensions
            supported_extensions = get_supported_extensions()
            
            # Process all supported files recursively
            processed_files = 0
            skipped_files = 0
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    if file.endswith('.zip'):  # Skip the original zip file
                        continue
                        
                    file_path = os.path.join(root, file)
                    file_extension = os.path.splitext(file)[1].lower().lstrip('.')
                    
                    if file_extension in supported_extensions:
                        try:
                            # Get relative path for original filename
                            relative_path = os.path.relpath(file_path, temp_dir)
                            if relative_path.startswith('upload/'):
                                relative_path = relative_path[7:]  # Remove 'upload/' prefix
                            
                            result = process_single_file(file_path, relative_path)
                            results.append(result)
                            
                            if result.get('status') == 'skipped':
                                skipped_files += 1
                            else:
                                processed_files += 1
                            
                        except Exception as e:
                            print(f"Error processing file {file}: {str(e)}")
                            results.append({
                                'file': file,
                                'error': str(e),
                                'status': 'error'
                            })
            
            if processed_files == 0 and skipped_files == 0:
                return JsonResponse({
                    'status': 'warning', 
                    'message': 'No supported files found in the directory',
                    'results': results
                }, status=200)
            
            message = f'Successfully processed {processed_files} files'
            if skipped_files > 0:
                message += f', skipped {skipped_files} duplicate files'
            
            return JsonResponse({
                'status': 'success',
                'message': message,
                'results': results
            })
            
        except Exception as e:
            print(f"Error processing directory: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': f'Error processing directory: {str(e)}'
            }, status=500)
            
        finally:
            # Clean up temporary directory
            if temp_dir and os.path.exists(temp_dir):
                try:
                    shutil.rmtree(temp_dir)
                except Exception as e:
                    print(f"Error cleaning up temp directory: {e}")
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def file(request):
    import fitz  # PyMuPDF
    
    if request.method == "POST":
        file2 = request.FILES.getlist("file")
        print("Selected Files: ", file2)
        results = []
        skipped_count = 0
        
        for i in range(len(file2)):
            file_name = str(file2[i])
            file_extension = os.path.splitext(file_name)[1].lower().lstrip('.')
            print(f"File extension: {file_extension}")
            
            # Get the full absolute path from the request POST data (sent by Electron)
            file_path_key = f'file_path_{i}'
            absolute_path = request.POST.get(file_path_key, file_name)
            print(f"Absolute path: {absolute_path}")
            
            # Check for duplicate based on absolute path
            is_duplicate, existing_id = check_duplicate_file(absolute_path)
            
            if is_duplicate:
                print(f"Skipping duplicate file: {absolute_path}")
                results.append({
                    'file': file_name,
                    'status': 'skipped',
                    'message': 'Duplicate file'
                })
                skipped_count += 1
                continue
            
            try:
                if file_extension == 'txt':
                    file_name = file2[i]
                    original_name = absolute_path  # Store full absolute path
                    documant1 = UploadedFiles(
                        file=file_name,
                        original_filename=original_name
                    )
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ',documant1.id)
                    print('original filename: ', original_name)
                    # Use the actual saved file path, not the original name
                    path = documant1.file.path
                    print("Path from setting: ", path)
                    f = open(path, mode='r', encoding='utf-8')
                    data = f.read().split()
                    f.close()
                    dict = {}
                    for id,word in enumerate(data):
                        dict[word]= id+1
                    for word in dict.items():
                        print(f"Word: {word[0]} | file: {fileId}")
                        documant = FileWords(word=word[0], file_id_id=fileId)
                        documant.save()
                    results.append({'file': original_name, 'words': len(dict)})
                elif file_extension == 'docx':
                    file_name = file2[i]
                    original_name = absolute_path  # Store full absolute path
                    documant1 = UploadedFiles(
                        file=file_name,
                        original_filename=original_name
                    )
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    print('original filename: ', original_name)
                    # Use the actual saved file path, not the original name
                    path = documant1.file.path
                    print("Path from setting: ", path)
                    doc = Document(path)
                    data = []
                    for para in doc.paragraphs:
                        data.extend(para.text.split())
                    word_dict = {}
                    for id, word in enumerate(data):
                        word_dict[word] = id + 1
                    for word in word_dict.items():
                        print(f"Word: {word[0]} | file: {fileId}")
                        documant = FileWords(word=word[0], file_id_id=fileId)
                        documant.save()
                    results.append({'file': original_name, 'words': len(word_dict)})
                elif file_extension == 'xlsx':
                    file_name = file2[i]
                    original_name = absolute_path  # Store full absolute path
                    documant1 = UploadedFiles(
                        file=file_name,
                        original_filename=original_name
                    )
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    # Use the actual saved file path, not the original name
                    path = documant1.file.path
                    print("Path from setting: ", path)
                    wb = load_workbook(path)
                    sheet = wb.active
                    data = []
                    for row in sheet.iter_rows(values_only=True):
                        for cell in row:
                            if cell is not None:
                                data.append(str(cell))
                    word_dict = {}
                    for id, word in enumerate(data):
                        word_dict[word] = id + 1
                    for word in word_dict.items():
                        print(f"Word: {word[0]} | file: {fileId}")
                        documant = FileWords(word=word[0], file_id_id=fileId)
                        print("aaaaaaaaaaaaaa")
                        documant.save()
                    wb.close()
                    results.append({'file': file_name.name, 'words': len(word_dict)})
                elif file_extension == 'pdf':
                    file_name = file2[i]
                    original_name = absolute_path  # Store full absolute path
                    documant1 = UploadedFiles(
                        file=file_name,
                        original_filename=original_name
                    )
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    print('original filename: ', original_name)
                    # Use the actual saved file path, not the original name
                    path = documant1.file.path
                    print("Path from setting: ", path)
                    text = ""
                    try:
                        # Use PyMuPDF (fitz) for better text extraction
                        pdf_document = fitz.open(path)
                        print(f"PDF has {pdf_document.page_count} pages")
                        
                        for page_num in range(pdf_document.page_count):
                            page = pdf_document[page_num]
                            page_text = page.get_text("text")  # Extract text with better accuracy
                            if page_text:
                                text += page_text + " "
                            print(f"Page {page_num + 1}: Extracted {len(page_text.split())} words")
                        
                        pdf_document.close()
                        print(f"Total text length: {len(text)} characters")
                    except Exception as pdf_error:
                        print(f"Error extracting text from PDF: {pdf_error}")
                        raise
                    
                    data = text.split()
                    print(f"Total words extracted from PDF: {len(data)}")
                    word_dict = {}
                    for id, word in enumerate(data):
                        if word.strip():  # Only process non-empty words
                            word_dict[word] = id + 1
                    for word in word_dict.items():
                        print(f"Word: {word[0]} | file: {fileId}")
                        documant = FileWords(word=word[0], file_id_id=fileId)
                        documant.save()
                    results.append({'file': file_name.name, 'words': len(word_dict)})
                elif file_extension == 'wav':
                    file_name = file2[i]
                    original_name = absolute_path  # Store full absolute path
                    documant1 = UploadedFiles(
                        file=file_name,
                        original_filename=original_name
                    )
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    # Use the actual saved file path, not the original name
                    path = documant1.file.path
                    print("Path from setting: ", path)
                    recognizer = sr.Recognizer()
                    with sr.AudioFile(path) as source:
                        audio = recognizer.record(source)
                        try:
                            text = recognizer.recognize_google(audio, language="en")
                            print("Transcription: ", text)
                            data = text.split()
                            word_dict = {}
                            for id, word in enumerate(data):
                                word_dict[word] = id + 1
                            for word, id in word_dict.items():
                                print(f"Word: {word} | file: {fileId}")
                                documant = FileWords(word=word, file_id_id=fileId)
                                documant.save()
                            results.append({'file': file_name.name, 'words': len(word_dict)})
                        except sr.UnknownValueError:
                            print("Google Speech Recognition could not understand audio")
                        except sr.RequestError as e:
                            print(f"Could not request results from Google Speech Recognition service; {e}")
                elif file_extension == 'mp4':
                    print("Processing video file...")
                    file_name = file2[i]
                    original_name = absolute_path  # Store full absolute path
                    documant1 = UploadedFiles(
                        file=file_name,
                        original_filename=original_name
                    )
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    # Use the actual saved file path, not the original name
                    image_path = documant1.file.path
                    print("Path from settings: ", image_path)
                    video = VideoFileClip(image_path)
                    import tempfile
                    temp_dir = tempfile.gettempdir()
                    temp_audio_path = os.path.join(temp_dir, "extracted_audio.wav")
                    video.audio.write_audiofile(temp_audio_path)
                    recognizer = sr.Recognizer()
                    with sr.AudioFile(temp_audio_path) as source:
                        audio_data = recognizer.record(source)
                        text = recognizer.recognize_google(audio_data)
                        print("DATA : ",text)
                        data = text.split()
                        word_dict = {}
                        for id, word in enumerate(data):
                            word_dict[word] = id + 1
                        for word in word_dict.items():
                            print(f"Word: {word[0]} | file: {fileId}")
                            documant = FileWords(word=word[0], file_id_id=fileId)
                            documant.save()
                        results.append({'file': file_name.name, 'words': len(word_dict)})
                elif file_extension == 'png' or file_extension == 'jpg' or file_extension == 'jpeg':
                    file_name = file2[i]
                    original_name = absolute_path  # Store full absolute path
                    documant1 = UploadedFiles(
                        file=file_name,
                        original_filename=original_name
                    )
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    # Set Tesseract command based on OS
                    if os.name == 'nt':  # Windows
                        pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"
                    # For macOS and Linux, assuming Tesseract is in PATH
                    # Use the actual saved file path, not the original name
                    image_path = documant1.file.path
                    img = Image.open(image_path)
                    text = pytesseract.image_to_string(img)
                    print("Path from settings: ", image_path)
                    print("DATA : ",text)
                    data = text.split()
                    word_dict = {}
                    for id, word in enumerate(data):
                        word_dict[word] = id + 1
                    for word in word_dict.items():
                        documant = FileWords(word=word[0], file_id_id=fileId)
                        documant.save()
                    results.append({'file': file_name.name, 'words': len(word_dict)})
                elif file_extension == 'csv':
                    import csv
                    file_name = file2[i]
                    original_name = absolute_path  # Store full absolute path
                    documant1 = UploadedFiles(
                        file=file_name,
                        original_filename=original_name
                    )
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    # Use the actual saved file path, not the original name
                    path = documant1.file.path
                    print("Path from setting: ", path)
                    data = []
                    with open(path, 'r', encoding='utf-8') as csv_file:
                        csv_reader = csv.reader(csv_file)
                        for row in csv_reader:
                            for cell in row:
                                # Split cell content by spaces to get individual words
                                words = cell.split()
                                data.extend(words)
                    word_dict = {}
                    for id, word in enumerate(data):
                        word_dict[word] = id + 1
                    for word in word_dict.items():
                        documant = FileWords(word=word[0], file_id_id=fileId)
                        documant.save()
                    results.append({'file': file_name.name, 'words': len(word_dict)})
                else:
                    print(f"Unsupported file type: {file_extension}")
                    results.append({'file': file_name, 'error': f'Unsupported file type: {file_extension}'})
            except Exception as e:
                print(f"Error processing file {file_name}: {str(e)}")
                results.append({'file': str(file_name), 'error': str(e)})
        
        if not results:
            return JsonResponse({'status': 'error', 'message': 'No files were processed successfully'}, status=400)
        
        # Prepare response message
        success_count = len([r for r in results if 'error' not in r and r.get('status') != 'skipped'])
        message = f'Successfully processed {success_count} files'
        if skipped_count > 0:
            message += f', skipped {skipped_count} duplicate files'
        
        return JsonResponse({
            'status': 'success', 
            'message': message,
            'results': results
        })
    return render(request, "file.html")

@method_decorator(csrf_exempt, name='dispatch')
class tableView(APIView):
    def get(self,request,format=None):
        words = FileWords.objects.all()
        serializer = FileWordsSerializers(words,many=True)
        return Response({
                            'msg':'Success',
                            'status': status.HTTP_200_OK,
                            'data': serializer.data
                        })
    def delete(self,request,id):
        try:
            # Get the word record to find associated file
            word = FileWords.objects.get(id=id)
            file_id = word.file_id_id
            
            # Check if this is the last word from this file
            remaining_words = FileWords.objects.filter(file_id_id=file_id).count()
            
            if remaining_words == 1:
                # This is the last word from this file, delete the entire file
                success, message = delete_file_completely(file_id)
                if not success:
                    return Response({
                        'msg': message,
                        'status': status.HTTP_400_BAD_REQUEST
                    })
            else:
                # Just delete this word record
                word.delete()
            
            # Return updated word list
            words = FileWords.objects.all()
            serializer = FileWordsSerializers(words,many=True)
            return Response({
                'msg': 'Data Deleted Successfully',
                'status': status.HTTP_200_OK,
                'data': serializer.data    
            })
            
        except FileWords.DoesNotExist:
            return Response({
                'msg': 'Word not found',
                'status': status.HTTP_404_NOT_FOUND
            })
        except Exception as e:
            return Response({
                'msg': f'Error deleting data: {str(e)}',
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR
            })

# def filetbl(request):
#     store_words = FileWords.objects.all()
#     return render(request, 'filetbl.html', {'store_words':store_words})

@method_decorator(csrf_exempt, name='dispatch')
class FileWordsSearchAPIView(APIView):
    """
    POST { "wordsearch": "<word>", "search_type": "exact|contains" }  →  [ { id, word, file }, ... ]
    """

    # If you want the endpoint open to anyone, leave this out or
    # set permission_classes = [permissions.AllowAny]
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        word = request.data.get("wordsearch")
        search_type = request.data.get("search_type", "exact")  # Default to exact match

        if not word:
            return Response(
                {"detail": "wordsearch field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Choose the filter based on search type
        if search_type == "contains":
            qs = FileWords.objects.filter(word__icontains=word)
        else:
            # Default to exact match
            qs = FileWords.objects.filter(word__iexact=word)

        serializer = FileWordsSerializers(qs, many=True)
        return Response({
            "total_results": qs.count(),
            "results": serializer.data
        }, status=status.HTTP_200_OK)
    
def search(request):
    store_words = []
    if request.method == 'POST':
        wd = request.POST['wordsearch']
        search_type = request.POST.get('search_type', 'exact')
        
        if search_type == 'contains':
            store_words = FileWords.objects.filter(word__icontains=wd)
        else:
            # Default to exact match but case insensitive
            store_words = FileWords.objects.filter(word__iexact=wd)
            
    return render(request, 'filetbl.html', {'store_words': store_words})

def delete(request,id):
    dl = FileWords.objects.get(id=id)
    dl.delete()
    store_words = FileWords.objects.all()
    return render(request, 'filetbl.html',{'store_words':store_words})

@method_decorator(csrf_exempt, name='dispatch')
class FileDeleteAPIView(APIView):
    """
    Delete entire files with all associated words and physical files
    """
    def delete(self, request, file_id):
        success, message = delete_file_completely(file_id)
        
        if success:
            return Response({
                'msg': message,
                'status': status.HTTP_200_OK
            })
        else:
            return Response({
                'msg': message,
                'status': status.HTTP_400_BAD_REQUEST
            })

@csrf_exempt
def clear_all_files(request):
    """
    Delete all uploaded files and associated data
    """
    if request.method == "DELETE":
        try:
            deleted_files = []
            errors = []
            
            # Get all uploaded files
            uploaded_files = UploadedFiles.objects.all()
            
            for uploaded_file in uploaded_files:
                success, message = delete_file_completely(uploaded_file.id)
                if success:
                    deleted_files.append(uploaded_file.original_filename or uploaded_file.file.name)
                else:
                    errors.append(message)
            
            if errors:
                return JsonResponse({
                    'status': 'partial_success',
                    'message': f'Deleted {len(deleted_files)} files with {len(errors)} errors',
                    'deleted_files': deleted_files,
                    'errors': errors
                })
            else:
                return JsonResponse({
                    'status': 'success',
                    'message': f'Successfully deleted all {len(deleted_files)} files',
                    'deleted_files': deleted_files
                })
                
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Error clearing files: {str(e)}'
            }, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

# def test(request):
#     print("hello world!")
#     return HttpResponse('done')
# def imageToText(request):
#     try:
#         print("running")
#         pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
#         image_path = r"media/media/image1.png"

#         img = Image.open(image_path)

#         text = pytesseract.image_to_string(img)

#         # Return cleaned text
#         return HttpResponse(text.strip())
#     except Exception as e:
#         return HttpResponse(f"Error: {str(e)}", status=500)


# def videoToText(request):
#     # To Extract Audio From Video

#     video = VideoFileClip("media/media/videoSample2.mp4")
#     video.audio.write_audiofile("extracted_audio.wav")

#     # For Convert Audio To Text

#     recognizer = sr.Recognizer()
#     with sr.AudioFile("extracted_audio.wav") as source:
#         audio_data = recognizer.record(source)
#         text = recognizer.recognize_google(audio_data)
#         print(text)
#     return HttpResponse(text)