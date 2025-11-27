# smokeshop/storelocator/tests.py

from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch, MagicMock
from django.core.files.uploadedfile import SimpleUploadedFile

from .models import Store, City, State
from .utils import get_closest_store

# ----------------------------
# UTILS TESTS
# ----------------------------
class UtilsTests(TestCase):
    def setUp(self):
        self.state = State.objects.create(name="Test State", abbreviation="TS", slug="test-state")
        self.city = City.objects.create(name="Test City", state=self.state, slug="test-city")

        image_file = SimpleUploadedFile(
            name="test_image.jpg",
            content=b"file_content",
            content_type="image/jpeg"
        )

        self.store1 = Store.objects.create(
            name="Store One",
            city=self.city,
            latitude=10.0,
            longitude=10.0,
            main_image=image_file,
            primary_image=image_file,
            secondary_image=image_file,
            slug="store-one"
        )

        self.store2 = Store.objects.create(
            name="Store Two",
            city=self.city,
            latitude=20.0,
            longitude=20.0,
            main_image=image_file,
            primary_image=image_file,
            secondary_image=image_file,
            slug="store-two"
        )

    # ------------------
    # UNIT TESTS (mocked)
    # ------------------
    @patch("storelocator.utils.GoogleV3.geocode")
    def test_get_closest_store_success(self, mock_geocode):
        mock_location = MagicMock()
        mock_location.latitude = 10.1
        mock_location.longitude = 10.1
        mock_geocode.return_value = mock_location

        result = get_closest_store("Some address")

        self.assertIsNotNone(result["store"])
        self.assertEqual(result["store"].name, "Store One")
        self.assertIsNotNone(result["data"])
        self.assertIsNone(result["error"])
        self.assertTrue(result["distance_m"] > 0)

    @patch("storelocator.utils.GoogleV3.geocode")
    def test_get_closest_store_no_address(self, mock_geocode):
        result = get_closest_store("")
        self.assertIsNone(result["store"])
        self.assertIsNone(result["data"])
        self.assertEqual(result["error"], "No address provided.")
        self.assertIsNone(result["distance_m"])

    @patch("storelocator.utils.GoogleV3.geocode")
    def test_get_closest_store_geocode_fail(self, mock_geocode):
        mock_geocode.return_value = None
        result = get_closest_store("Invalid Address")
        self.assertIsNone(result["store"])
        self.assertIsNone(result["data"])
        self.assertEqual(result["error"], "Address could not be geocoded.")
        self.assertIsNone(result["distance_m"])

    # ------------------
    # INTEGRATION TESTS (real-data)
    # ------------------
    def test_get_closest_store_real_data(self):
        # Use actual coordinates of store1
        address = f"{self.store1.latitude},{self.store1.longitude}"
        result = get_closest_store(address)

        self.assertIsNotNone(result["store"])
        self.assertEqual(result["store"].name, "Store One")
        self.assertIsNone(result["error"])
        self.assertTrue(result["distance_m"] >= 0)


# ----------------------------
# VIEWS TESTS
# ----------------------------
class ViewsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.state = State.objects.create(name="Test State", abbreviation="TS", slug="test-state")
        self.city = City.objects.create(name="Test City", state=self.state, slug="test-city")

        image_file = SimpleUploadedFile(
            name="test_image.jpg",
            content=b"file_content",
            content_type="image/jpeg"
        )

        self.store = Store.objects.create(
            name="Store One",
            city=self.city,
            latitude=10.0,
            longitude=10.0,
            main_image=image_file,
            primary_image=image_file,
            secondary_image=image_file,
            slug="store-one"
        )

    # ------------------
    # UNIT TESTS (mocked)
    # ------------------
    @patch("storelocator.views.get_closest_store")
    def test_index_view_get(self, mock_get_closest):
        mock_get_closest.return_value = {
            "store": self.store,
            "data": {"name": "Store One"},
            "distance_m": 100,
            "error": None
        }

        response = self.client.get(reverse("storelocator:index"), {"address": "Some Address"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("closest_store", response.context)
        self.assertEqual(response.context["closest_store"]["name"], "Store One")

    @patch("storelocator.views.get_closest_store")
    def test_index_view_ajax(self, mock_get_closest):
        mock_get_closest.return_value = {
            "store": self.store,
            "data": {"name": "Store One"},
            "distance_m": 100,
            "error": None
        }

        response = self.client.get(
            reverse("storelocator:index"),
            {"address": "Some Address"},
            HTTP_X_REQUESTED_WITH="XMLHttpRequest"
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            str(response.content, encoding="utf8"),
            {
                "closest_store": {"name": "Store One"},
                "distance_m": 100,
                "error": None
            }
        )

    # ------------------
    # INTEGRATION TESTS (real-data)
    # ------------------
    def test_index_view_real_data(self):
        address = f"{self.store.latitude},{self.store.longitude}"
        response = self.client.get(reverse("storelocator:index"), {"address": address})
        self.assertEqual(response.status_code, 200)
        self.assertIn("closest_store", response.context)
        self.assertEqual(response.context["closest_store"]["name"], "Store One")

    def test_city_stores_view(self):
        response = self.client.get(reverse("storelocator:city_stores", args=[self.state.slug, self.city.slug]))
        self.assertEqual(response.status_code, 200)
        self.assertIn("stores", response.context)
        self.assertEqual(len(response.context["stores"]), 1)

    def test_store_detail_view(self):
        response = self.client.get(reverse("storelocator:store", args=[self.state.slug, self.city.slug, self.store.slug]))
        self.assertEqual(response.status_code, 200)
        self.assertIn("store", response.context)
        self.assertEqual(response.context["store"].name, "Store One")
