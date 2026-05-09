from rest_framework import serializers # type: ignore[import]
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__' # This tells Django to include all fields (name, price, etc.)