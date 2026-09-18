import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_ALGORITHM = 'HS256'


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def create_access_token(data: dict) -> str:
    secret_key = os.getenv('JWT_SECRET_KEY')
    if not secret_key:
        raise RuntimeError('JWT_SECRET_KEY environment variable is required to create access tokens.')

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode['exp'] = expire

    return jwt.encode(to_encode, secret_key, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    secret_key = os.getenv('JWT_SECRET_KEY')
    if not secret_key:
        raise RuntimeError('JWT_SECRET_KEY environment variable is required to decode access tokens.')

    return jwt.decode(token, secret_key, algorithms=[JWT_ALGORITHM])
