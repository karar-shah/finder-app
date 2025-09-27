from rest_framework import serializers
from .models import UploadedFiles, FileWords

class UploadedFilesSerializers(serializers.ModelSerializer):
    class Meta:
        model = UploadedFiles
        fields = '__all__'

class FileWordsSerializers(serializers.ModelSerializer):
    file = serializers.FileField(      # or CharField, URLField …
        source='file_id.file',         # dot‑path here is allowed in `source`
        read_only=True
    )
    class Meta:
        model = FileWords
        fields = ['id','word','file']