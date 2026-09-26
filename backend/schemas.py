from typing import List, Optional
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "guest"
    avatar: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    rating: float
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    id: int
    property_id: int
    user_name: str
    user_avatar: Optional[str] = None
    date: str

    class Config:
        from_attributes = True

class PropertyBase(BaseModel):
    title: str
    category: str
    city: str
    location: str
    description: str
    price_per_night: float
    guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    amenities: List[str]
    images: List[str]
    host_name: Optional[str] = "StayNest Host"
    host_avatar: Optional[str] = None
    host_rating: Optional[float] = 4.95
    host_is_superhost: Optional[bool] = True

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    price_per_night: Optional[float] = None
    guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[int] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None

class PropertyOut(PropertyBase):
    id: int
    rating: float
    review_count: int
    host_id: Optional[int] = None
    is_favorite: Optional[bool] = False
    reviews: Optional[List[ReviewOut]] = []

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    property_id: int
    check_in: str
    check_out: str
    guests: int

class BookingOut(BaseModel):
    id: int
    user_id: int
    property_id: int
    check_in: str
    check_out: str
    nights: int
    guests: int
    nightly_price: float
    cleaning_fee: float
    service_fee: float
    taxes: float
    total_price: float
    status: str
    created_at: Optional[str] = None
    property: Optional[PropertyOut] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True

class FavoriteOut(BaseModel):
    id: int
    user_id: int
    property_id: int
    property: Optional[PropertyOut] = None

    class Config:
        from_attributes = True

class HostStatsOut(BaseModel):
    total_listings: int
    total_bookings: int
    total_earnings: float
    average_rating: float

class AdminStatsOut(BaseModel):
    total_users: int
    total_properties: int
    total_bookings: int
    total_revenue: float
    active_cities: int
    category_distribution: dict

# Resolve circular references
Token.model_rebuild()
