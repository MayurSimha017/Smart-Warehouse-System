
from rest_framework import viewsets # type: ignore[import]
from .models import Product
from .serializers import ProductSerializer
from rest_framework.decorators import action # type: ignore[import]
from rest_framework.response import Response # type: ignore[import]
from rest_framework.permissions import IsAuthenticated # type: ignore[import]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def scan_in(self, request):
        sku = request.data.get('sku')
        try:
            product = Product.objects.get(sku=sku)
            product.quantity += 1
            product.save()
            return Response({'status': 'success', 'new_quantity': product.quantity})
        except Product.DoesNotExist:
            return Response({'status': 'error', 'message': 'Product not found'}, status=404)

    def perform_destroy(self, instance):
        # Optional: Log the deletion before it's gone
        print(f"Product {instance.name} is being deleted")
        instance.delete()
