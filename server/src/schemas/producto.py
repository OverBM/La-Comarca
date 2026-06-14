from pydantic import BaseModel


class ProductoCreate(BaseModel):
    id_categoria: str
    nombre: str
    precio_unitario: float
    descripcion: str | None = None
    imagen: str | None = None
    stock_minimo: int = 0


class ProductoUpdate(BaseModel):
    id_categoria: str | None = None
    nombre: str | None = None
    precio_unitario: float | None = None
    descripcion: str | None = None
    imagen: str | None = None


class ProductoResponse(BaseModel):
    id_producto: str
    id_categoria: str
    nombre: str
    precio_unitario: float
    descripcion: str | None
    imagen: str | None
    stock_actual: int | None = None
    stock_minimo: int | None = None

    model_config = {"from_attributes": True}
