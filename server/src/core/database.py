from contextlib import asynccontextmanager

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncConnection, AsyncEngine

from src.core.config import DATABASE_URL

engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False)


@asynccontextmanager
async def get_connection():
    async with engine.connect() as conn:
        yield conn


async def verify_connection() -> bool:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Error de conexión a la base de datos: {e}")
        return False
