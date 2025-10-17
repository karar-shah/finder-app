from django.contrib import admin
from .models import UploadedFiles,FileWords 

# Register models with Django admin for easy inspection and basic management in the admin UI.

# Register your models here.
admin.site.register(UploadedFiles)

admin.site.register(FileWords)