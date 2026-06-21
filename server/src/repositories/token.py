from datetime import datetime

from sqlalchemy import text

from src.core.database import get_connection


class TokenRepository:
    async def create(self, id_usuario: str, token: str, tipo: str, expiracion: datetime):
        async with get_connection() as conn:
            result = await conn.execute(text("SELECT generate_id_token() AS id"))
            id_token = result.mappings().one()["id"]
            result = await conn.execute(
                text("INSERT INTO tokens_recuperacion (id_token, id_usuario, token, tipo, expiracion) VALUES (:id, :usr, :tok, :tipo, :exp) RETURNING *"),
                {"id": id_token, "usr": id_usuario, "tok": token, "tipo": tipo, "exp": expiracion},
            )
            await conn.commit()
            return result.mappings().one()

    async def get_valid_token(self, token: str):
        async with get_connection() as conn:
            result = await conn.execute(
                text("SELECT * FROM tokens_recuperacion WHERE token = :tok AND usado = false AND expiracion > :now"),
                {"tok": token, "now": datetime.utcnow()},
            )
            return result.mappings().one_or_none()

    async def mark_used(self, id_token: str):
        async with get_connection() as conn:
            await conn.execute(text("UPDATE tokens_recuperacion SET usado = true WHERE id_token = :id"), {"id": id_token})
            await conn.commit()
