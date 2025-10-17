from django.apps import AppConfig


class TextfinderappConfig(AppConfig):
    """Django AppConfig for TextFinderApp.

    Purpose: Provides application metadata for Django; keep lightweight.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'TextFinderApp'
