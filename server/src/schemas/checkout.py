from pydantic import BaseModel

from src.schemas.pedido import DetallePedidoInput


class CheckoutRequest(BaseModel):
    nombre: str
    apellido: str
    telefono: str
    email: str | None = None
    calle: str
    ciudad: str
    referencia: str | None = None
    items: list[DetallePedidoInput]
