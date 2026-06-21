from sqlalchemy.exc import IntegrityError

from src.repositories.producto import ProductoRepository
from src.repositories.inventario import InventarioRepository


class ProductoService:
    def __init__(self):
        self.repo = ProductoRepository()
        self.inventario_repo = InventarioRepository()

    async def listar(self, id_categoria: str | None = None):
        return await self.repo.get_all(id_categoria)

    async def obtener(self, id_producto: str):
        result = await self.repo.get_by_id(id_producto)
        if not result:
            raise ValueError("Producto no encontrado")
        return result

    async def crear(self, data: dict):
        stock_minimo = data.pop("stock_minimo", 0)
        producto = await self.repo.create(data)
        await self.inventario_repo.create(producto["id_producto"], stock_minimo=stock_minimo)
        return producto

    async def actualizar(self, id_producto: str, data: dict):
        result = await self.repo.update(id_producto, data)
        if not result:
            raise ValueError("Producto no encontrado")
        return result

    async def eliminar(self, id_producto: str):
        try:
            await self.inventario_repo.delete_by_producto(id_producto)
            await self.repo.delete(id_producto)
        except IntegrityError:
            raise ValueError(
                "No se puede eliminar el producto porque está siendo usado "
                "en pedidos. Elimine primero los pedidos que lo contengan."
            )

    async def contar_activos(self) -> int:
        return await self.repo.count_active()
