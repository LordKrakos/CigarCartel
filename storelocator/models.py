from django.db import models


# Create your models here.
class State(models.Model):
    name = models.CharField(max_length=100, unique=True)
    abbreviation = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return self.abbreviation if self.abbreviation else self.name

class City(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(
        State,
        on_delete=models.CASCADE,
        related_name="cities"
    )

    class Meta:
        unique_together = ("name", "state")

    def __str__(self):
        return f"{self.name}, {self.state}"
    

class Store(models.Model):
    name = models.CharField(max_length=100)
    main_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    primary_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    secondary_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=200)
    opening_hour = models.TimeField(blank=True, null=True)
    closing_hour = models.TimeField(blank=True, null=True)
    zip_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    city = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.name} - {self.address}, {self.city}"