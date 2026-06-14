from src.repositories.cliente import ClienteRepository
from src.repositories.direccion import DireccionRepository
from src.repositories.pedido import PedidoRepository
from src.repositories.producto import ProductoRepository
from src.repositories.inventario import InventarioRepository


class CheckoutService:
    def __init__(self):
        self.cliente_repo = ClienteRepository()
        self.direccion_repo = DireccionRepository()
        self.pedido_repo = PedidoRepository()
        self.producto_repo = ProductoRepository()
        self.inventario_repo = InventarioRepository()

    async def checkout(self, data: dict):
        cliente = await self.cliente_repo.get_by_telefono(data["telefono"])
        if not cliente:
            email = data.get("email") or f"{data['telefono']}@pedido.local"
            cliente = await self.cliente_repo.create({
                "id_usuario": None,
                "nombre": data["nombre"],
                "apellido": data["apellido"],
                "telefono": data["telefono"],
                "email": email,
            })

        await self.direccion_repo.create({
            "id_cliente": cliente["id_cliente"],
            "calle": data["calle"],
            "ciudad": data["ciudad"],
            "referencia": data.get("referencia"),
        })

        total = 0
        items_con_precio = []
        for item in data["items"]:
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
            if inventario:
                nuevo_stock = inventario["stock_actual"] - item["cantidad"]
                await self.inventario_repo.update_stock(inventario["id_inventario"], nuevo_stock)

        pedido, detalle = await self.pedido_repo.create(cliente["id_cliente"], items_con_precio)
        return {
            **pedido,
            "detalle": detalle,
            "total": total,
            "cliente_nombre": f"{cliente['nombre']} {cliente['apellido']}",
        }
