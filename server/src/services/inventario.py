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

    async def movimientos(self, id_producto: str | None = None, limit: int = 50):
        return await self.repo.get_movimientos(id_producto, limit)
