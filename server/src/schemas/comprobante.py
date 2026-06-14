from datetime import datetime

from pydantic import BaseModel


class ComprobanteCreate(BaseModel):
    id_pedido: str
    id_tipo: str


class ComprobanteMasivoCreate(BaseModel):
    ids_pedido: list[str]
    id_tipo: str


class ComprobanteResponse(BaseModel):
    id_comprobante: str
    tipo: str
    serie: str
    correlativo: str
    fecha: datetime
    cliente: str
    ruc: str | None = None
    razon_social: str | None = None
    total: float


class ErrorEmitirItem(BaseModel):
    id_pedido: str
    error: str


class ComprobanteMasivoResponse(BaseModel):
    emitidos: list[ComprobanteResponse]
    errores: list[ErrorEmitirItem]


class TipoComprobanteResponse(BaseModel):
    id_tipo: str
    nombre: str
    serie_base: str

    model_config = {"from_attributes": True}
