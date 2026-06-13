from sqlalchemy import text

from src.core.database import get_connection


class PedidoRepository:
    async def create(self, id_cliente: str, items: list[dict]):
        async with get_connection() as conn:
            result = await conn.execute(
                text("INSERT INTO pedidos (id_cliente) VALUES (:cliente) RETURNING *"),
                {"cliente": id_cliente},
            )
            pedido = result.mappings().one()
            id_pedido = pedido["id_pedido"]
            for item in items:
                await conn.execute(
                    text("INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (:pedido, :producto, :cantidad, :precio, :subtotal)"),
                    {"pedido": id_pedido, "producto": item["id_producto"], "cantidad": item["cantidad"], "precio": item["precio_unitario"], "subtotal": item["subtotal"]},
                )
            await conn.commit()
            return pedido

    async def get_by_id(self, id_pedido: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM pedidos WHERE id_pedido = :id"), {"id": id_pedido})
            return result.mappings().one_or_none()

    async def get_detalle(self, id_pedido: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT dp.*, pr.nombre AS nombre_producto FROM detalle_pedido dp LEFT JOIN productos pr ON pr.id_producto = dp.id_producto WHERE dp.id_pedido = :id"), {"id": id_pedido})
            return result.mappings().all()

    async def get_by_cliente(self, id_cliente: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM pedidos WHERE id_cliente = :id ORDER BY fecha_pedido DESC"), {"id": id_cliente})
            return result.mappings().all()

    async def get_all(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM pedidos ORDER BY fecha_pedido DESC"))
            return result.mappings().all()

    async def count_today(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT COUNT(*) AS cantidad FROM pedidos WHERE fecha_pedido::date = CURRENT_DATE"))
            row = result.mappings().one()
            return row["cantidad"]

    async def sales_today(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT COALESCE(SUM(dp.subtotal), 0) AS total FROM detalle_pedido dp JOIN pedidos p ON p.id_pedido = dp.id_pedido WHERE p.fecha_pedido::date = CURRENT_DATE"))
            row = result.mappings().one()
            return float(row["total"])
