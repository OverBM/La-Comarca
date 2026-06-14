from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from src.core.database import get_connection
from src.core.id_generator import generate_id


class ClienteRepository:
    async def get_by_id(self, id_cliente: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM clientes WHERE id_cliente = :id"), {"id": id_cliente})
            return result.mappings().one_or_none()

    async def get_by_usuario_id(self, id_usuario: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM clientes WHERE id_usuario = :id"), {"id": id_usuario})
            return result.mappings().one_or_none()

    async def get_by_telefono(self, telefono: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM clientes WHERE telefono = :tel"), {"tel": telefono})
            return result.mappings().one_or_none()

    async def get_all(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM clientes ORDER BY nombre"))
            return result.mappings().all()

    async def create(self, data: dict):
        for intento in range(3):
            async with get_connection() as conn:
                id_cliente = await generate_id(conn, "clientes", "id_cliente", "CLI")
                try:
                    result = await conn.execute(
                        text("INSERT INTO clientes (id_cliente, id_usuario, nombre, apellido, telefono, email) VALUES (:id, :id_usuario, :nombre, :apellido, :telefono, :email) RETURNING *"),
                        {"id": id_cliente, **data},
                    )
                except IntegrityError:
                    continue
                await conn.commit()
                return result.mappings().one()
        raise ValueError("Error al crear cliente — intente nuevamente")

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
