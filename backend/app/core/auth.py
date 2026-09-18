from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import jwt

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={'message': 'Could not validate credentials.'},
        headers={'WWW-Authenticate': 'Bearer'},
    )

    try:
        payload = decode_access_token(token)
    except jwt.PyJWTError:
        raise unauthorized_error

    user_id = payload.get('sub')
    if user_id is None:
        raise unauthorized_error

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise unauthorized_error

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise unauthorized_error

    if not user.is_active:
        raise unauthorized_error

    return user
