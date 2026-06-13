from src.repositories.producto import ProductoRepository


class ProductoService:
    def __init__(self):
        self.repo = ProductoRepository()

    async def listar(self, id_categoria: str | None = None):
        return await self.repo.get_all(id_categoria)

    async def obtener(self, id_producto: str):
        result = await self.repo.get_by_id(id_producto)
        if not result:
            raise ValueError("Producto no encontrado")
        return result

    async def crear(self, data: dict):
        return await self.repo.create(data)

    async def actualizar(self, id_producto: str, data: dict):
        result = await self.repo.update(id_producto, data)
        if not result:
            raise ValueError("Producto no encontrado")
        return result

    async def eliminar(self, id_producto: str):
        await self.repo.delete(id_producto)
