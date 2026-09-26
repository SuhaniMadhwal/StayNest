import json
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from database import engine, Base, get_db
import models
import schemas
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
    get_current_host,
    get_current_admin
)
from seed_data import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StayNest API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()

def format_property_dict(prop: models.Property, current_user_id: Optional[int] = None, db: Optional[Session] = None):
    try:
        amenities = json.loads(prop.amenities) if isinstance(prop.amenities, str) else prop.amenities
    except Exception:
        amenities = []

    try:
        images = json.loads(prop.images) if isinstance(prop.images, str) else prop.images
    except Exception:
        images = []

    is_fav = False
    if current_user_id and db:
        fav = db.query(models.Favorite).filter(
            models.Favorite.user_id == current_user_id,
            models.Favorite.property_id == prop.id
        ).first()
        is_fav = fav is not None

    reviews_out = []
    if prop.reviews:
        for r in prop.reviews:
            reviews_out.append({
                "id": r.id,
                "property_id": r.property_id,
                "user_name": r.user_name,
                "user_avatar": r.user_avatar,
                "rating": r.rating,
                "comment": r.comment,
                "date": r.date
            })

    return {
        "id": prop.id,
        "title": prop.title,
        "category": prop.category,
        "city": prop.city,
        "location": prop.location,
        "description": prop.description,
        "price_per_night": prop.price_per_night,
        "rating": prop.rating,
        "review_count": prop.review_count,
        "guests": prop.guests,
        "bedrooms": prop.bedrooms,
        "beds": prop.beds,
        "bathrooms": prop.bathrooms,
        "amenities": amenities,
        "images": images,
        "host_id": prop.host_id,
        "host_name": prop.host_name,
        "host_avatar": prop.host_avatar,
        "host_rating": prop.host_rating,
        "host_is_superhost": prop.host_is_superhost,
        "is_favorite": is_fav,
        "reviews": reviews_out
    }

# ----------------- AUTHENTICATION ENDPOINTS -----------------

@app.post("/api/auth/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    new_user = models.User(
        name=user_in.name,
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        role=user_in.role or "guest",
        avatar=user_in.avatar or f"https://api.dicebear.com/7.x/initials/svg?seed={user_in.name}",
        bio=user_in.bio or "StayNest Traveler"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@app.post("/api/auth/login", response_model=schemas.Token)
def login(creds: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == creds.email.lower()).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.post("/api/auth/demo/{role}", response_model=schemas.Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    role = role.lower()
    email_map = {
        "guest": "guest@staynest.com",
        "host": "host@staynest.com",
        "admin": "admin@staynest.com"
    }
    if role not in email_map:
        raise HTTPException(status_code=400, detail="Invalid demo role. Choose guest, host, or admin.")

    email = email_map[role]
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found. Please restart server to seed data.")

    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/api/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# ----------------- PROPERTY ENDPOINTS -----------------

@app.get("/api/properties")
def get_properties(
    category: Optional[str] = None,
    city: Optional[str] = None,
    guests: Optional[int] = None,
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    query = db.query(models.Property)

    # Category filter
    if category and category.lower() != "all stays" and category.lower() != "all":
        query = query.filter(models.Property.category.ilike(category.strip()))

    # City filter
    if city and city.strip():
        query = query.filter(
            or_(
                models.Property.city.ilike(f"%{city.strip()}%"),
                models.Property.location.ilike(f"%{city.strip()}%"),
                models.Property.title.ilike(f"%{city.strip()}%")
            )
        )

    # Guest capacity filter
    if guests and guests > 0:
        query = query.filter(models.Property.guests >= guests)

    # Price range filter
    if min_price is not None:
        query = query.filter(models.Property.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(models.Property.price_per_night <= max_price)

    # Date availability filter: exclude properties that have overlapping confirmed bookings
    if check_in and check_out:
        # Check overlapping bookings
        conflicting_property_ids = db.query(models.Booking.property_id).filter(
            models.Booking.status == "confirmed",
            models.Booking.check_in < check_out,
            models.Booking.check_out > check_in
        ).distinct().all()
        conflict_ids = [cid[0] for cid in conflicting_property_ids]
        if conflict_ids:
            query = query.filter(~models.Property.id.in_(conflict_ids))

    props = query.order_by(desc(models.Property.rating), desc(models.Property.id)).all()

    current_user_id = current_user.id if current_user else None
    return [format_property_dict(p, current_user_id, db) for p in props]

@app.get("/api/properties/{property_id}")
def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    current_user_id = current_user.id if current_user else None
    return format_property_dict(prop, current_user_id, db)

@app.post("/api/properties")
def create_property(
    prop_in: schemas.PropertyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_host)
):
    new_prop = models.Property(
        title=prop_in.title,
        category=prop_in.category,
        city=prop_in.city,
        location=prop_in.location,
        description=prop_in.description,
        price_per_night=prop_in.price_per_night,
        rating=5.0,
        review_count=0,
        guests=prop_in.guests,
        bedrooms=prop_in.bedrooms,
        beds=prop_in.beds,
        bathrooms=prop_in.bathrooms,
        amenities=json.dumps(prop_in.amenities),
        images=json.dumps(prop_in.images),
        host_id=current_user.id,
        host_name=current_user.name,
        host_avatar=current_user.avatar,
        host_rating=4.95,
        host_is_superhost=True
    )
    db.add(new_prop)
    db.commit()
    db.refresh(new_prop)
    return format_property_dict(new_prop, current_user.id, db)

@app.put("/api/properties/{property_id}")
def update_property(
    property_id: int,
    prop_in: schemas.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_host)
):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if current_user.role != "admin" and prop.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this property")

    update_data = prop_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field == "amenities" and isinstance(val, list):
            setattr(prop, field, json.dumps(val))
        elif field == "images" and isinstance(val, list):
            setattr(prop, field, json.dumps(val))
        else:
            setattr(prop, field, val)

    db.commit()
    db.refresh(prop)
    return format_property_dict(prop, current_user.id, db)

@app.delete("/api/properties/{property_id}")
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_host)
):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if current_user.role != "admin" and prop.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this property")

    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}

# ----------------- REVIEWS ENDPOINT -----------------

@app.post("/api/properties/{property_id}/reviews")
def add_review(
    property_id: int,
    rev_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    new_rev = models.Review(
        property_id=property_id,
        user_name=current_user.name,
        user_avatar=current_user.avatar,
        rating=rev_in.rating,
        comment=rev_in.comment,
        date=datetime.datetime.now().strftime("%B %Y")
    )
    db.add(new_rev)
    
    # Update property rating
    all_ratings = [r.rating for r in prop.reviews] + [rev_in.rating]
    prop.rating = round(sum(all_ratings) / len(all_ratings), 2)
    prop.review_count = len(all_ratings)

    db.commit()
    db.refresh(new_rev)
    return new_rev

# ----------------- BOOKING ENDPOINTS -----------------

@app.post("/api/bookings")
def create_booking(
    booking_in: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prop = db.query(models.Property).filter(models.Property.id == booking_in.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    # Date parsing and validation
    try:
        check_in_date = datetime.date.fromisoformat(booking_in.check_in)
        check_out_date = datetime.date.fromisoformat(booking_in.check_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD")

    today = datetime.date.today()
    if check_in_date < today:
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")

    if check_out_date <= check_in_date:
        raise HTTPException(status_code=400, detail="Check-out date must be strictly after check-in date")

    # Guest capacity validation
    if booking_in.guests < 1:
        raise HTTPException(status_code=400, detail="Guest count must be at least 1")
    if booking_in.guests > prop.guests:
        raise HTTPException(status_code=400, detail=f"Maximum {prop.guests} guests allowed for this property")

    # Double-booking check
    conflict = db.query(models.Booking).filter(
        models.Booking.property_id == prop.id,
        models.Booking.status == "confirmed",
        models.Booking.check_in < booking_in.check_out,
        models.Booking.check_out > booking_in.check_in
    ).first()

    if conflict:
        raise HTTPException(
            status_code=409,
            detail=f"Property is unavailable between {conflict.check_in} and {conflict.check_out}. Please select different dates."
        )

    nights = (check_out_date - check_in_date).days
    nightly_total = prop.price_per_night * nights
    cleaning_fee = round(nightly_total * 0.05, 2)
    service_fee = round(nightly_total * 0.08, 2)
    taxes = round((nightly_total + cleaning_fee + service_fee) * 0.12, 2)  # 12% GST
    total_price = round(nightly_total + cleaning_fee + service_fee + taxes, 2)

    new_booking = models.Booking(
        user_id=current_user.id,
        property_id=prop.id,
        check_in=booking_in.check_in,
        check_out=booking_in.check_out,
        nights=nights,
        guests=booking_in.guests,
        nightly_price=prop.price_per_night,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        taxes=taxes,
        total_price=total_price,
        status="confirmed"
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {
        "id": new_booking.id,
        "user_id": new_booking.user_id,
        "property_id": new_booking.property_id,
        "check_in": new_booking.check_in,
        "check_out": new_booking.check_out,
        "nights": new_booking.nights,
        "guests": new_booking.guests,
        "nightly_price": new_booking.nightly_price,
        "cleaning_fee": new_booking.cleaning_fee,
        "service_fee": new_booking.service_fee,
        "taxes": new_booking.taxes,
        "total_price": new_booking.total_price,
        "status": new_booking.status,
        "created_at": new_booking.created_at.isoformat() if new_booking.created_at else None,
        "property": format_property_dict(prop, current_user.id, db)
    }

@app.get("/api/bookings/my")
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).order_by(desc(models.Booking.id)).all()

    result = []
    for b in bookings:
        prop = db.query(models.Property).filter(models.Property.id == b.property_id).first()
        result.append({
            "id": b.id,
            "user_id": b.user_id,
            "property_id": b.property_id,
            "check_in": b.check_in,
            "check_out": b.check_out,
            "nights": b.nights,
            "guests": b.guests,
            "nightly_price": b.nightly_price,
            "cleaning_fee": b.cleaning_fee,
            "service_fee": b.service_fee,
            "taxes": b.taxes,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "property": format_property_dict(prop, current_user.id, db) if prop else None
        })
    return result

@app.put("/api/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    booking.status = "cancelled"
    db.commit()
    return {"message": "Booking cancelled successfully", "status": "cancelled"}

# ----------------- FAVORITES ENDPOINTS -----------------

@app.post("/api/favorites/{property_id}")
def toggle_favorite(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.property_id == property_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"favorited": False, "property_id": property_id}
    else:
        fav = models.Favorite(user_id=current_user.id, property_id=property_id)
        db.add(fav)
        db.commit()
        return {"favorited": True, "property_id": property_id}

@app.delete("/api/favorites/{property_id}")
def remove_favorite(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.property_id == property_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
    return {"favorited": False, "property_id": property_id}

@app.get("/api/favorites/my")
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
    results = []
    for f in favs:
        prop = db.query(models.Property).filter(models.Property.id == f.property_id).first()
        if prop:
            results.append({
                "id": f.id,
                "user_id": f.user_id,
                "property_id": f.property_id,
                "property": format_property_dict(prop, current_user.id, db)
            })
    return results

# ----------------- HOST DASHBOARD ENDPOINTS -----------------

@app.get("/api/host/properties")
def get_host_properties(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_host)
):
    props = db.query(models.Property).filter(models.Property.host_id == current_user.id).order_by(desc(models.Property.id)).all()
    return [format_property_dict(p, current_user.id, db) for p in props]

@app.get("/api/host/bookings")
def get_host_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_host)
):
    host_props = db.query(models.Property.id).filter(models.Property.host_id == current_user.id).all()
    prop_ids = [p[0] for p in host_props]

    bookings = db.query(models.Booking).filter(
        models.Booking.property_id.in_(prop_ids)
    ).order_by(desc(models.Booking.id)).all()

    result = []
    for b in bookings:
        prop = db.query(models.Property).filter(models.Property.id == b.property_id).first()
        guest = db.query(models.User).filter(models.User.id == b.user_id).first()
        result.append({
            "id": b.id,
            "user_id": b.user_id,
            "property_id": b.property_id,
            "check_in": b.check_in,
            "check_out": b.check_out,
            "nights": b.nights,
            "guests": b.guests,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "property_title": prop.title if prop else "Unknown Property",
            "guest_name": guest.name if guest else "Guest",
            "guest_email": guest.email if guest else ""
        })
    return result

@app.get("/api/host/stats", response_model=schemas.HostStatsOut)
def get_host_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_host)
):
    props = db.query(models.Property).filter(models.Property.host_id == current_user.id).all()
    prop_ids = [p.id for p in props]

    bookings = db.query(models.Booking).filter(
        models.Booking.property_id.in_(prop_ids),
        models.Booking.status == "confirmed"
    ).all()

    total_earnings = sum(b.total_price for b in bookings)
    ratings = [p.rating for p in props if p.rating]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 5.0

    return {
        "total_listings": len(props),
        "total_bookings": len(bookings),
        "total_earnings": round(total_earnings, 2),
        "average_rating": avg_rating
    }

# ----------------- ADMIN DASHBOARD ENDPOINTS -----------------

@app.get("/api/admin/stats", response_model=schemas.AdminStatsOut)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    total_users = db.query(models.User).count()
    total_properties = db.query(models.Property).count()
    total_bookings = db.query(models.Booking).count()
    
    confirmed_bookings = db.query(models.Booking).filter(models.Booking.status == "confirmed").all()
    total_revenue = sum(b.total_price for b in confirmed_bookings)

    cities = db.query(models.Property.city).distinct().all()
    
    # Category counts
    props = db.query(models.Property).all()
    cat_counts = {}
    for p in props:
        cat_counts[p.category] = cat_counts.get(p.category, 0) + 1

    return {
        "total_users": total_users,
        "total_properties": total_properties,
        "total_bookings": total_bookings,
        "total_revenue": round(total_revenue, 2),
        "active_cities": len(cities),
        "category_distribution": cat_counts
    }

@app.get("/api/admin/users")
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    users = db.query(models.User).order_by(desc(models.User.id)).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "avatar": u.avatar,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "bookings_count": len(u.bookings),
            "properties_count": len(u.properties)
        }
        for u in users
    ]

@app.get("/api/admin/properties")
def get_admin_properties(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    props = db.query(models.Property).order_by(desc(models.Property.id)).all()
    return [format_property_dict(p, None, db) for p in props]

@app.get("/api/admin/bookings")
def get_admin_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    bookings = db.query(models.Booking).order_by(desc(models.Booking.id)).all()
    result = []
    for b in bookings:
        prop = db.query(models.Property).filter(models.Property.id == b.property_id).first()
        guest = db.query(models.User).filter(models.User.id == b.user_id).first()
        result.append({
            "id": b.id,
            "user_id": b.user_id,
            "property_id": b.property_id,
            "check_in": b.check_in,
            "check_out": b.check_out,
            "nights": b.nights,
            "guests": b.guests,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "property_title": prop.title if prop else "Unknown Property",
            "property_city": prop.city if prop else "",
            "guest_name": guest.name if guest else "Guest",
            "guest_email": guest.email if guest else ""
        })
    return result

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "StayNest", "timestamp": datetime.datetime.utcnow().isoformat()}
