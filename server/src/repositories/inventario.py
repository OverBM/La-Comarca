from sqlalchemy import text

from src.core.database import get_connection
from src.core.id_generator import generate_id


class InventarioRepository:
    async def get_all(self, bajo: bool = False):
        async with get_connection() as conn:
            if bajo:
                result = await conn.execute(text("SELECT * FROM inventario WHERE stock_actual <= stock_minimo"))
            else:
                result = await conn.execute(text("SELECT * FROM inventario"))
            return result.mappings().all()

    async def get_by_producto(self, id_producto: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM inventario WHERE id_producto = :id"), {"id": id_producto})
            return result.mappings().one_or_none()

    async def update_stock(self, id_inventario: str, stock_actual: int):
        async with get_connection() as conn:
            await conn.execute(text("UPDATE inventario SET stock_actual = :stock, ultima_actualizacion = NOW() WHERE id_inventario = :id"), {"stock": stock_actual, "id": id_inventario})
            await conn.commit()

    async def create_movimiento(self, data: dict):
        async with get_connection() as conn:
            id_movimiento = await generate_id(conn, "movimientos_inventario", "id_movimiento", "MOV")
            result = await conn.execute(
                text("INSERT INTO movimientos_inventario (id_movimiento, id_producto, tipo, cantidad, motivo, id_usuario) VALUES (:id, :id_producto, :tipo, :cantidad, :motivo, :id_usuario) RETURNING *"),
                {"id": id_movimiento, **data},
            )
            await conn.commit()
            return result.mappings().one()

    async def get_movimientos(self, id_producto: str | None = None, limit: int = 50):
        async with get_connection() as conn:
            if id_producto:
                result = await conn.execute(text("SELECT * FROM movimientos_inventario WHERE id_producto = :id ORDER BY fecha DESC LIMIT :lim"), {"id": id_producto, "lim": limit})
            else:
                result = await conn.execute(text("SELECT * FROM movimientos_inventario ORDER BY fecha DESC LIMIT :lim"), {"lim": limit})
            return result.mappings().all()
