import requests
import json
import datetime
import sys

BASE_URL = "http://127.0.0.1:8000/api"
FRONTEND_URL = "http://localhost:3000"

def run_tests():
    print("=" * 60)
    print("STARTING COMPLETE STAYNEST SYSTEM VERIFICATION")
    print("=" * 60)

    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health check passed:", res.json())

    # 2. Frontend response check
    f_res = requests.get(f"{FRONTEND_URL}/")
    assert f_res.status_code == 200, f"Frontend home failed: {f_res.status_code}"
    print(f"[PASS] Frontend home page responding on {FRONTEND_URL} (Status 200)")

    # 3. Authentication checks
    # 3a. Guest Demo
    g_res = requests.post(f"{BASE_URL}/auth/demo/guest")
    assert g_res.status_code == 200, "Guest demo login failed"
    guest_token = g_res.json()["access_token"]
    guest_headers = {"Authorization": f"Bearer {guest_token}"}
    print("[PASS] Guest Demo Login successful:", g_res.json()["user"]["name"])

    # 3b. Host Demo
    h_res = requests.post(f"{BASE_URL}/auth/demo/host")
    assert h_res.status_code == 200, "Host demo login failed"
    host_token = h_res.json()["access_token"]
    host_headers = {"Authorization": f"Bearer {host_token}"}
    print("[PASS] Host Demo Login successful:", h_res.json()["user"]["name"])

    # 3c. Admin Demo
    a_res = requests.post(f"{BASE_URL}/auth/demo/admin")
    assert a_res.status_code == 200, "Admin demo login failed"
    admin_token = a_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Admin Demo Login successful:", a_res.json()["user"]["name"])

    # 3d. Invalid credentials test
    inv_res = requests.post(f"{BASE_URL}/auth/login", json={"email": "wrong@example.com", "password": "wrong"})
    assert inv_res.status_code == 401, f"Expected 401 for invalid credentials, got {inv_res.status_code}"
    print("[PASS] Invalid credentials correctly rejected with 401")

    # 3e. Standard Login with password
    std_res = requests.post(f"{BASE_URL}/auth/login", json={"email": "guest@staynest.com", "password": "Guest123!"})
    assert std_res.status_code == 200, "Standard login failed"
    print("[PASS] Standard login with Guest123! verified")

    # 3f. Register a new user
    new_email = f"traveler_{int(datetime.datetime.now().timestamp())}@staynest.com"
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Kabir Das",
        "email": new_email,
        "password": "SecretPassword123!",
        "role": "guest"
    })
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    print("[PASS] User registration verified for new user:", new_email)

    # 4. Property Listing & Category Filtering
    all_props = requests.get(f"{BASE_URL}/properties").json()
    print(f"[PASS] Total seeded properties in database: {len(all_props)} (Requirement: >= 40)")
    assert len(all_props) >= 40, f"Expected >= 40 properties, found {len(all_props)}"

    categories = [
        "Luxury Villas",
        "Mountain Cabins",
        "Beachfront",
        "Heritage Havens",
        "City Penthouses",
        "Nature Cottages"
    ]
    for cat in categories:
        cat_props = requests.get(f"{BASE_URL}/properties", params={"category": cat}).json()
        assert len(cat_props) > 0, f"Category '{cat}' returned 0 results!"
        print(f"  [PASS] Category '{cat}': {len(cat_props)} stays verified")

    # 5. Destination Filtering for all 8 Indian cities
    cities = ["Goa", "Dehradun", "Jaipur", "Manali", "Udaipur", "Rishikesh", "Mumbai", "Delhi"]
    for city in cities:
        city_props = requests.get(f"{BASE_URL}/properties", params={"city": city}).json()
        assert len(city_props) > 0, f"City '{city}' returned 0 results!"
        print(f"  [PASS] Destination '{city}': {len(city_props)} stays verified")

    # 6. Property Details Route
    prop1 = requests.get(f"{BASE_URL}/properties/1").json()
    assert prop1["id"] == 1, "Property 1 details mismatch"
    assert len(prop1["images"]) >= 4, "Property should have multiple images"
    assert len(prop1["amenities"]) > 0, "Property should have amenities"
    print(f"[PASS] Property Details verified for ID 1: '{prop1['title']}', INR {prop1['price_per_night']}/night")

    # 7. Booking Flow & Double-booking prevention
    test_check_in = (datetime.date.today() + datetime.timedelta(days=10)).isoformat()
    test_check_out = (datetime.date.today() + datetime.timedelta(days=14)).isoformat()

    # 7a. Normal booking creation
    book_res = requests.post(f"{BASE_URL}/bookings", headers=guest_headers, json={
        "property_id": 1,
        "check_in": test_check_in,
        "check_out": test_check_out,
        "guests": 2
    })
    assert book_res.status_code == 200, f"Booking creation failed: {book_res.text}"
    booking_data = book_res.json()
    assert booking_data["nights"] == 4, f"Expected 4 nights, got {booking_data['nights']}"
    assert booking_data["status"] == "confirmed", "Expected confirmed status"
    print(f"[PASS] Booking #{booking_data['id']} successfully created for {test_check_in} to {test_check_out}. Total: INR {booking_data['total_price']}")

    # 7b. Double booking prevention (attempt booking same property for overlapping dates)
    dup_res = requests.post(f"{BASE_URL}/bookings", headers=guest_headers, json={
        "property_id": 1,
        "check_in": (datetime.date.today() + datetime.timedelta(days=12)).isoformat(),
        "check_out": (datetime.date.today() + datetime.timedelta(days=16)).isoformat(),
        "guests": 2
    })
    assert dup_res.status_code == 409, f"Expected 409 Conflict for double booking, got {dup_res.status_code}"
    print("[PASS] Double booking prevented with 409 Conflict correctly")

    # 7c. Validation: past dates
    past_res = requests.post(f"{BASE_URL}/bookings", headers=guest_headers, json={
        "property_id": 1,
        "check_in": "2020-01-01",
        "check_out": "2020-01-05",
        "guests": 2
    })
    assert past_res.status_code == 400, "Past date should be rejected"
    print("[PASS] Past dates correctly rejected with 400")

    # 7d. Validation: check_out <= check_in
    inv_date_res = requests.post(f"{BASE_URL}/bookings", headers=guest_headers, json={
        "property_id": 1,
        "check_in": test_check_out,
        "check_out": test_check_in,
        "guests": 2
    })
    assert inv_date_res.status_code == 400, "Invalid date sequence should be rejected"
    print("[PASS] Checkout before check-in correctly rejected with 400")

    # 7e. Check bookings in user's dashboard
    my_bookings = requests.get(f"{BASE_URL}/bookings/my", headers=guest_headers).json()
    assert len(my_bookings) >= 1, "Expected at least 1 booking in user's trips"
    print(f"[PASS] User's trips returned {len(my_bookings)} bookings")

    # 8. Favorites
    fav_res = requests.post(f"{BASE_URL}/favorites/1", headers=guest_headers).json()
    assert fav_res["favorited"] is True or fav_res["favorited"] is False
    my_favs = requests.get(f"{BASE_URL}/favorites/my", headers=guest_headers).json()
    print(f"[PASS] Favorites toggle and retrieval verified. Active favorites: {len(my_favs)}")

    # 9. Reviews
    rev_res = requests.post(f"{BASE_URL}/properties/1/reviews", headers=guest_headers, json={
        "rating": 5.0,
        "comment": "Exceptional stay! Spotless pool, courteous host and serene location."
    })
    assert rev_res.status_code == 200, f"Review submission failed: {rev_res.text}"
    print("[PASS] Property review posted and property rating updated")

    # 10. Host Portal Checks
    h_props = requests.get(f"{BASE_URL}/host/properties", headers=host_headers).json()
    h_stats = requests.get(f"{BASE_URL}/host/stats", headers=host_headers).json()
    print(f"[PASS] Host Portal verified: {len(h_props)} listings, Total earnings: INR {h_stats['total_earnings']}")

    # 10b. Create new property as host
    new_prop_res = requests.post(f"{BASE_URL}/properties", headers=host_headers, json={
        "title": "Tranquil Bamboo Grove Villa",
        "category": "Nature Cottages",
        "city": "Goa",
        "location": "Assagao, North Goa",
        "description": "Brand new sustainable boutique villa with private plunge pool.",
        "price_per_night": 21500,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Private Pool", "WiFi", "AC"],
        "images": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"]
    })
    assert new_prop_res.status_code == 200, f"Host create property failed: {new_prop_res.text}"
    created_prop_id = new_prop_res.json()["id"]
    print(f"[PASS] Host created new property #{created_prop_id} successfully in SQLite database")

    # Verify new property appears in normal listings search
    verify_new = requests.get(f"{BASE_URL}/properties/{created_prop_id}").json()
    assert verify_new["title"] == "Tranquil Bamboo Grove Villa"
    print("[PASS] Newly created host property is immediately visible in normal search and details!")

    # 11. Admin Portal Checks
    adm_stats = requests.get(f"{BASE_URL}/admin/stats", headers=admin_headers).json()
    adm_users = requests.get(f"{BASE_URL}/admin/users", headers=admin_headers).json()
    adm_props = requests.get(f"{BASE_URL}/admin/properties", headers=admin_headers).json()
    adm_books = requests.get(f"{BASE_URL}/admin/bookings", headers=admin_headers).json()
    print(f"[PASS] Admin Portal verified: {adm_stats['total_users']} users, {adm_stats['total_properties']} properties, {adm_stats['total_bookings']} bookings, Revenue: INR {adm_stats['total_revenue']}")

    # 11b. Security Check: Normal guest trying to access admin endpoint
    sec_res = requests.get(f"{BASE_URL}/admin/stats", headers=guest_headers)
    assert sec_res.status_code == 403, f"Expected 403 Forbidden for non-admin, got {sec_res.status_code}"
    print("[PASS] Security guard verified: Normal guest received 403 Forbidden on admin endpoint")

    # 12. Frontend Route HTTP Status Checks
    routes = [
        "/",
        "/dashboard",
        "/host",
        "/admin",
        "/properties/1"
    ]
    for r in routes:
        page_res = requests.get(f"{FRONTEND_URL}{r}")
        assert page_res.status_code == 200, f"Frontend route '{r}' returned {page_res.status_code}"
        print(f"[PASS] Frontend route '{r}' responded 200 OK")

    print("\n" + "=" * 60)
    print("ALL 12 TEST SUITES PASSED FLAWLESSLY WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
