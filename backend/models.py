import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="guest")  # guest, host, admin
    avatar = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    properties = relationship("Property", back_populates="host_user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price_per_night = Column(Float, nullable=False)
    rating = Column(Float, default=4.9)
    review_count = Column(Integer, default=0)
    guests = Column(Integer, default=2)
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    bathrooms = Column(Integer, default=1)
    amenities = Column(Text, nullable=False)  # JSON-encoded array of strings
    images = Column(Text, nullable=False)     # JSON-encoded array of URLs
    
    host_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    host_name = Column(String(100), nullable=False, default="StayNest Host")
    host_avatar = Column(String(500), nullable=True)
    host_rating = Column(Float, default=4.95)
    host_is_superhost = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    host_user = relationship("User", back_populates="properties")
    bookings = relationship("Booking", back_populates="property", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="property", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    check_in = Column(String(20), nullable=False)   # YYYY-MM-DD
    check_out = Column(String(20), nullable=False)  # YYYY-MM-DD
    nights = Column(Integer, nullable=False)
    guests = Column(Integer, nullable=False)
    nightly_price = Column(Float, nullable=False)
    cleaning_fee = Column(Float, nullable=False)
    service_fee = Column(Float, nullable=False)
    taxes = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(30), default="confirmed")  # confirmed, cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    property = relationship("Property", back_populates="bookings")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorites")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    user_name = Column(String(100), nullable=False)
    user_avatar = Column(String(500), nullable=True)
    rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=False)
    date = Column(String(30), nullable=False)

    property = relationship("Property", back_populates="reviews")
