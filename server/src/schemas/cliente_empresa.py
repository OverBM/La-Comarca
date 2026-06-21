from pydantic import BaseModel
from typing import Optional


class ClienteEmpresaCreate(BaseModel):
    id_cliente: str
    ruc: str
    razon_social: str


class ClienteEmpresaUpdate(BaseModel):
    ruc: Optional[str] = None
    razon_social: Optional[str] = None


class ClienteEmpresaResponse(BaseModel):
    id_empresa: str
    id_cliente: str
    ruc: str
    razon_social: str

    model_config = {"from_attributes": True}
