from datetime import datetime, timedelta

from src.core.security import hash_password, verify_password, create_token, verify_token
from src.repositories.usuario import UsuarioRepository
from src.repositories.token import TokenRepository
from src.repositories.cliente_empresa import ClienteEmpresaRepository
from src.schemas.auth import LoginResponse
from src.repositories.cliente import ClienteRepository
from src.services.email import EmailService


class AuthService:
    def __init__(self):
        self.usuario_repo = UsuarioRepository()
        self.cliente_repo = ClienteRepository()
        self.cliente_empresa_repo = ClienteEmpresaRepository()
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
        cliente = await self.cliente_repo.create({
            "id_usuario": usuario["id_usuario"],
            "nombre": data["nombre"],
            "apellido": data["apellido"],
            "telefono": data["telefono"],
            "email": data["email"],
        })
        ruc = data.get("ruc")
        razon_social = data.get("razon_social")
        if ruc and razon_social:
            await self.cliente_empresa_repo.create({
                "id_cliente": cliente["id_cliente"],
                "ruc": ruc,
                "razon_social": razon_social,
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
        from uuid import uuid4
        reset_token = str(uuid4())
        exp = datetime.utcnow() + timedelta(hours=1)
        await self.token_repo.create(usuario["id_usuario"], reset_token, "recuperacion", exp)
        email_service = EmailService()
        await email_service.enviar_recuperacion(email, reset_token, usuario["nombre"])

    async def restablecer_password(self, token: str, nueva_password: str):
        token_row = await self.token_repo.get_valid_token(token)
        if not token_row:
            raise ValueError("Token inválido o expirado")
        hashed = hash_password(nueva_password)
        await self.usuario_repo.update_password(token_row["id_usuario"], hashed)
        await self.token_repo.mark_used(token_row["id_token"])

    async def cambiar_password(self, id_usuario: str, password_actual: str, password_nueva: str):
        usuario = await self.usuario_repo.get_by_id(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado")
        if not verify_password(password_actual, usuario["contrasena"]):
            raise ValueError("Contraseña actual incorrecta")
        hashed = hash_password(password_nueva)
        await self.usuario_repo.update_password(id_usuario, hashed)
