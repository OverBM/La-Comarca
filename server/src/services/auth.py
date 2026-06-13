from datetime import datetime, timedelta, timezone

from src.core.security import hash_password, verify_password, create_token, verify_token
from src.repositories.usuario import UsuarioRepository
from src.repositories.token import TokenRepository
from src.schemas.auth import LoginResponse


class AuthService:
    def __init__(self):
        self.usuario_repo = UsuarioRepository()
        self.token_repo = TokenRepository()

    async def login(self, email: str, password: str) -> LoginResponse:
        usuario = await self.usuario_repo.get_by_email(email)
        if not usuario:
            raise ValueError("Credenciales inválidas")
        if not usuario["activo"]:
            raise ValueError("Usuario inactivo")
        if not verify_password(password, usuario["contrasena"]):
            raise ValueError("Credenciales inválidas")
        token = create_token(
            sub=usuario["id_usuario"],
            email=usuario["email"],
            rol=usuario["rol"],
            nombre=usuario["nombre"],
            apellido=usuario["apellido"],
            telefono=usuario["telefono"] or "",
        )
        return LoginResponse(
            access_token=token,
            id_usuario=usuario["id_usuario"],
            email=usuario["email"],
            rol=usuario["rol"],
            nombre=usuario["nombre"],
            apellido=usuario["apellido"],
            telefono=usuario["telefono"] or "",
        )

    async def refresh_token(self, token: str) -> str:
        payload = verify_token(token)
        if not payload:
            raise ValueError("Token inválido")
        return create_token(
            sub=payload["sub"],
            email=payload["email"],
            rol=payload["rol"],
            nombre=payload["nombre"],
            apellido=payload["apellido"],
            telefono=payload.get("telefono", ""),
        )

    async def request_recovery(self, email: str):
        usuario = await self.usuario_repo.get_by_email(email)
        if not usuario:
            return
        from src.core.security import JWT_SECRET
        reset_token = create_token(
            sub=usuario["id_usuario"],
            email=usuario["email"],
            rol=usuario["rol"],
            nombre=usuario["nombre"],
            apellido=usuario["apellido"],
            telefono=usuario["telefono"] or "",
        )
        exp = datetime.now(timezone.utc) + timedelta(hours=1)
        await self.token_repo.create(usuario["id_usuario"], reset_token, "password_reset", exp)

    async def reset_password(self, token: str, nueva_password: str):
        token_row = await self.token_repo.get_valid_token(token)
        if not token_row:
            raise ValueError("Token inválido o expirado")
        hashed = hash_password(nueva_password)
        async with __import__("src.core.database", fromlist=["get_connection"]).get_connection() as conn:
            from sqlalchemy import text
            await conn.execute(text("UPDATE usuarios SET contrasena = :pw WHERE id_usuario = :id"), {"pw": hashed, "id": token_row["id_usuario"]})
            await conn.commit()
        await self.token_repo.mark_used(token_row["id_token"])
