from src.repositories.cliente import ClienteRepository
from src.repositories.direccion import DireccionRepository


class ClienteService:
    def __init__(self):
        self.repo = ClienteRepository()
        self.direccion_repo = DireccionRepository()

    async def obtener_perfil(self, id_usuario: str):
        cliente = await self.repo.get_by_usuario_id(id_usuario)
        if not cliente:
            raise ValueError("Cliente no encontrado")
        return cliente

    async def actualizar_perfil(self, id_usuario: str, data: dict):
        cliente = await self.repo.get_by_usuario_id(id_usuario)
        if not cliente:
            raise ValueError("Cliente no encontrado")
        return await self.repo.update(cliente["id_cliente"], data)

    async def listar_todos(self):
        return await self.repo.get_all()

    async def listar_direcciones(self, id_cliente: str):
        return await self.direccion_repo.get_by_cliente(id_cliente)

    async def crear_direccion(self, data: dict):
        return await self.direccion_repo.create(data)
