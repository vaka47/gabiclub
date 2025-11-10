"""
URL configuration for gabi project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.decorators.cache import never_cache
from django.views.static import serve as django_static_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/trainings/', include('trainings.urls')),
    path('api/camps/', include('camps.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/core/', include('core.urls')),
]

# Serve uploaded media even when DEBUG=0 so images added via the admin stay reachable.
# (For higher traffic consider letting the web server / CDN handle /media/.)
if settings.MEDIA_URL and settings.MEDIA_URL.startswith("/") and settings.MEDIA_ROOT:
    media_path = settings.MEDIA_URL.strip("/")
    if media_path:
        urlpatterns += [
            path(
                f"{media_path}/<path:path>",
                never_cache(django_static_serve),
                {"document_root": settings.MEDIA_ROOT},
            )
        ]
