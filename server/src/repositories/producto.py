from sqlalchemy import text

from src.core.database import get_connection
from src.core.id_generator import generate_id


class ProductoRepository:
    async def get_all(self, id_categoria: str | None = None):
        async with get_connection() as conn:
            sql = "SELECT p.*, i.stock_actual FROM productos p LEFT JOIN inventario i ON i.id_producto = p.id_producto"
            if id_categoria:
                result = await conn.execute(text(f"{sql} WHERE p.id_categoria = :cat ORDER BY p.nombre"), {"cat": id_categoria})
            else:
                result = await conn.execute(text(f"{sql} ORDER BY p.nombre"))
            return result.mappings().all()

    async def get_by_id(self, id_producto: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT p.*, i.stock_actual FROM productos p LEFT JOIN inventario i ON i.id_producto = p.id_producto WHERE p.id_producto = :id"), {"id": id_producto})
            return result.mappings().one_or_none()

    async def create(self, data: dict):
        async with get_connection() as conn:
            id_producto = await generate_id(conn, "productos", "id_producto", "PRO")
            result = await conn.execute(
                text("INSERT INTO productos (id_producto, id_categoria, nombre, precio_unitario, descripcion, imagen) VALUES (:id, :id_categoria, :nombre, :precio_unitario, :descripcion, :imagen) RETURNING *"),
                {"id": id_producto, **data},
            )
            await conn.commit()
            return result.mappings().one()

    async def update(self, id_producto: str, data: dict):
        data["id"] = id_producto
        sets = ", ".join(f"{k} = :{k}" for k in data if k != "id")
        async with get_connection() as conn:
            result = await conn.execute(
                text(f"UPDATE productos SET {sets} WHERE id_producto = :id RETURNING *"),
                data,
            )
            await conn.commit()
            return result.mappings().one_or_none()

    async def delete(self, id_producto: str):
        async with get_connection() as conn:
            await conn.execute(text("DELETE FROM productos WHERE id_producto = :id"), {"id": id_producto})
            await conn.commit()

    async def count_active(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT COUNT(*) AS cantidad FROM productos"))
            row = result.mappings().one()
            return row["cantidad"]
