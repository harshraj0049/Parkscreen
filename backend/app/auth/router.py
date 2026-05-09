from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.schemas import RegisterRequest, LoginRequest, UserResponse
from app.auth.service import get_user_by_email, create_user, authenticate_user
from app.auth.jwt import create_access_token
from app.auth.dependencies import get_current_user
from app.database.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    user = create_user(db, data)
    return user

@router.post("/login")
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,        # JS cannot read this cookie
        samesite="lax",       # CSRF protection
        secure=False          # Set True in production (HTTPS only)
    )
    return {"message": "Login successful", "access_token": token}

@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}