from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    id_usuario: str
    email: str
    rol: str
    nombre: str
    apellido: str
    telefono: str


class TokenRefreshRequest(BaseModel):
    token: str


class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordRecoveryRequest(BaseModel):
    email: str


class PasswordResetRequest(BaseModel):
    token: str
    nueva_password: str


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    email: str
    telefono: str
    password: str


class CambiarPasswordRequest(BaseModel):
    password_actual: str
    password_nueva: str
