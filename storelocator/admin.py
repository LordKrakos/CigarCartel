# storelocator/admin.py

from django.contrib import admin
from .models import State, City, Store

# Register your models here.
admin.site.register(State)
admin.site.register(City)
admin.site.register(Store)