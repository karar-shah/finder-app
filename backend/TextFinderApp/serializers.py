# serializers.py
# Serializers for REST API responses.
# These convert UploadedFiles and FileWords model instances into JSON-friendly representations.

from rest_framework import serializers
from .models import UploadedFiles, FileWords

class UploadedFilesSerializers(serializers.ModelSerializer):
    """Serializer for UploadedFiles model — exposes all model fields."""
    class Meta:
        model = UploadedFiles
        fields = '__all__'

class FileWordsSerializers(serializers.ModelSerializer):
    """Serializer for FileWords that also exposes related file information.

    Exposes:
      - id, word
      - file (file path/url from the related UploadedFiles)
      - original_filename from the related UploadedFiles
      - file_id (integer ID)
    """
    file = serializers.FileField(      # or CharField, URLField …
        source='file_id.file',         # dot‑path here is allowed in `source`
        read_only=True
    )
    original_filename = serializers.CharField(
        source='file_id.original_filename',
        read_only=True
    )
    file_id = serializers.IntegerField(
        source='file_id.id',
        read_only=True
    )
    class Meta:
        model = FileWords
        fields = ['id','word','file','original_filename','file_id']