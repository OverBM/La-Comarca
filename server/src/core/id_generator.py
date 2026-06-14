from sqlalchemy import text

async def generate_id(conn, table: str, pk_column: str, prefix: str) -> str:
    result = await conn.execute(
        text(f"SELECT MAX({pk_column}) AS max_id FROM {table}")
    )
    row = result.mappings().one()
    max_id = row["max_id"]
    if max_id:
        num = int(max_id[len(prefix):]) + 1
    else:
        num = 1
    return f"{prefix}{num:03d}"
