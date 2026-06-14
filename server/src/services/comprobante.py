from src.repositories.comprobante import ComprobanteRepository
from src.repositories.pedido import PedidoRepository


class ComprobanteService:
    def __init__(self):
        self.repo = ComprobanteRepository()
        self.pedido_repo = PedidoRepository()

    async def emitir(self, id_pedido: str, id_tipo: str):
        existente = await self.repo.get_by_pedido(id_pedido)
        if existente:
            raise ValueError(f"El pedido {id_pedido} ya tiene un comprobante emitido")
        detalle = await self.pedido_repo.get_detalle(id_pedido)
        if not detalle:
            raise ValueError("Pedido no encontrado")
        total = sum(d["subtotal"] for d in detalle)
        serie, correlativo = await self.repo.get_next_correlativo(id_tipo)
        if not serie:
            raise ValueError("Tipo de comprobante no válido")
        data = {
            "id_pedido": id_pedido,
            "id_empresa": None,
            "id_tipo": id_tipo,
            "serie": serie,
            "correlativo": correlativo,
            "total": total,
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

    async def emitir_masivo(self, ids_pedido: list[str], id_tipo: str):
        resultados = []
        errores = []
        for id_pedido in ids_pedido:
            try:
                resultado = await self.emitir(id_pedido, id_tipo)
                resultados.append(resultado)
            except ValueError as e:
                errores.append({"id_pedido": id_pedido, "error": str(e)})
        return resultados, errores

    async def listar_tipos(self):
        return await self.repo.get_tipos()
