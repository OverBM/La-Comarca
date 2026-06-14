from datetime import datetime, timezone

from sqlalchemy import text

from src.core.database import get_connection
from src.core.id_generator import generate_id


class TokenRepository:
    async def create(self, id_usuario: str, token: str, tipo: str, expiracion: datetime):
        async with get_connection() as conn:
            id_token = await generate_id(conn, "tokens_recuperacion", "id_token", "TOK")
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
                {"tok": token, "now": datetime.now(timezone.utc)},
            )
            return result.mappings().one_or_none()

    async def mark_used(self, id_token: str):
        async with get_connection() as conn:
            await conn.execute(text("UPDATE tokens_recuperacion SET usado = true WHERE id_token = :id"), {"id": id_token})
            await conn.commit()
