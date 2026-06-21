from src.repositories.inventario import InventarioRepository


class InventarioService:
    def __init__(self):
        self.repo = InventarioRepository()

    async def listar(self, bajo: bool = False):
        return await self.repo.get_all(bajo)

    async def obtener(self, id_producto: str):
        result = await self.repo.get_by_producto(id_producto)
        if not result:
            raise ValueError("Producto no encontrado en inventario")
        return result

    async def registrar_movimiento(self, data: dict):
        if data["tipo"] == "salida":
            inventario = await self.repo.get_by_producto(data["id_producto"])
            if not inventario:
                raise ValueError("Producto no encontrado en inventario")
            if inventario["stock_actual"] < data["cantidad"]:
                raise ValueError(f"Stock insuficiente. Actual: {inventario['stock_actual']}, requerido: {data['cantidad']}")
        resultado = await self.repo.actualizar_stock(
            id_producto=data["id_producto"],
            cantidad=data["cantidad"],
            tipo=data["tipo"],
            motivo=data["motivo"],
            id_usuario=data["id_usuario"],
        )
        if not resultado:
            raise ValueError("Producto no encontrado en inventario")
        return resultado

    async def movimientos(self, id_producto: str | None = None, page: int = 1, limit: int = 10, desde: str | None = None, hasta: str | None = None):
        items, total = await self.repo.get_movimientos(id_producto, page, limit, desde, hasta)
        return {"items": items, "total": total, "page": page, "limit": limit}
