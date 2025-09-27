from django.urls import path
from . import views

urlpatterns = [
    path('file/',views.file),
    path('filetbl/',views.tableView.as_view(),name='file_table'),
    path('filetbl/<int:id>',views.tableView.as_view(),name='delete_word'),
    path('search/',views.search),
    path('delete/<int:id>',views.delete),
    # path('test/',views.test),
    # path('imgToText/',views.imageToText),
    # path('video-to-text/',views.videoToText)
]