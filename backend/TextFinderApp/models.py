from django.db import models

# Create your models here.
class UploadedFiles(models.Model):
    file = models.FileField(upload_to='media', null=True, blank=True)
    original_filename = models.CharField(max_length=255, null=True, blank=True)

class FileWords(models.Model):
    word = models.CharField(max_length=200)
    file_id = models.ForeignKey(UploadedFiles, on_delete=models.CASCADE)