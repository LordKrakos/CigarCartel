# smokeshop/storelocator/models.py

from django.db import models
from django.utils.text import slugify


# Create your models here.
class State(models.Model):
    name = models.CharField(max_length=100, unique=True)
    abbreviation = models.CharField(max_length=10, blank=True, null=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.abbreviation if self.abbreviation else self.name


class City(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(
        State,
        on_delete=models.CASCADE,
        related_name="cities"
    )
    slug = models.SlugField(max_length=100, blank=True)

    class Meta:
        unique_together = ("name", "state")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}, {self.state}"
    

class Store(models.Model):
    name = models.CharField(max_length=100)
    main_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    primary_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    secondary_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=False)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=200)
    opening_hour = models.TimeField(blank=True, null=True)
    closing_hour = models.TimeField(blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    city = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.address}, {self.city}"