from sqlalchemy import text

from src.core.database import get_connection
from src.core.id_generator import generate_id


class ComprobanteRepository:
    async def create(self, data: dict):
        async with get_connection() as conn:
            id_comprobante = await generate_id(conn, "comprobantes", "id_comprobante", "COM")
            result = await conn.execute(
                text("INSERT INTO comprobantes (id_comprobante, id_pedido, id_empresa, id_tipo, serie, correlativo, total) VALUES (:id, :id_pedido, :id_empresa, :id_tipo, :serie, :correlativo, :total) RETURNING *"),
                {"id": id_comprobante, **data},
            )
            await conn.commit()
            return result.mappings().one()

    async def get_by_id(self, id_comprobante: str):
        async with get_connection() as conn:
            result = await conn.execute(text("""
                SELECT c.id_comprobante, tc.nombre AS tipo, c.serie, c.correlativo,
                       c.fecha_emision AS fecha,
                       CONCAT(cl.nombre, ' ', cl.apellido) AS cliente,
                       ce.ruc, ce.razon_social, c.total
                FROM comprobantes c
                JOIN tipos_comprobante tc ON tc.id_tipo = c.id_tipo
                JOIN pedidos p ON p.id_pedido = c.id_pedido
                JOIN clientes cl ON cl.id_cliente = p.id_cliente
                LEFT JOIN clientes_empresa ce ON ce.id_cliente = cl.id_cliente
                WHERE c.id_comprobante = :id
            """), {"id": id_comprobante})
            return result.mappings().one_or_none()

    async def get_all(self, id_tipo: str | None = None):
        async with get_connection() as conn:
            sql = """
                SELECT c.id_comprobante, tc.nombre AS tipo, c.serie, c.correlativo,
                       c.fecha_emision AS fecha,
                       CONCAT(cl.nombre, ' ', cl.apellido) AS cliente,
                       ce.ruc, ce.razon_social, c.total
                FROM comprobantes c
                JOIN tipos_comprobante tc ON tc.id_tipo = c.id_tipo
                JOIN pedidos p ON p.id_pedido = c.id_pedido
                JOIN clientes cl ON cl.id_cliente = p.id_cliente
                LEFT JOIN clientes_empresa ce ON ce.id_cliente = cl.id_cliente
            """
            if id_tipo:
                result = await conn.execute(text(f"{sql} WHERE tc.id_tipo = :tipo ORDER BY c.fecha_emision DESC"), {"tipo": id_tipo})
            else:
                result = await conn.execute(text(f"{sql} ORDER BY c.fecha_emision DESC"))
            return result.mappings().all()

    async def get_tipos(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM tipos_comprobantes ORDER BY nombre"))
            return result.mappings().all()

    async def get_next_correlativo(self, id_tipo: str):
        async with get_connection() as conn:
            tipo = await conn.execute(text("SELECT * FROM tipos_comprobantes WHERE id_tipo = :id"), {"id": id_tipo})
            tipo_row = tipo.mappings().one_or_none()
            if not tipo_row:
                return None, None
            serie_base = tipo_row["serie_base"]
            last = await conn.execute(
                text("SELECT correlativo FROM comprobantes WHERE serie LIKE :serie ORDER BY correlativo DESC LIMIT 1"),
                {"serie": f"{serie_base}%"},
            )
            last_row = last.mappings().one_or_none()
            next_num = 1
            if last_row:
                next_num = int(last_row["correlativo"]) + 1
            correlativo = str(next_num).zfill(8)
            serie = serie_base
            return serie, correlativo
