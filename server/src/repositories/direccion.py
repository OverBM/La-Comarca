from sqlalchemy import text

from src.core.database import get_connection


class DireccionRepository:
    async def get_by_cliente(self, id_cliente: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM direcciones WHERE id_cliente = :id"), {"id": id_cliente})
            return result.mappings().all()

    async def create(self, data: dict):
        async with get_connection() as conn:
            result = await conn.execute(
                text("INSERT INTO direcciones (id_cliente, calle, ciudad) VALUES (:id_cliente, :calle, :ciudad) RETURNING *"),
                data,
            )
            await conn.commit()
            return result.mappings().one()

    async def update(self, id_direccion: str, data: dict):
        data["id"] = id_direccion
        sets = ", ".join(f"{k} = :{k}" for k in data if k != "id")
        async with get_connection() as conn:
            result = await conn.execute(
                text(f"UPDATE direcciones SET {sets} WHERE id_direccion = :id RETURNING *"),
                data,
            )
            await conn.commit()
            return result.mappings().one_or_none()

    async def delete(self, id_direccion: str):
        async with get_connection() as conn:
            await conn.execute(text("DELETE FROM direcciones WHERE id_direccion = :id"), {"id": id_direccion})
            await conn.commit()
