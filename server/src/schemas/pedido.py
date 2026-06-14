from datetime import datetime

from pydantic import BaseModel


class DetallePedidoInput(BaseModel):
    id_producto: str
    cantidad: int


class PedidoCreate(BaseModel):
    id_cliente: str
    items: list[DetallePedidoInput]
    metodo_pago: str = "efectivo"


class DetallePedidoResponse(BaseModel):
    id_detalle: str
    id_producto: str
    nombre_producto: str | None = None
    cantidad: int
    precio_unitario: float
    subtotal: float


class PedidoResponse(BaseModel):
    id_pedido: str
    id_cliente: str
    cliente_nombre: str
    fecha_pedido: datetime
    detalle: list[DetallePedidoResponse]
    total: float
    metodo_pago: str
    estado_pago: str


class PedidoResumenResponse(BaseModel):
    id_pedido: str
    cliente: str
    fecha: datetime
    total: float
    metodo_pago: str
    estado_pago: str

