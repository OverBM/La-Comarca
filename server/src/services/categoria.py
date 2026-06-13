from src.repositories.categoria import CategoriaRepository


class CategoriaService:
    def __init__(self):
        self.repo = CategoriaRepository()

    async def listar(self):
        return await self.repo.get_all()

    async def obtener(self, id_categoria: str):
        return await self.repo.get_by_id(id_categoria)

    async def crear(self, nombre: str):
        return await self.repo.create(nombre)

    async def actualizar(self, id_categoria: str, nombre: str):
        result = await self.repo.update(id_categoria, nombre)
        if not result:
            raise ValueError("Categoría no encontrada")
        return result

    async def eliminar(self, id_categoria: str):
        await self.repo.delete(id_categoria)
