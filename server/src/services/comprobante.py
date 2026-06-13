from src.repositories.comprobante import ComprobanteRepository


class ComprobanteService:
    def __init__(self):
        self.repo = ComprobanteRepository()

    async def emitir(self, id_pedido: str, id_tipo: str):
        serie, correlativo = await self.repo.get_next_correlativo(id_tipo)
        if not serie:
            raise ValueError("Tipo de comprobante no válido")
        data = {
            "id_pedido": id_pedido,
            "id_empresa": None,
            "id_tipo": id_tipo,
            "serie": serie,
            "correlativo": correlativo,
            "total": 0,
        }
        creado = await self.repo.create(data)
        return await self.repo.get_by_id(creado["id_comprobante"])

    async def listar(self, id_tipo: str | None = None):
        return await self.repo.get_all(id_tipo)

    async def obtener(self, id_comprobante: str):
        result = await self.repo.get_by_id(id_comprobante)
        if not result:
            raise ValueError("Comprobante no encontrado")
        return result

    async def listar_tipos(self):
        return await self.repo.get_tipos()
