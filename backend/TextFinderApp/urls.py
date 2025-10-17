# urls.py
# Application URL routes for TextFinderApp.
# Routes include file upload endpoints, directory uploads, search API, and
# endpoints to delete words or entire files. These are used by the frontend
# and can also be exercised via curl/postman during development.

from django.urls import path
from . import views

urlpatterns = [
    path('file/',views.file),
    path('upload-directory/',views.upload_directory),
    path('filetbl/',views.tableView.as_view(),name='file_table'),
    path('filetbl/<int:id>',views.tableView.as_view(),name='delete_word'),
    path('search/',views.search),
    path('api/search/',views.FileWordsSearchAPIView.as_view(),name='api_search'),
    path('delete/<int:id>',views.delete),
    path('api/delete-file/<int:file_id>',views.FileDeleteAPIView.as_view(),name='delete_file'),
    path('api/clear-all/',views.clear_all_files,name='clear_all'),
    # path('test/',views.test),
    # path('imgToText/',views.imageToText),
    # path('video-to-text/',views.videoToText)
]