# advancedTFA/urls.py
# Project-level URL configuration. Routes the root URL space to the
# TextFinderApp application and exposes the admin interface. In DEBUG mode,
# media files are served by Django for convenience during development.

from django.contrib import admin
from django.urls import path, include
from TextFinderApp import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include("TextFinderApp.urls")),
]
if settings.DEBUG:
    urlpatterns+=static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
