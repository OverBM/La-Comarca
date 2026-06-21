from src.repositories.comprobante import ComprobanteRepository
from src.repositories.pedido import PedidoRepository
from src.repositories.cliente_empresa import ClienteEmpresaRepository
from src.repositories.cliente import ClienteRepository
from src.services.nubefact import NubefactService


class ComprobanteService:
    def __init__(self):
        self.repo = ComprobanteRepository()
        self.pedido_repo = PedidoRepository()
        self.cliente_repo = ClienteRepository()
        self.cliente_empresa_repo = ClienteEmpresaRepository()
        self.nubefact = NubefactService()

    async def emitir(self, id_pedido: str, id_tipo: str):
        existente = await self.repo.get_by_pedido(id_pedido)
        if existente:
            raise ValueError(f"El pedido {id_pedido} ya tiene un comprobante emitido")

        pedido = await self.pedido_repo.get_by_id(id_pedido)
        if not pedido:
            raise ValueError("Pedido no encontrado")

        if pedido.get("estado_pago") != "pagado":
            raise ValueError("El pedido no está pagado")

        cliente = await self.cliente_repo.get_by_id(pedido["id_cliente"])
        if not cliente:
            raise ValueError("Cliente no encontrado")

        if id_tipo == "TC002":
            empresa = await self.cliente_empresa_repo.get_by_cliente_id(pedido["id_cliente"])
            if not empresa or not empresa.get("ruc"):
                raise ValueError("El cliente no tiene RUC registrado para emitir factura")

        total = await self.pedido_repo.get_total(id_pedido)
        serie, correlativo = await self.repo.get_next_correlativo(id_tipo)
        if not serie:
            raise ValueError("Tipo de comprobante no válido")

        # Reservar correlativo creando el registro antes de llamar a Nubefact
        data = {
            "id_pedido": id_pedido,
            "id_empresa": None,
            "id_tipo": id_tipo,
            "serie": serie,
            "correlativo": correlativo,
            "total": total,
        }
        creado = await self.repo.create(data)
        id_comprobante = creado["id_comprobante"]

        cliente_nombre = f"{cliente['nombre']} {cliente['apellido']}".strip()
        igv = round(total * 18 / 118, 2)
        gravada = round(total - igv, 2)

        payload = self.nubefact.construir_peticion(
            tipo_de_comprobante=1 if id_tipo == "TC002" else 2,
            serie=serie,
            numero=str(int(correlativo)),
            cliente_tipo_de_documento="6" if id_tipo == "TC002" else "-",
            cliente_numero=empresa["ruc"] if id_tipo == "TC002" else pedido["id_cliente"],
            cliente_denominacion=empresa.get("razon_social", cliente_nombre) if id_tipo == "TC002" else cliente_nombre,
            cliente_direccion="",
            cliente_email="",
            total_gravada=str(gravada),
            total_igv=str(igv),
            total=str(total),
            items=[{
                "unidad_de_medida": "NIU",
                "codigo": "001",
                "descripcion": "Producto",
                "cantidad": "1",
                "valor_unitario": str(gravada),
                "precio_unitario": str(total),
                "subtotal": str(gravada),
                "tipo_de_igv": "1",
                "igv": str(igv),
                "total": str(total),
            }],
        )

        respuesta = await self.nubefact.emitir_comprobante(payload)

        enlace = (respuesta.get("enlace") or "") + ".pdf"
        await self.repo.update_enlace(id_comprobante, enlace)
        return await self.repo.get_by_id(id_comprobante)

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
