from src.repositories.pedido import PedidoRepository
from src.repositories.inventario import InventarioRepository
from src.repositories.producto import ProductoRepository
from src.repositories.cliente import ClienteRepository


class PedidoService:
    def __init__(self):
        self.pedido_repo = PedidoRepository()
        self.inventario_repo = InventarioRepository()
        self.producto_repo = ProductoRepository()
        self.cliente_repo = ClienteRepository()

    async def crear(self, id_cliente: str, items: list[dict], metodo_pago: str = "efectivo", id_usuario: str = ""):
        total = 0
        items_con_precio = []
        for item in items:
            producto = await self.producto_repo.get_by_id(item["id_producto"])
            if not producto:
                raise ValueError(f"Producto {item['id_producto']} no encontrado")
            inventario = await self.inventario_repo.get_by_producto(item["id_producto"])
            if inventario and inventario["stock_actual"] < item["cantidad"]:
                raise ValueError(f"Stock insuficiente para {producto['nombre']}")
            subtotal = producto["precio_unitario"] * item["cantidad"]
            total += subtotal
            items_con_precio.append({
                "id_producto": item["id_producto"],
                "nombre_producto": producto["nombre"],
                "cantidad": item["cantidad"],
                "precio_unitario": producto["precio_unitario"],
                "subtotal": subtotal,
            })
        pedido, detalle = await self.pedido_repo.create(id_cliente, items_con_precio, metodo_pago)
        for item in items:
            inventario = await self.inventario_repo.get_by_producto(item["id_producto"])
            if inventario:
                await self.inventario_repo.actualizar_stock(
                    id_producto=item["id_producto"],
                    cantidad=item["cantidad"],
                    tipo="salida",
                    motivo=f"Venta - Pedido {pedido['id_pedido']}",
                    id_usuario=id_usuario,
                )
        cliente = await self.cliente_repo.get_by_id(id_cliente)
        cliente_nombre = f"{cliente['nombre']} {cliente['apellido']}" if cliente else ""
        return {**pedido, "detalle": detalle, "total": total, "cliente_nombre": cliente_nombre, "metodo_pago": metodo_pago, "estado_pago": "pendiente"}

    async def obtener(self, id_pedido: str):
        pedido = await self.pedido_repo.get_by_id(id_pedido)
        if not pedido:
            raise ValueError("Pedido no encontrado")
        detalle = await self.pedido_repo.get_detalle(id_pedido)
        total = await self.pedido_repo.get_total(id_pedido)
        cliente = await self.cliente_repo.get_by_id(pedido["id_cliente"])
        cliente_nombre = f"{cliente['nombre']} {cliente['apellido']}" if cliente else ""
        return {**pedido, "detalle": detalle, "total": total, "cliente_nombre": cliente_nombre, "metodo_pago": pedido.get("metodo_pago", "efectivo"), "estado_pago": pedido.get("estado_pago", "pendiente")}

    async def listar_mios(self, id_cliente: str):
        pedidos = await self.pedido_repo.get_by_cliente(id_cliente)
        resultado = []
        for p in pedidos:
            total = await self.pedido_repo.get_total(p["id_pedido"])
            cliente = await self.cliente_repo.get_by_id(p["id_cliente"])
            cliente_nombre = f"{cliente['nombre']} {cliente['apellido']}" if cliente else ""
            resultado.append({
                "id_pedido": p["id_pedido"],
                "cliente": cliente_nombre,
                "fecha": p["fecha_pedido"],
                "total": total,
                "metodo_pago": p.get("metodo_pago", "efectivo"),
                "estado_pago": p.get("estado_pago", "pendiente"),
            })
        return resultado

    async def listar_todos(self):
        pedidos = await self.pedido_repo.get_all()
        resultado = []
        for p in pedidos:
            total = await self.pedido_repo.get_total(p["id_pedido"])
            cliente = await self.cliente_repo.get_by_id(p["id_cliente"])
            cliente_nombre = f"{cliente['nombre']} {cliente['apellido']}" if cliente else ""
            resultado.append({
                "id_pedido": p["id_pedido"],
                "cliente": cliente_nombre,
                "fecha": p["fecha_pedido"],
                "total": total,
                "metodo_pago": p.get("metodo_pago", "efectivo"),
                "estado_pago": p.get("estado_pago", "pendiente"),
            })
        return resultado

    async def confirmar_pago(self, id_pedido: str):
        pedido = await self.pedido_repo.update_estado_pago(id_pedido, "pagado")
        if not pedido:
            raise ValueError("Pedido no encontrado")
        return await self.obtener(id_pedido)

    async def anular(self, id_pedido: str):
        pedido = await self.pedido_repo.update_estado_pago(id_pedido, "anulado")
        if not pedido:
            raise ValueError("Pedido no encontrado")
        return await self.obtener(id_pedido)

    async def contar_hoy(self) -> int:
        return await self.pedido_repo.count_today()

    async def ventas_hoy(self) -> float:
        return await self.pedido_repo.sales_today()
