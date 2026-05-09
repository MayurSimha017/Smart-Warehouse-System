from django.urls import path, include # type: ignore[import]
from rest_framework.routers import DefaultRouter # type: ignore[import]
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
]