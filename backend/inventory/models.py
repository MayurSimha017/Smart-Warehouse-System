from django.db import models  # type: ignore[reportMissingModuleSource]

class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True) # Unique ID like 'PROD-001'
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.sku}"


class StockLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    change_amount = models.IntegerField() # e.g., +5 or -3
    user = models.CharField(max_length=100) # Who did it
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} changed by {self.change_amount} at {self.timestamp}"