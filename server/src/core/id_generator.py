from sqlalchemy import text


async def generate_id(conn, table: str, pk_column: str, prefix: str) -> str:
    for _ in range(5):
        result = await conn.execute(
            text(f"SELECT MAX({pk_column}) AS max_id FROM {table}")
        )
        row = result.mappings().one()
        max_id = row["max_id"]
        if max_id:
            num = int(max_id[len(prefix):]) + 1
        else:
            num = 1
        new_id = f"{prefix}{num:03d}"
        check = await conn.execute(
            text(f"SELECT 1 FROM {table} WHERE {pk_column} = :id"),
            {"id": new_id},
        )
        if not check.mappings().one_or_none():
            return new_id
    raise ValueError(f"No se pudo generar ID único para {table}")
