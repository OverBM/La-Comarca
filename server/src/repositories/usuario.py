from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from src.core.database import get_connection
from src.core.id_generator import generate_id


class UsuarioRepository:
    async def get_by_id(self, id_usuario: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM usuarios WHERE id_usuario = :id"), {"id": id_usuario})
            return result.mappings().one_or_none()

    async def get_by_email(self, email: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM usuarios WHERE email = :email"), {"email": email})
            return result.mappings().one_or_none()

    async def create(self, data: dict):
        for intento in range(3):
            async with get_connection() as conn:
                id_usuario = await generate_id(conn, "usuarios", "id_usuario", "USU")
                try:
                    result = await conn.execute(
                        text("INSERT INTO usuarios (id_usuario, nombre, apellido, email, contrasena, telefono, rol, activo) VALUES (:id, :nombre, :apellido, :email, :password, :telefono, 'cliente', true) RETURNING *"),
                        {"id": id_usuario, **data},
                    )
                except IntegrityError:
                    continue
                await conn.commit()
                return result.mappings().one()
        raise ValueError("Error al crear usuario — intente nuevamente")

    async def get_all(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT id_usuario, nombre, apellido, email, telefono, rol, activo, fecha_registro FROM usuarios ORDER BY nombre"))
            return result.mappings().all()

    async def update_rol(self, id_usuario: str, rol: str):
        async with get_connection() as conn:
            result = await conn.execute(
                text("UPDATE usuarios SET rol = :rol WHERE id_usuario = :id RETURNING id_usuario, nombre, apellido, email, telefono, rol, activo, fecha_registro"),
                {"id": id_usuario, "rol": rol},
            )
            await conn.commit()
            return result.mappings().one_or_none()

    async def deactivate(self, id_usuario: str):
        async with get_connection() as conn:
            result = await conn.execute(
                text("UPDATE usuarios SET activo = false WHERE id_usuario = :id RETURNING id_usuario, nombre, apellido, email, telefono, rol, activo, fecha_registro"),
                {"id": id_usuario},
            )
            await conn.commit()
            return result.mappings().one_or_none()

    async def update_profile(self, id_usuario: str, data: dict):
        campos = {k: v for k, v in data.items() if k in ("nombre", "apellido", "email", "telefono") and v is not None}
        if not campos:
            return None
        campos["id"] = id_usuario
        sets = ", ".join(f"{k} = :{k}" for k in campos if k != "id")
        async with get_connection() as conn:
            result = await conn.execute(
                text(f"UPDATE usuarios SET {sets} WHERE id_usuario = :id RETURNING *"),
                campos,
            )
            await conn.commit()
            return result.mappings().one_or_none()

    async def update_password(self, id_usuario: str, nueva_password: str):
        async with get_connection() as conn:
            result = await conn.execute(
                text("UPDATE usuarios SET contrasena = :pw WHERE id_usuario = :id RETURNING id_usuario"),
                {"pw": nueva_password, "id": id_usuario},
            )
            await conn.commit()
            return result.mappings().one_or_none()
