from sqlalchemy import text

from src.core.database import get_connection
from src.core.id_generator import generate_id


class PedidoRepository:
    async def create(self, id_cliente: str, items: list[dict], metodo_pago: str = "efectivo"):
        async with get_connection() as conn:
            id_pedido = await generate_id(conn, "pedidos", "id_pedido", "PED")
            result = await conn.execute(
                text("INSERT INTO pedidos (id_pedido, id_cliente, metodo_pago) VALUES (:id, :cliente, :metodo_pago) RETURNING *"),
                {"id": id_pedido, "cliente": id_cliente, "metodo_pago": metodo_pago},
            )
            pedido = result.mappings().one()
            detalle = []
            for item in items:
                id_detalle = await generate_id(conn, "detalle_pedido", "id_detalle", "DET")
                await conn.execute(
                    text("INSERT INTO detalle_pedido (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (:id, :pedido, :producto, :cantidad, :precio, :subtotal)"),
                    {"id": id_detalle, "pedido": id_pedido, "producto": item["id_producto"], "cantidad": item["cantidad"], "precio": item["precio_unitario"], "subtotal": item["subtotal"]},
                )
                detalle.append({**item, "id_detalle": id_detalle})
            await conn.commit()
            return pedido, detalle

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

    async def update_estado_pago(self, id_pedido: str, estado: str):
        async with get_connection() as conn:
            result = await conn.execute(
                text("UPDATE pedidos SET estado_pago = :estado WHERE id_pedido = :id RETURNING *"),
                {"id": id_pedido, "estado": estado},
            )
            await conn.commit()
            return result.mappings().one_or_none()

    async def sales_today(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT COALESCE(SUM(dp.subtotal), 0) AS total FROM detalle_pedido dp JOIN pedidos p ON p.id_pedido = dp.id_pedido WHERE p.fecha_pedido::date = CURRENT_DATE"))
            row = result.mappings().one()
            return float(row["total"])
