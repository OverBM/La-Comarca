from sqlalchemy import text

from src.core.database import get_connection


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

    async def create(self, id_producto: str, stock_actual: int = 0, stock_minimo: int = 0):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT generate_id_inventario() AS id"))
            id_inventario = result.mappings().one()["id"]
            result = await conn.execute(
                text("INSERT INTO inventario (id_inventario, id_producto, stock_actual, stock_minimo) VALUES (:id, :id_producto, :stock, :minimo) RETURNING *"),
                {"id": id_inventario, "id_producto": id_producto, "stock": stock_actual, "minimo": stock_minimo},
            )
            await conn.commit()
            return result.mappings().one()

    async def actualizar_stock(self, id_producto: str, cantidad: int, tipo: str, motivo: str, id_usuario: str):
        async with get_connection() as conn:
            result = await conn.execute(
                text("SELECT * FROM actualizar_stock(:id_producto, :cantidad, :tipo, :motivo, :id_usuario)"),
                {"id_producto": id_producto, "cantidad": cantidad, "tipo": tipo, "motivo": motivo, "id_usuario": id_usuario},
            )
            await conn.commit()
            return result.mappings().one_or_none()

    async def get_movimientos(self, id_producto: str | None = None, limit: int = 50):
        async with get_connection() as conn:
            if id_producto:
                result = await conn.execute(text("SELECT * FROM movimientos_inventario WHERE id_producto = :id ORDER BY fecha DESC LIMIT :lim"), {"id": id_producto, "lim": limit})
            else:
                result = await conn.execute(text("SELECT * FROM movimientos_inventario ORDER BY fecha DESC LIMIT :lim"), {"lim": limit})
            return result.mappings().all()
