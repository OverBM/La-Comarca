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
        inventario = await self.repo.get_by_producto(data["id_producto"])
        if not inventario:
            raise ValueError("Producto no encontrado en inventario")
        if data["tipo"] == "salida":
            nuevo_stock = inventario["stock_actual"] - data["cantidad"]
        elif data["tipo"] == "entrada":
            nuevo_stock = inventario["stock_actual"] + data["cantidad"]
        else:
            nuevo_stock = data["cantidad"]
        await self.repo.update_stock(inventario["id_inventario"], nuevo_stock)
        return await self.repo.create_movimiento(data)

    async def movimientos(self, id_producto: str | None = None, limit: int = 50):
        return await self.repo.get_movimientos(id_producto, limit)
