from fastapi import APIRouter, HTTPException, Depends

from src.schemas.auth import LoginRequest, LoginResponse, TokenRefreshRequest, TokenRefreshResponse, PasswordRecoveryRequest, PasswordResetRequest, CambiarPasswordRequest, RegisterRequest
from src.services.auth import AuthService
from src.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    service = AuthService()
    try:
        return await service.login(body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register", response_model=LoginResponse, status_code=201)
async def register(body: RegisterRequest):
    service = AuthService()
    try:
        return await service.register(body.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh(body: TokenRefreshRequest):
    service = AuthService()
    try:
        token = await service.refrescar_token(body.token)
        return TokenRefreshResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/recuperar")
async def recuperar(body: PasswordRecoveryRequest):
    service = AuthService()
    await service.solicitar_recuperacion(body.email)
    return {"mensaje": "Si el email existe, recibirás instrucciones"}


@router.post("/reset-password")
async def reset_password(body: PasswordResetRequest):
    service = AuthService()
    try:
        await service.restablecer_password(body.token, body.nueva_password)
        return {"mensaje": "Contraseña actualizada correctamente"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cambiar-password")
async def cambiar_password(body: CambiarPasswordRequest, usuario: dict = Depends(get_current_user)):
    service = AuthService()
    try:
        await service.cambiar_password(usuario["sub"], body.password_actual, body.password_nueva)
        return {"mensaje": "Contraseña actualizada correctamente"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
