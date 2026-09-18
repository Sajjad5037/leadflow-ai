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

    if not user:
        raise invalid_credentials_error

    if not verify_password(form_data.password, user.password_hash):
        raise invalid_credentials_error

    if not user.is_active:
        raise invalid_credentials_error

    access_token = create_access_token({'sub': str(user.id)})

    return {'access_token': access_token, 'token_type': 'bearer'}
