from src.repositories.usuario import UsuarioRepository


class UsuarioService:
    def __init__(self):
        self.repo = UsuarioRepository()

    async def listar(self):
        return await self.repo.get_all()

    async def obtener(self, id_usuario: str):
        result = await self.repo.get_by_id(id_usuario)
        if not result:
            raise ValueError("Usuario no encontrado")
        return result

    async def actualizar_rol(self, id_usuario: str, rol: str):
        result = await self.repo.update_rol(id_usuario, rol)
        if not result:
            raise ValueError("Usuario no encontrado")
        return result

    async def desactivar(self, id_usuario: str):
        result = await self.repo.deactivate(id_usuario)
        if not result:
            raise ValueError("Usuario no encontrado")
        return result
