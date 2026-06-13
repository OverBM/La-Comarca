from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from src.core.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_token(sub: str, email: str, rol: str, nombre: str, apellido: str, telefono: str) -> str:
    payload = {
        "sub": sub,
        "email": email,
        "rol": rol,
        "nombre": nombre,
        "apellido": apellido,
        "telefono": telefono,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
