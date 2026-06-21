from datetime import datetime

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

    async def get_movimientos(self, id_producto: str | None = None, page: int = 1, limit: int = 10, desde: str | None = None, hasta: str | None = None):
        async with get_connection() as conn:
            offset = (page - 1) * limit
            where_parts = []
            params: dict = {"lim": limit, "off": offset}

            if id_producto:
                where_parts.append("id_producto = :id_producto")
                params["id_producto"] = id_producto
            if desde:
                where_parts.append("fecha::date >= :desde")
                params["desde"] = datetime.strptime(desde, "%Y-%m-%d").date()
            if hasta:
                where_parts.append("fecha::date <= :hasta")
                params["hasta"] = datetime.strptime(hasta, "%Y-%m-%d").date()

            where_sql = ""
            if where_parts:
                where_sql = "WHERE " + " AND ".join(where_parts)

            count_result = await conn.execute(
                text(f"SELECT COUNT(*) FROM movimientos_inventario {where_sql}"),
                {k: v for k, v in params.items() if k in ("id_producto", "desde", "hasta")},
            )
            total = count_result.scalar_one()

            result = await conn.execute(
                text(f"SELECT * FROM movimientos_inventario {where_sql} ORDER BY fecha DESC LIMIT :lim OFFSET :off"),
                params,
            )
            items = result.mappings().all()
            return items, total
