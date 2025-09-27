from django.shortcuts import render, HttpResponse
from django.http import HttpResponseRedirect
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
def file(request):
    if request.method == "POST":
        file2 = request.FILES.getlist("file")
        print("Selected Files: ", file2)
        for i in range(len(file2)):
            file_name = str(file2[i])
            # Properly handle file extensions, including filenames with multiple dots or dashes
            file_extension = os.path.splitext(file_name)[1].lower().lstrip('.')
            print(f"File extension: {file_extension}")

            if file_extension == 'txt':
                file_name = file2[i]
                documant1 = UploadedFiles(file=file_name)
                documant1.save()
                fileId = documant1.id
                print('updated: ',documant1.id)
                file_path = os.path.join(settings.MEDIA_ROOT)
                path=f'media/media/{file2[i]}'
                print("Path from setting: ",path)

                f = open(path, mode='r')
                
                data = f.read().split()
                dict = {}
                for id,word in enumerate(data):
                    dict[word]= id+1
                for word in dict.items():
                    print(f"Word: {word[0]} | file: {fileId}")
                    documant = FileWords(word=word[0], file_id_id=fileId)
                    documant.save()
            elif file_extension == 'docx':
                file_name = file2[i]
                documant1 = UploadedFiles(file=file_name)
                documant1.save()
                fileId = documant1.id
                print('updated: ', documant1.id)
                file_path = os.path.join(settings.MEDIA_ROOT)
                path = f'media/media/{file2[i]}'
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
            elif file_extension == 'xlsx':
                file_name = file2[i]
                documant1 = UploadedFiles(file=file_name)
                documant1.save()
                fileId = documant1.id
                print('updated: ', documant1.id)
                file_path = os.path.join(settings.MEDIA_ROOT)
                path = f'media/media/{file2[i]}'
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
            elif file_extension == 'wav':
                file_name = file2[i]
                documant1 = UploadedFiles(file=file_name)
                documant1.save()
                fileId = documant1.id
                print('updated: ', documant1.id)
                file_path = os.path.join(settings.MEDIA_ROOT)
                path = f'media/media/{file2[i]}'
                print("Path from setting: ", path)

                recognizer = sr.Recognizer()
                # audio_file_path = path
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


                # file_path = os.path.join(settings.MEDIA_ROOT)
                image_path = f'media/media/{file2[i]}'
                print("Path from settings: ", image_path)

                # To Extract Audio From Video
                video = VideoFileClip(image_path)
                video.audio.write_audiofile("extracted_audio.wav")

                recognizer = sr.Recognizer()
                with sr.AudioFile("extracted_audio.wav") as source:
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
                    # return HttpResponse("Your File Is Uploaded")
            elif file_extension == 'png' or file_extension == 'jpg' or file_extension == 'jpeg':
                # Process image files
                file_name = file2[i]
                documant1 = UploadedFiles(file=file_name)
                documant1.save()
                fileId = documant1.id
                print('updated: ', documant1.id)

                pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
                file_path = os.path.join(settings.MEDIA_ROOT)
                image_path = f'media/media/{file2[i]}'

                img = Image.open(image_path)
                text = pytesseract.image_to_string(img)
                print("Path from settings: ", image_path)
                print("DATA : ",text)
                
                data = text.split()
                word_dict = {}
                for id, word in enumerate(data):
                    word_dict[word] = id + 1
                for word in word_dict.items():
                    # print(f"Word: {word[0]} | file: {fileId}")
                    documant = FileWords(word=word[0], file_id_id=fileId)
                    documant.save()
                # return HttpResponse("Your File Is Uploaded")
            else:
                return HttpResponse("You are using undefined file.")
    return render(request, "file.html")

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

class FileWordsSearchAPIView(APIView):
    """
    POST { "wordsearch": "<word>" }  →  [ { id, word, file }, ... ]
    """

    # If you want the endpoint open to anyone, leave this out or
    # set permission_classes = [permissions.AllowAny]
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        word = request.data.get("wordsearch")

        if not word:
            return Response(
                {"detail": "wordsearch field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Use __iexact or __icontains depending on your needs
        qs = FileWords.objects.filter(word__iexact=word)

        serializer = FileWordsSerializers(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
def search(request):
    
    if request.method == 'POST':
        wd = request.POST['wordsearch']
        store_words = FileWords.objects.filter(word=wd)
    return render(request,'filetbl.html',{'store_words':store_words})

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