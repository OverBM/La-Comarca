from sqlalchemy import text

from src.core.database import get_connection


class ClienteEmpresaRepository:
    async def get_by_cliente_id(self, id_cliente: str):
        async with get_connection() as conn:
            result = await conn.execute(
                text("SELECT * FROM clientes_empresa WHERE id_cliente = :id"),
                {"id": id_cliente},
            )
            return result.mappings().one_or_none()

    async def create(self, data: dict):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT generate_id_empresa() AS id"))
            id_empresa = result.mappings().one()["id"]
            result = await conn.execute(
                text("INSERT INTO clientes_empresa (id_empresa, id_cliente, ruc, razon_social) VALUES (:id, :id_cliente, :ruc, :razon_social) RETURNING *"),
                {"id": id_empresa, **data},
            )
            await conn.commit()
            return result.mappings().one()

    async def update(self, id_cliente: str, data: dict):
        sets = ", ".join(f"{k} = :{k}" for k in data)
        data["id_cliente"] = id_cliente
        async with get_connection() as conn:
            result = await conn.execute(
                text(f"UPDATE clientes_empresa SET {sets} WHERE id_cliente = :id_cliente RETURNING *"),
                data,
            )
            await conn.commit()
            return result.mappings().one_or_none()
