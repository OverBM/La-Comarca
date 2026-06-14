from sqlalchemy import text

from src.core.database import get_connection
from src.core.id_generator import generate_id


class CategoriaRepository:
    async def get_all(self):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM categorias ORDER BY nombre"))
            return result.mappings().all()

    async def get_by_id(self, id_categoria: str):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT * FROM categorias WHERE id_categoria = :id"), {"id": id_categoria})
            return result.mappings().one_or_none()

    async def create(self, nombre: str):
        async with get_connection() as conn:
            id_categoria = await generate_id(conn, "categorias", "id_categoria", "CAT")
            result = await conn.execute(text("INSERT INTO categorias (id_categoria, nombre) VALUES (:id, :nombre) RETURNING *"), {"id": id_categoria, "nombre": nombre})
            await conn.commit()
            return result.mappings().one()

    async def update(self, id_categoria: str, nombre: str):
        async with get_connection() as conn:
            result = await conn.execute(text("UPDATE categorias SET nombre = :nombre WHERE id_categoria = :id RETURNING *"), {"id": id_categoria, "nombre": nombre})
            await conn.commit()
            return result.mappings().one_or_none()

    async def delete(self, id_categoria: str):
        async with get_connection() as conn:
            await conn.execute(text("DELETE FROM categorias WHERE id_categoria = :id"), {"id": id_categoria})
            await conn.commit()
