from datetime import datetime, timedelta, timezone

from src.core.security import hash_password, verify_password, create_token, verify_token
from src.repositories.usuario import UsuarioRepository
from src.repositories.token import TokenRepository
from src.schemas.auth import LoginResponse
from src.repositories.cliente import ClienteRepository


class AuthService:
    def __init__(self):
        self.usuario_repo = UsuarioRepository()
        self.cliente_repo = ClienteRepository()
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

    async def register(self, data: dict) -> LoginResponse:
        existing = await self.usuario_repo.get_by_email(data["email"])
        if existing:
            raise ValueError("El email ya está registrado")
        hashed = hash_password(data["password"])
        usuario = await self.usuario_repo.create({
            "nombre": data["nombre"],
            "apellido": data["apellido"],
            "email": data["email"],
            "telefono": data["telefono"],
            "password": hashed,
        })
        await self.cliente_repo.create({
            "id_usuario": usuario["id_usuario"],
            "nombre": data["nombre"],
            "apellido": data["apellido"],
            "telefono": data["telefono"],
            "email": data["email"],
        })
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

    async def refrescar_token(self, token: str) -> str:
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

    async def solicitar_recuperacion(self, email: str):
        usuario = await self.usuario_repo.get_by_email(email)
        if not usuario:
            return
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

    async def restablecer_password(self, token: str, nueva_password: str):
        token_row = await self.token_repo.get_valid_token(token)
        if not token_row:
            raise ValueError("Token inválido o expirado")
        hashed = hash_password(nueva_password)
        async with __import__("src.core.database", fromlist=["get_connection"]).get_connection() as conn:
            from sqlalchemy import text
            await conn.execute(text("UPDATE usuarios SET contrasena = :pw WHERE id_usuario = :id"), {"pw": hashed, "id": token_row["id_usuario"]})
            await conn.commit()
        await self.token_repo.mark_used(token_row["id_token"])

    async def cambiar_password(self, id_usuario: str, password_actual: str, password_nueva: str):
        usuario = await self.usuario_repo.get_by_id(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado")
        if not verify_password(password_actual, usuario["contrasena"]):
            raise ValueError("Contraseña actual incorrecta")
        hashed = hash_password(password_nueva)
        await self.usuario_repo.update_password(id_usuario, hashed)
