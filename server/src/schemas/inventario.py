from datetime import datetime

from pydantic import BaseModel


class InventarioResponse(BaseModel):
    id_inventario: str
    id_producto: str
    stock_actual: int
    stock_minimo: int
    ultima_actualizacion: datetime | None = None

    model_config = {"from_attributes": True}


class MovimientoCreate(BaseModel):
    id_producto: str
    tipo: str
    cantidad: int
    motivo: str


class MovimientoResponse(BaseModel):
    id_movimiento: str
    id_producto: str
    tipo: str
    cantidad: int
    motivo: str
    id_usuario: str
    fecha: datetime | None = None

    model_config = {"from_attributes": True}
