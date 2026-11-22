from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix='/api/auth', tags=['auth'])


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


@router.post('/login', response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    invalid_credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={'message': 'Incorrect email or password.'},
    )

    user = db.query(User).filter(User.email == form_data.username).first()

    print(f"Login attempt for: {form_data.username}")
    print(f"User found: {user is not None}")

    if not user:
        print("Login failed: user not found")
        raise invalid_credentials_error

    password_valid = verify_password(form_data.password, user.password_hash)
    print(f"Password valid: {password_valid}")

    if not password_valid:
        print("Login failed: incorrect password")
        raise invalid_credentials_error

    print(f"User active: {user.is_active}")

    if not user.is_active:
        print("Login failed: account inactive")
        raise invalid_credentials_error

    access_token = create_access_token({'sub': str(user.id)})

    return {'access_token': access_token, 'token_type': 'bearer'}
