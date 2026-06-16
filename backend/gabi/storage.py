from django.contrib.staticfiles.storage import StaticFilesStorage


class ReadableStaticFilesStorage(StaticFilesStorage):
    """Static files must stay readable by the web server in production."""

    file_permissions_mode = 0o644
    directory_permissions_mode = 0o755
