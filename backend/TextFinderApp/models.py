# models.py
# Database models for TextFinderApp.
# UploadedFiles: stores metadata and the uploaded file itself.
# FileWords: stores individual words extracted from uploaded files and links back to UploadedFiles.

from django.db import models

# Create your models here.
class UploadedFiles(models.Model):
    """Represents a file uploaded by a user.

    Attributes:
        file: FileField referencing the saved file in MEDIA_ROOT.
        original_filename: Optional original filename provided by the user.
    """
    file = models.FileField(upload_to='media', null=True, blank=True)
    original_filename = models.CharField(max_length=255, null=True, blank=True)

class FileWords(models.Model):
    """Represents a single extracted word from an uploaded file.

    Attributes:
        word: The extracted text token.
        file_id: ForeignKey to UploadedFiles; cascade deletes when file is removed.
    """
    word = models.CharField(max_length=200)
    file_id = models.ForeignKey(UploadedFiles, on_delete=models.CASCADE)