import json
from sqlalchemy.orm import Session
import models
from auth import hash_password

DEMO_USERS = [
    {
        "name": "Aarav Sharma",
        "email": "guest@staynest.com",
        "password": "Guest123!",
        "role": "guest",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
        "bio": "Travel enthusiast exploring scenic getaways and heritage stays across India."
    },
    {
        "name": "Priya Sen",
        "email": "host@staynest.com",
        "password": "Host123!",
        "role": "host",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
        "bio": "Hospitality designer and Superhost managing boutique villas and heritage stays."
    },
    {
        "name": "StayNest Operations",
        "email": "admin@staynest.com",
        "password": "Admin123!",
        "role": "admin",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
        "bio": "System administrator and quality assurance for StayNest India."
    }
]

PROPERTIES_DATA = [
    # 1. Goa - Luxury Villas
    {
        "title": "Villa Solarium - Private Pool Estate",
        "category": "Luxury Villas",
        "city": "Goa",
        "location": "Candolim, North Goa",
        "description": "An opulent 4-bedroom Portuguese-modern villa tucked amidst whispering palms. Features a temperature-controlled swimming pool, manicured sun deck, private chef pavilion, and bespoke luxury decor.",
        "price_per_night": 24500,
        "rating": 4.97,
        "review_count": 84,
        "guests": 8,
        "bedrooms": 4,
        "beds": 4,
        "bathrooms": 4,
        "amenities": ["Private Pool", "High-speed WiFi", "Air Conditioning", "Chef on Request", "Power Backup", "Barbeque Grill", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 2. Goa - Beachfront
    {
        "title": "Azure Horizon Beachfront Villa",
        "category": "Beachfront",
        "city": "Goa",
        "location": "Ashwem Beach, Goa",
        "description": "Step right onto soft golden sands from your personal verandah. Panoramic Arabian Sea views, open-air sun loungers, tropical outdoor showers, and sunset dining under the stars.",
        "price_per_night": 18900,
        "rating": 4.94,
        "review_count": 112,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "amenities": ["Beachfront Access", "Private Balcony", "Sea View", "High-speed WiFi", "Air Conditioning", "Breakfast Included", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 3. Goa - Nature Cottages
    {
        "title": "The Palm Sanctuary Bohemian Cottage",
        "category": "Nature Cottages",
        "city": "Goa",
        "location": "Palolem, South Goa",
        "description": "A tranquil eco-chic wooden cottage nestled amidst coconut groves and tropical flora. Organic gardens, outdoor hammock deck, yoga platform, and serene bird songs every dawn.",
        "price_per_night": 6500,
        "rating": 4.88,
        "review_count": 67,
        "guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1,
        "amenities": ["Garden View", "High-speed WiFi", "Dedicated Workspace", "Pet Friendly", "Kitchenette", "Hammock"],
        "images": [
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 4. Goa - Heritage Havens
    {
        "title": "Casa Fontainhas 1890 Heritage Estate",
        "category": "Heritage Havens",
        "city": "Goa",
        "location": "Fontainhas, Panaji, Goa",
        "description": "Restored 19th-century Indo-Portuguese mansion featuring oyster shell windows, antique teak furnishings, an intimate courtyard fountain, and high vaulted terracotta ceilings.",
        "price_per_night": 14200,
        "rating": 4.96,
        "review_count": 94,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "amenities": ["Courtyard", "Antique Decor", "Air Conditioning", "High-speed WiFi", "Library", "Chef on Request"],
        "images": [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 5. Goa - Luxury Villas
    {
        "title": "Celeste Riverside Infinity Villa",
        "category": "Luxury Villas",
        "city": "Goa",
        "location": "Siolim, North Goa",
        "description": "Overlooking the Chapora river with a cantilevered infinity pool, private bar, modern minimalist interior, and lush paddy field vistas.",
        "price_per_night": 27000,
        "rating": 4.98,
        "review_count": 59,
        "guests": 10,
        "bedrooms": 5,
        "beds": 5,
        "bathrooms": 5,
        "amenities": ["Infinity Pool", "Riverfront", "Jacuzzi", "High-speed WiFi", "Air Conditioning", "Private Butler", "Power Backup"],
        "images": [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 6. Manali - Mountain Cabins
    {
        "title": "The Cedar Ridge Alpine Chalet",
        "category": "Mountain Cabins",
        "city": "Manali",
        "location": "Old Manali, Himachal Pradesh",
        "description": "Handcrafted log cabin surrounded by majestic deodar trees and snowcapped Himalayan peaks. Features a stone fireplace, cedarwood interiors, and a heated glass sunroom.",
        "price_per_night": 11500,
        "rating": 4.96,
        "review_count": 140,
        "guests": 5,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2,
        "amenities": ["Indoor Fireplace", "Mountain View", "Heated Sunroom", "High-speed WiFi", "Kitchen", "Free Parking", "Bonfire Pit"],
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 7. Manali - Mountain Cabins
    {
        "title": "Solang Valley Pine Wood Cottage",
        "category": "Mountain Cabins",
        "city": "Manali",
        "location": "Solang Valley, Manali",
        "description": "Perched on a quiet hill slope overlooking glacial valleys. Wooden attic bedroom, hot water immersion tub, traditional tandoor barbecue, and panoramic snow vistas.",
        "price_per_night": 8800,
        "rating": 4.91,
        "review_count": 78,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Mountain View", "Fireplace", "High-speed WiFi", "Dedicated Workspace", "Electric Blankets", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 8. Manali - Nature Cottages
    {
        "title": "Apple Orchard Riverside Stone Haven",
        "category": "Nature Cottages",
        "city": "Manali",
        "location": "Naggar Road, Manali",
        "description": "Surrounded by blossoming apple orchards and the calming murmur of the Beas river. Authentic Himachali stone architecture paired with plush Scandinavian bedding.",
        "price_per_night": 7200,
        "rating": 4.89,
        "review_count": 52,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Orchard View", "Bonfire Pit", "High-speed WiFi", "Kitchen", "Pet Friendly", "Balcony"],
        "images": [
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 9. Manali - Luxury Villas
    {
        "title": "The Himalayan Grandeur Mountain Villa",
        "category": "Luxury Villas",
        "city": "Manali",
        "location": "Vashisht, Manali",
        "description": "A luxury hilltop estate with heated floors, floor-to-ceiling glass walls, outdoor cedar hot tub overlooking snow summits, and round-the-clock butler service.",
        "price_per_night": 29000,
        "rating": 4.99,
        "review_count": 48,
        "guests": 8,
        "bedrooms": 4,
        "beds": 4,
        "bathrooms": 4,
        "amenities": ["Outdoor Hot Tub", "Heated Floors", "Himalayan View", "Chef on Request", "High-speed WiFi", "Fireplace"],
        "images": [
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 10. Dehradun - Mountain Cabins
    {
        "title": "Malsi Forest Glasshouse Chalet",
        "category": "Mountain Cabins",
        "city": "Dehradun",
        "location": "Mussoorie Foothills, Dehradun",
        "description": "Nestled in the tranquil sal forests of Dehradun at the foothills of Mussoorie. Contemporary glass design offering 360-degree canopy views and birdsong serenity.",
        "price_per_night": 12500,
        "rating": 4.95,
        "review_count": 92,
        "guests": 5,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2,
        "amenities": ["Forest View", "Glass Architecture", "Indoor Fireplace", "High-speed WiFi", "Dedicated Workspace", "Barbeque Grill"],
        "images": [
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 11. Dehradun - Nature Cottages
    {
        "title": "Rajpur Tea Garden Retreat",
        "category": "Nature Cottages",
        "city": "Dehradun",
        "location": "Old Rajpur, Dehradun",
        "description": "Colonial-style stone cottage overlooking miniature tea garden terraces. Fresh spring water stream, organic vegetable garden, and peaceful writer's alcove.",
        "price_per_night": 6800,
        "rating": 4.92,
        "review_count": 73,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Garden Stream", "Verandah", "High-speed WiFi", "Kitchen", "Pet Friendly", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 12. Dehradun - Luxury Villas
    {
        "title": "The Doon Valley Horizon Estate",
        "category": "Luxury Villas",
        "city": "Dehradun",
        "location": "Sahastradhara Road, Dehradun",
        "description": "Sprawling 5-acre private mountain estate featuring heated indoor pool, badminton court, gazebo fireplace, and sweeping views of the Mussoorie twinkling ridge at night.",
        "price_per_night": 26000,
        "rating": 4.98,
        "review_count": 61,
        "guests": 12,
        "bedrooms": 5,
        "beds": 6,
        "bathrooms": 6,
        "amenities": ["Indoor Heated Pool", "Mountain View", "Chef on Request", "High-speed WiFi", "Air Conditioning", "Billiards Table"],
        "images": [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 13. Jaipur - Heritage Havens
    {
        "title": "Haveli Narain Niwas Royal Suite",
        "category": "Heritage Havens",
        "city": "Jaipur",
        "location": "C-Scheme, Jaipur",
        "description": "Live like royal nobility in a 1920s Rajput princely haveli. Hand-painted frescoes, intricate arches, marble fountains, courtyards with roaming peacocks, and vintage royal hospitality.",
        "price_per_night": 17500,
        "rating": 4.98,
        "review_count": 138,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Royal Courtyard", "Frescoes", "High-speed WiFi", "Air Conditioning", "Breakfast Included", "Heritage Architecture"],
        "images": [
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 14. Jaipur - Luxury Villas
    {
        "title": "Amber Fort View Palatial Villa",
        "category": "Luxury Villas",
        "city": "Jaipur",
        "location": "Amer, Jaipur",
        "description": "Breathtaking direct views of the illuminated Amber Fort. Features a private plunge pool, Mughal gardens, sandstone colonnades, and private Rajasthani folk music evenings.",
        "price_per_night": 28500,
        "rating": 4.97,
        "review_count": 91,
        "guests": 8,
        "bedrooms": 4,
        "beds": 4,
        "bathrooms": 4,
        "amenities": ["Private Pool", "Fort View", "Rooftop Terrace", "Chef on Request", "High-speed WiFi", "Air Conditioning"],
        "images": [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 15. Jaipur - City Penthouses
    {
        "title": "The Pink City Skyline Glass Penthouse",
        "category": "City Penthouses",
        "city": "Jaipur",
        "location": "Malviya Nagar, Jaipur",
        "description": "Top-floor designer penthouse with private glass elevator, rooftop jacuzzi, curated modern art, and an expansive wraparound deck overlooking the Aravalli hills.",
        "price_per_night": 13500,
        "rating": 4.93,
        "review_count": 64,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "amenities": ["Rooftop Jacuzzi", "Skyline View", "Elevator Access", "High-speed WiFi", "Air Conditioning", "Dedicated Workspace"],
        "images": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 16. Udaipur - Heritage Havens
    {
        "title": "Lake Pichola Rawla Heritage Haven",
        "category": "Heritage Havens",
        "city": "Udaipur",
        "location": "Old City, Lake Pichola, Udaipur",
        "description": "An ethereal water-facing traditional mansion right along Lake Pichola. Watch sun rays glisten on the Jag Mandir and City Palace from your private marble jharokha balcony.",
        "price_per_night": 21000,
        "rating": 4.99,
        "review_count": 164,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Lake View", "Jharokha Balcony", "High-speed WiFi", "Air Conditioning", "Boat Transfer Option", "Breakfast Included"],
        "images": [
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 17. Udaipur - Luxury Villas
    {
        "title": "Fateh Sagar Serenade Luxury Villa",
        "category": "Luxury Villas",
        "city": "Udaipur",
        "location": "Fateh Sagar Lake, Udaipur",
        "description": "Private waterfront sanctuary featuring manicured Mughal-style lawns, private pool, personal butler, and undisturbed panoramic water reflections.",
        "price_per_night": 32000,
        "rating": 4.98,
        "review_count": 82,
        "guests": 8,
        "bedrooms": 4,
        "beds": 4,
        "bathrooms": 4,
        "amenities": ["Private Pool", "Waterfront Lawn", "Chef on Request", "High-speed WiFi", "Air Conditioning", "Butler Service"],
        "images": [
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 18. Udaipur - Nature Cottages
    {
        "title": "Aravalli Wilderness Stone Cottage",
        "category": "Nature Cottages",
        "city": "Udaipur",
        "location": "Badi Lake Foothills, Udaipur",
        "description": "Rustic stone cottage surrounded by rugged hills and wilderness flora. Stargazing deck, outdoor campfire pit, natural bird watching, and pure serenity.",
        "price_per_night": 7900,
        "rating": 4.90,
        "review_count": 45,
        "guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1,
        "amenities": ["Stargazing Deck", "Bonfire Pit", "High-speed WiFi", "Kitchenette", "Pet Friendly", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 19. Rishikesh - Mountain Cabins
    {
        "title": "Ganga Valley Forest Glass Cabin",
        "category": "Mountain Cabins",
        "city": "Rishikesh",
        "location": "Shivpuri, Rishikesh",
        "description": "Perched above the turquoise currents of the holy Ganga with dramatic forested cliff sides. Meditation patio, outdoor wood fire, and soothing sounds of nature.",
        "price_per_night": 9800,
        "rating": 4.96,
        "review_count": 105,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["River View", "Meditation Deck", "High-speed WiFi", "Bonfire Pit", "Breakfast Included", "Yoga Mats"],
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 20. Rishikesh - Nature Cottages
    {
        "title": "Ananda Foothills Bamboo Cottage",
        "category": "Nature Cottages",
        "city": "Rishikesh",
        "location": "Tapovan, Rishikesh",
        "description": "Eco-friendly sustainable bamboo and teak wood cottage. Walking distance to iconic ashrams and Laxman Jhula, filled with positive vibrations and herbal gardens.",
        "price_per_night": 5800,
        "rating": 4.88,
        "review_count": 94,
        "guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "amenities": ["Herbal Garden", "High-speed WiFi", "Air Conditioning", "Dedicated Workspace", "Yoga Space"],
        "images": [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 21. Rishikesh - Luxury Villas
    {
        "title": "The Himalayan Sound Sanctuary Villa",
        "category": "Luxury Villas",
        "city": "Rishikesh",
        "location": "Brahmpuri, Rishikesh",
        "description": "Architectural masterpiece with an infinity pool directly facing the mountain canyon and Ganga river. Complete with steam spa, private chef, and yoga instructor.",
        "price_per_night": 23000,
        "rating": 4.97,
        "review_count": 58,
        "guests": 8,
        "bedrooms": 4,
        "beds": 4,
        "bathrooms": 4,
        "amenities": ["Infinity Pool", "Steam Spa", "Canyon View", "High-speed WiFi", "Chef on Request", "Air Conditioning"],
        "images": [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 22. Mumbai - City Penthouses
    {
        "title": "Worli Sea Face Glass Crown Penthouse",
        "category": "City Penthouses",
        "city": "Mumbai",
        "location": "Worli Sea Face, Mumbai",
        "description": "Ultra-luxury double-height penthouse on the 48th floor with uninterrupted Arabian Sea horizon views and direct vistas of the illuminated Bandra-Worli Sea Link.",
        "price_per_night": 38000,
        "rating": 4.98,
        "review_count": 76,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "amenities": ["Panoramic Sea View", "Private Jacuzzi", "Elevator Access", "High-speed WiFi", "Air Conditioning", "Dedicated Workspace", "Gym Access"],
        "images": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 23. Mumbai - City Penthouses
    {
        "title": "Bandra West Bohemian Designer Loft",
        "category": "City Penthouses",
        "city": "Mumbai",
        "location": "Pali Hill, Bandra West, Mumbai",
        "description": "Chic celebrity-neighborhood penthouse loft with private terrace garden, bar counter, vinyl listening station, and footsteps from famous cafes.",
        "price_per_night": 16500,
        "rating": 4.94,
        "review_count": 128,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Terrace Garden", "Vinyl Setup", "High-speed WiFi", "Air Conditioning", "Kitchen", "Pet Friendly"],
        "images": [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 24. Mumbai - Beachfront
    {
        "title": "Juhu Tara Coastal Waterfront Suite",
        "category": "Beachfront",
        "city": "Mumbai",
        "location": "Juhu Tara Road, Mumbai",
        "description": "Rare beachfront apartment directly looking out to Juhu beach and the Arabian sea. Private terrace for sunset tea, soothing wave sounds, and lush coconut palm canopy.",
        "price_per_night": 19500,
        "rating": 4.91,
        "review_count": 89,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Beachfront Access", "Sunset Terrace", "High-speed WiFi", "Air Conditioning", "Dedicated Workspace", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 25. Delhi - City Penthouses
    {
        "title": "Lutyens Skyline Terrace Penthouse",
        "category": "City Penthouses",
        "city": "Delhi",
        "location": "Golf Links, New Delhi",
        "description": "Prestige residence overlooking the sprawling green foliage of central Delhi. Private elevator entry, marble fireplace, wrap-around landscaped terrace, and Italian kitchen.",
        "price_per_night": 22000,
        "rating": 4.96,
        "review_count": 96,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "amenities": ["Private Elevator", "Landscaped Terrace", "High-speed WiFi", "Air Conditioning", "Chef on Request", "Power Backup"],
        "images": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 26. Delhi - Heritage Havens
    {
        "title": "Hauz Khas Monument View Artist Villa",
        "category": "Heritage Havens",
        "city": "Delhi",
        "location": "Hauz Khas Village, New Delhi",
        "description": "Front-row views of 13th-century Delhi Sultanate stone monuments and deer park lake. Curated antique carpets, handcrafted stone walls, and private art collection.",
        "price_per_night": 12800,
        "rating": 4.93,
        "review_count": 150,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Monument View", "Lake View", "High-speed WiFi", "Air Conditioning", "Kitchen", "Terrace"],
        "images": [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 27. Delhi - Luxury Villas
    {
        "title": "Chhatarpur Farmhouse Oasis & Pool",
        "category": "Luxury Villas",
        "city": "Delhi",
        "location": "Chhatarpur Farms, New Delhi",
        "description": "Lavish 2-acre private estate with Olympic-size swimming pool, floodlit tennis lawn, gazebo dining, and serene privacy away from urban bustle.",
        "price_per_night": 34000,
        "rating": 4.97,
        "review_count": 71,
        "guests": 14,
        "bedrooms": 6,
        "beds": 7,
        "bathrooms": 6,
        "amenities": ["Private Pool", "2-Acre Lawn", "Tennis Court", "Chef on Request", "High-speed WiFi", "Air Conditioning", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 28. Goa - Beachfront
    {
        "title": "Morjim Sunset Sands Beach Cottage",
        "category": "Beachfront",
        "city": "Goa",
        "location": "Morjim Beach, Goa",
        "description": "Direct beachfront cottage where the Chapora river meets the sea. Watch Olive Ridley turtles nesting in season, dine with sea breeze, and sleep to rolling waves.",
        "price_per_night": 15500,
        "rating": 4.95,
        "review_count": 87,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Beachfront Access", "Sea View", "High-speed WiFi", "Air Conditioning", "Breakfast Included", "Pet Friendly"],
        "images": [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 29. Goa - Luxury Villas
    {
        "title": "Anjuna Hilltop Glass & Stone Villa",
        "category": "Luxury Villas",
        "city": "Goa",
        "location": "Anjuna, Goa",
        "description": "Perched on the Anjuna cliffs with panoramic sea horizons, infinity pool, cocktail deck, acoustic sound system, and secluded sun-drenched courtyards.",
        "price_per_night": 26500,
        "rating": 4.97,
        "review_count": 63,
        "guests": 8,
        "bedrooms": 4,
        "beds": 4,
        "bathrooms": 4,
        "amenities": ["Infinity Pool", "Cliff Views", "Cocktail Bar", "High-speed WiFi", "Air Conditioning", "Chef on Request"],
        "images": [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 30. Manali - Mountain Cabins
    {
        "title": "Rohtang Glacier Vista Alpine Chalet",
        "category": "Mountain Cabins",
        "city": "Manali",
        "location": "Gulaba, Manali",
        "description": "High altitude retreat at 9,000 ft with pristine snow peaks right outside your bedroom window. Radiator heating, pine logs, and herbal mountain teas.",
        "price_per_night": 13900,
        "rating": 4.98,
        "review_count": 55,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "amenities": ["Snow Peak View", "Indoor Fireplace", "Heated Bedrooms", "High-speed WiFi", "Chef on Request", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 31. Dehradun - Mountain Cabins
    {
        "title": "Kimadi Cloud Pine Log Chalet",
        "category": "Mountain Cabins",
        "city": "Dehradun",
        "location": "Kimadi Hills, Dehradun",
        "description": "Perched on the scenic Kimadi pass overlooking forested valleys often blanketed in magical mist and clouds. Starlit skies and rustic warmth.",
        "price_per_night": 9400,
        "rating": 4.93,
        "review_count": 68,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Valley View", "Fireplace", "High-speed WiFi", "Balcony", "Bonfire Pit", "Kitchen"],
        "images": [
            "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 32. Jaipur - Heritage Havens
    {
        "title": "Kanti Niwas Royal Courtyard Manor",
        "category": "Heritage Havens",
        "city": "Jaipur",
        "location": "Bani Park, Jaipur",
        "description": "100-year-old aristocratic haveli featuring carved red sandstone pillars, ornate royal chandeliers, antique canopy beds, and peaceful internal courtyard.",
        "price_per_night": 15800,
        "rating": 4.95,
        "review_count": 88,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "amenities": ["Sandstone Courtyard", "Heritage Decor", "Air Conditioning", "High-speed WiFi", "Breakfast Included", "Library"],
        "images": [
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 33. Jaipur - City Penthouses
    {
        "title": "Aravalli Horizon Sunset Penthouse",
        "category": "City Penthouses",
        "city": "Jaipur",
        "location": "Civil Lines, Jaipur",
        "description": "Chic contemporary top-floor penthouse with unobstructed sunset panoramas over Nahargarh ridge. Open layout, plunge jacuzzi, and high-speed fibre internet.",
        "price_per_night": 11800,
        "rating": 4.91,
        "review_count": 59,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Rooftop Jacuzzi", "Sunset Views", "High-speed WiFi", "Air Conditioning", "Dedicated Workspace", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 34. Udaipur - Heritage Havens
    {
        "title": "Jagdish Chowk Heritage Suite & Terrace",
        "category": "Heritage Havens",
        "city": "Udaipur",
        "location": "Jagdish Chowk, Udaipur",
        "description": "In the vibrant heart of historic Udaipur, moments from City Palace. Beautiful stained glass windows, carved stone jaalis, and a private terrace overlooking Lake Pichola.",
        "price_per_night": 16900,
        "rating": 4.96,
        "review_count": 122,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Lake View Terrace", "Heritage Architecture", "Air Conditioning", "High-speed WiFi", "Breakfast Included"],
        "images": [
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 35. Rishikesh - Beachfront
    {
        "title": "White Sands Ganga River Beach Villa",
        "category": "Beachfront",
        "city": "Rishikesh",
        "location": "Marine Drive, Rishikesh",
        "description": "Unique river-beach villa with direct access to natural white sand riverbanks of the Ganga. Private sun loungers, outdoor bonfire, and pristine mountain waters.",
        "price_per_night": 14500,
        "rating": 4.94,
        "review_count": 81,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "amenities": ["River Beach Access", "Bonfire Pit", "High-speed WiFi", "Air Conditioning", "Breakfast Included", "Yoga Mats"],
        "images": [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 36. Mumbai - City Penthouses
    {
        "title": "Colaba Heritage Art Deco Penthouse",
        "category": "City Penthouses",
        "city": "Mumbai",
        "location": "Colaba, Mumbai",
        "description": "Iconic Art Deco penthouse building near the Gateway of India. 14-foot ceilings, polished Burma teak floors, sea-facing arched windows, and brass finishings.",
        "price_per_night": 18500,
        "rating": 4.96,
        "review_count": 110,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Art Deco Design", "Sea Breeze Windows", "High-speed WiFi", "Air Conditioning", "Dedicated Workspace", "Kitchen"],
        "images": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 37. Delhi - Nature Cottages
    {
        "title": "Aravalli Ridge Eco Bamboo Cottage",
        "category": "Nature Cottages",
        "city": "Delhi",
        "location": "Asola Bhatti Sanctuary Border, Delhi NCR",
        "description": "Tucked away near the Asola Bhatti wildlife sanctuary. Eco-friendly architectural cottage with organic gardens, butterfly pavilions, and absolute peace.",
        "price_per_night": 6200,
        "rating": 4.87,
        "review_count": 42,
        "guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "amenities": ["Sanctuary Views", "Organic Garden", "High-speed WiFi", "Air Conditioning", "Pet Friendly", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 38. Goa - Beachfront
    {
        "title": "Benaulim White Sands Beach Chalet",
        "category": "Beachfront",
        "city": "Goa",
        "location": "Benaulim, South Goa",
        "description": "A serene South Goa sanctuary steps from pristine white dunes. Private outdoor rain shower, hammock among casuarina pines, and direct beach trail.",
        "price_per_night": 13500,
        "rating": 4.92,
        "review_count": 79,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["Beachfront Access", "Outdoor Shower", "High-speed WiFi", "Air Conditioning", "Breakfast Included", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 39. Manali - Nature Cottages
    {
        "title": "Whispering Pines Forest Wood Cottage",
        "category": "Nature Cottages",
        "city": "Manali",
        "location": "Hadimba Forest, Manali",
        "description": "Nestled in dense cedar woodlands near Hadimba temple. Wood stove, cozy attic reading nook, floor-to-ceiling forest windows, and hot chocolate station.",
        "price_per_night": 7600,
        "rating": 4.94,
        "review_count": 86,
        "guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1,
        "amenities": ["Forest Glade View", "Wood Stove", "High-speed WiFi", "Kitchenette", "Balcony", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 40. Dehradun - Nature Cottages
    {
        "title": "Maldevta Riverstone Valley Cottage",
        "category": "Nature Cottages",
        "city": "Dehradun",
        "location": "Maldevta, Dehradun",
        "description": "Riverside retreat set beside the crystal clear Song River. River dipping spot, organic litchi orchard, open barbecue grill, and serene Himalayan air.",
        "price_per_night": 6900,
        "rating": 4.90,
        "review_count": 62,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["River Dipping Access", "Litchi Orchard", "High-speed WiFi", "Barbeque Grill", "Free Parking", "Bonfire Pit"],
        "images": [
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 41. Goa - Luxury Villas
    {
        "title": "Vagator Sunset Cliff Private Villa",
        "category": "Luxury Villas",
        "city": "Goa",
        "location": "Vagator, North Goa",
        "description": "Designer cliffside villa offering endless ocean panoramas, private infinity swimming pool, sunken living room, and bespoke tropical luxury.",
        "price_per_night": 27500,
        "rating": 4.98,
        "review_count": 72,
        "guests": 8,
        "bedrooms": 4,
        "beds": 4,
        "bathrooms": 4,
        "amenities": ["Infinity Pool", "Ocean Sunset View", "Chef on Request", "High-speed WiFi", "Air Conditioning", "Free Parking"],
        "images": [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    # 42. Mumbai - City Penthouses
    {
        "title": "Lower Parel Sky Suite Penthouse",
        "category": "City Penthouses",
        "city": "Mumbai",
        "location": "Lower Parel, Mumbai",
        "description": "Sleek metropolitan glass penthouse high above Mumbai's prime entertainment and culinary district. Modern home automation, heated jacuzzi, and city lights.",
        "price_per_night": 21000,
        "rating": 4.95,
        "review_count": 83,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "amenities": ["City Lights View", "Smart Home Automation", "Jacuzzi", "High-speed WiFi", "Air Conditioning", "Dedicated Workspace"],
        "images": [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
        ]
    }
]

SAMPLE_REVIEWS = [
    {
        "user_name": "Rohan Malhotra",
        "user_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        "rating": 5.0,
        "comment": "Absolutely extraordinary stay! The photos don't even do justice to how magnificent this place is in person. Spotless cleanliness, breathtaking views, and the host was exceptionally welcoming.",
        "date": "August 2026"
    },
    {
        "user_name": "Meera Krishnan",
        "user_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        "rating": 5.0,
        "comment": "One of the best Airbnb experiences we have ever had in India. The attention to detail, high-speed WiFi for remote work, and comfortable beds were top-notch.",
        "date": "July 2026"
    },
    {
        "user_name": "Aditya Verma",
        "user_avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
        "rating": 4.9,
        "comment": "Wonderful location, peaceful surroundings, and prompt support whenever we needed anything. Will definitely book again on StayNest!",
        "date": "June 2026"
    }
]

def seed_database(db: Session):
    # Check if demo users exist
    for u in DEMO_USERS:
        existing = db.query(models.User).filter(models.User.email == u["email"]).first()
        if not existing:
            new_user = models.User(
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
                avatar=u["avatar"],
                bio=u["bio"]
            )
            db.add(new_user)
    db.commit()

    host_user = db.query(models.User).filter(models.User.email == "host@staynest.com").first()

    # Check if properties exist
    count = db.query(models.Property).count()
    if count < len(PROPERTIES_DATA):
        # Seed properties
        for prop in PROPERTIES_DATA:
            existing_prop = db.query(models.Property).filter(models.Property.title == prop["title"]).first()
            if not existing_prop:
                new_prop = models.Property(
                    title=prop["title"],
                    category=prop["category"],
                    city=prop["city"],
                    location=prop["location"],
                    description=prop["description"],
                    price_per_night=prop["price_per_night"],
                    rating=prop["rating"],
                    review_count=prop["review_count"],
                    guests=prop["guests"],
                    bedrooms=prop["bedrooms"],
                    beds=prop["beds"],
                    bathrooms=prop["bathrooms"],
                    amenities=json.dumps(prop["amenities"]),
                    images=json.dumps(prop["images"]),
                    host_id=host_user.id if host_user else 1,
                    host_name=host_user.name if host_user else "Priya Sen",
                    host_avatar=host_user.avatar if host_user else "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
                    host_rating=4.96,
                    host_is_superhost=True
                )
                db.add(new_prop)
                db.flush()

                # Add sample reviews
                for rev in SAMPLE_REVIEWS:
                    new_rev = models.Review(
                        property_id=new_prop.id,
                        user_name=rev["user_name"],
                        user_avatar=rev["user_avatar"],
                        rating=rev["rating"],
                        comment=rev["comment"],
                        date=rev["date"]
                    )
                    db.add(new_rev)
        db.commit()
