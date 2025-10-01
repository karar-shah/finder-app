from django.shortcuts import render, HttpResponse
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import UploadedFiles, FileWords
from django.conf import settings
import os
import speech_recognition as sr
from docx import Document
from openpyxl import load_workbook
# import easyocr
from PIL import Image
from moviepy import VideoFileClip
import pytesseract
from rest_framework.views import APIView
from .serializers import FileWordsSerializers
from rest_framework.response import Response
from rest_framework import status
setting = settings.MEDIA_URL

import warnings
warnings.filterwarnings("ignore")  # suppress all warnings (use with caution)


# Create your views here.
@csrf_exempt
def file(request):
    import PyPDF2
    if request.method == "POST":
        file2 = request.FILES.getlist("file")
        print("Selected Files: ", file2)
        results = []
        for i in range(len(file2)):
            file_name = str(file2[i])
            file_extension = os.path.splitext(file_name)[1].lower().lstrip('.')
            print(f"File extension: {file_extension}")
            try:
                if file_extension == 'txt':
                    file_name = file2[i]
                    original_name = file_name.name  # Store original filename
                    documant1 = UploadedFiles(file=file_name, original_filename=original_name)
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
                    original_name = file_name.name  # Store original filename
                    documant1 = UploadedFiles(file=file_name, original_filename=original_name)
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
                    original_name = file_name.name  # Store original filename
                    documant1 = UploadedFiles(file=file_name, original_filename=original_name)
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
                    original_name = file_name.name  # Store original filename
                    documant1 = UploadedFiles(file=file_name, original_filename=original_name)
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    print('original filename: ', original_name)
                    # Use the actual saved file path, not the original name
                    path = documant1.file.path
                    print("Path from setting: ", path)
                    text = ""
                    with open(path, 'rb') as pdf_file:
                        pdf_reader = PyPDF2.PdfReader(pdf_file)
                        for page_num in range(len(pdf_reader.pages)):
                            page = pdf_reader.pages[page_num]
                            text += page.extract_text() or ""
                    data = text.split()
                    word_dict = {}
                    for id, word in enumerate(data):
                        word_dict[word] = id + 1
                    for word in word_dict.items():
                        print(f"Word: {word[0]} | file: {fileId}")
                        documant = FileWords(word=word[0], file_id_id=fileId)
                        documant.save()
                    results.append({'file': file_name.name, 'words': len(word_dict)})
                elif file_extension == 'wav':
                    file_name = file2[i]
                    documant1 = UploadedFiles(file=file_name)
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
                    documant1 = UploadedFiles(file=file_name)
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
                    documant1 = UploadedFiles(file=file_name)
                    documant1.save()
                    fileId = documant1.id
                    print('updated: ', documant1.id)
                    # Set Tesseract command based on OS
                    if os.name == 'nt':  # Windows
                        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
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
                    documant1 = UploadedFiles(file=file_name)
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
        
        return JsonResponse({'status': 'success', 'results': results})
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
        id=id
        word = FileWords.objects.get(id=id)
        word.delete()
        words = FileWords.objects.all()
        serializer = FileWordsSerializers(words,many=True)
        return Response({
                            'msg': 'Data Deleted',
                            'status' : status.HTTP_200_OK,
                            'data': serializer.data    
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