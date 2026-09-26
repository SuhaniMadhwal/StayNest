# StayNest - Full-Stack Airbnb-Style Accommodation Booking Application

StayNest is a production-quality, full-stack vacation rental platform inspired by Airbnb, built from scratch for popular destinations across India (Goa, Dehradun, Jaipur, Manali, Udaipur, Rishikesh, Mumbai, and Delhi).

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons
- **Backend**: FastAPI + Python 3.11 + Pydantic v2 + SQLAlchemy
- **Database**: SQLite (`staynest.db`) with automatic seeding
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing
- **Ports**: Frontend runs on **3000**, Backend runs on **8000**

---

## Demo Credentials

StayNest provides one-click demo login buttons directly in the top banner and navigation modal, or you can log in manually:

| Persona | Email | Password | Role | Permissions |
|---|---|---|---|---|
| **Guest** | `guest@staynest.com` | `Guest123!` | `guest` | Browse stays, search, filter, book, favorite, review, view dashboard |
| **Host** | `host@staynest.com` | `Host123!` | `host` | All guest features + Host Portal (`/host`), add/edit listings, view reservations & earnings |
| **Admin** | `admin@staynest.com` | `Admin123!` | `admin` | Super Admin Console (`/admin`), view platform metrics, manage all users, stays & bookings |

---

## Project Structure

```text
StayNest/
├── backend/
│   ├── main.py              # FastAPI application, CORS, routers & endpoints
│   ├── models.py            # SQLAlchemy database models (User, Property, Booking, Favorite, Review)
│   ├── schemas.py           # Pydantic validation schemas
│   ├── auth.py              # JWT authentication & password hashing
│   ├── database.py          # SQLite engine and session configuration
│   ├── seed_data.py         # Seed 42+ properties, demo users, and reviews
│   ├── staynest.db          # SQLite database file
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx               # Root layout with AuthProvider & modals
│   │   │   ├── page.tsx                 # Home page: Search, Indian destinations, Categories, Stays grid
│   │   │   ├── properties/[id]/page.tsx # Property details, 5-image gallery, interactive booking card, reviews
│   │   │   ├── dashboard/page.tsx       # User dashboard: upcoming & past trips, favorites, profile
│   │   │   ├── host/page.tsx            # Host dashboard: listings management, earnings, add property modal
│   │   │   └── admin/page.tsx           # Admin dashboard: metrics, users list, bookings, properties list
│   │   ├── components/
│   │   │   ├── Navbar.tsx               # Airbnb-style header & user dropdown
│   │   │   ├── SearchBar.tsx            # Destination picker, date & guest selection
│   │   │   ├── CategoryBar.tsx          # 7 functional category filter chips
│   │   │   ├── PropertyCard.tsx         # Card with image carousel and heart favorite button
│   │   │   ├── AuthModal.tsx            # Sign in, register & 1-click demo logins
│   │   │   └── Footer.tsx               # Airbnb-style footer
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Authentication state and favorite sync
│   │   └── lib/
│   │       ├── api.ts                   # REST client for FastAPI endpoints
│   │       └── types.ts                 # TypeScript types
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── package.json
│   └── .env.example
├── test_staynest.py         # Automated test suite verifying all 12 modules
├── README.md
└── .gitignore
```

---

## Setup & Running Instructions

### 1. Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install fastapi uvicorn pydantic sqlalchemy pyjwt bcrypt python-multipart email-validator

# Start backend server on port 8000
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

The database `staynest.db` will automatically be created and seeded with 42+ properties across 8 Indian cities on first startup.
Backend interactive API documentation is available at: `http://127.0.0.1:8000/docs`

### 2. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server on port 3000
npm run start
# Or start development server:
# npm run dev
```

Visit the application at: **`http://localhost:3000`**

---

## Running Verification Tests

Run the automated verification test suite:

```bash
python test_staynest.py
```

This verifies:
1. Health check & status 200
2. Frontend home and subroutes
3. Guest, Host, and Admin authentication & demo logins
4. Invalid credentials rejection (401)
5. New user registration
6. 42+ seeded properties across Goa, Dehradun, Jaipur, Manali, Udaipur, Rishikesh, Mumbai, and Delhi
7. All 7 categories filtering with zero false negatives
8. Date validation, past date block, checkout after check-in, and double-booking prevention (409 Conflict)
9. Price calculation: Nightly * Nights + 5% Cleaning + 8% Service + 12% GST
10. Favorites toggle and user trips dashboard
11. Host portal listing creation and immediate visibility in search
12. Admin portal security guards (non-admin blocked with 403 Forbidden)
