from sqlalchemy import text

from src.core.database import get_connection
from src.core.id_generator import generate_id


class DireccionRepository:
    async def get_by_cliente(self, id_cliente: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM direcciones WHERE id_cliente = :id"), {"id": id_cliente})
            return result.mappings().all()

    async def create(self, data: dict):
        async with get_connection() as conn:
            id_direccion = await generate_id(conn, "direcciones", "id_direccion", "DIR")
            result = await conn.execute(
                text("INSERT INTO direcciones (id_direccion, id_cliente, calle, ciudad, referencia) VALUES (:id, :id_cliente, :calle, :ciudad, :referencia) RETURNING *"),
                {"id": id_direccion, "id_cliente": data["id_cliente"], "calle": data["calle"], "ciudad": data["ciudad"], "referencia": data.get("referencia")},
            )
            await conn.commit()
            return result.mappings().one()

    async def delete(self, id_direccion: str):
        async with get_connection() as conn:
            await conn.execute(text("DELETE FROM direcciones WHERE id_direccion = :id"), {"id": id_direccion})
            await conn.commit()
