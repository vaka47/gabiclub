from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ArticleTagViewSet, ArticleViewSet

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='articles')
router.register(r'tags', ArticleTagViewSet, basename='tags')

urlpatterns = [
    path('', include(router.urls)),
]
