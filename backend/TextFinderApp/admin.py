from django.contrib import admin
from .models import UploadedFiles,FileWords 

# Register your models here.
admin.site.register(UploadedFiles)

admin.site.register(FileWords)