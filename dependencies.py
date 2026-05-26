"""FastAPI dependencies for authentication."""
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from backend.database.connection import get_db
from .config import auth_settings
from .schemas import TokenData
from .models import User, ApiKey
from .utils import verify_api_key

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, auth_settings.SECRET_KEY, algorithms=[auth_settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

def get_api_key_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Authenticate using API key (X-API-Key header)"""
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        return None
    
    # Basic prefix check for efficiency
    prefix = api_key[:8]
    
    potential_keys = db.query(ApiKey).filter(
        ApiKey.key_prefix == prefix,
        ApiKey.is_active == True
    ).all()
    
    for key_record in potential_keys:
        if verify_api_key(api_key, key_record.hashed_key):
            key_record.last_used_at = datetime.utcnow()
            db.commit()
            
            user = db.query(User).filter(User.id == key_record.user_id).first()
            if user and user.is_active:
                return user
    
    return None