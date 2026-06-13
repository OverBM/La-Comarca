from sqlalchemy import text

from src.core.database import get_connection


class ClienteRepository:
    async def get_by_id(self, id_cliente: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM clientes WHERE id_cliente = :id"), {"id": id_cliente})
            return result.mappings().one_or_none()

    async def get_by_usuario_id(self, id_usuario: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM clientes WHERE id_usuario = :id"), {"id": id_usuario})
            return result.mappings().one_or_none()

    async def get_all(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM clientes ORDER BY nombre"))
            return result.mappings().all()

    async def create(self, data: dict):
        async with get_connection() as conn:
            result = await conn.execute(
                text("INSERT INTO clientes (id_usuario, nombre, apellido, telefono, email) VALUES (:id_usuario, :nombre, :apellido, :telefono, :email) RETURNING *"),
                data,
            )
            await conn.commit()
            return result.mappings().one()

    async def update(self, id_cliente: str, data: dict):
        data["id"] = id_cliente
        sets = ", ".join(f"{k} = :{k}" for k in data if k != "id")
        async with get_connection() as conn:
            result = await conn.execute(
                text(f"UPDATE clientes SET {sets} WHERE id_cliente = :id RETURNING *"),
                data,
            )
            await conn.commit()
            return result.mappings().one_or_none()
