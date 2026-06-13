from sqlalchemy import text

from src.core.database import get_connection


class UsuarioRepository:
    async def get_by_id(self, id_usuario: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM usuarios WHERE id_usuario = :id"), {"id": id_usuario})
            return result.mappings().one_or_none()

    async def get_by_email(self, email: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM usuarios WHERE email = :email"), {"email": email})
            return result.mappings().one_or_none()

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
