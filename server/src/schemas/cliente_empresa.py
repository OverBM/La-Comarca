from pydantic import BaseModel, field_validator
from typing import Optional

PREFIJOS_RUC = {"10", "15", "17", "20"}


class ClienteEmpresaCreate(BaseModel):
    id_cliente: str
    ruc: str
    razon_social: str

    @field_validator("ruc")
    @classmethod
    def validar_ruc(cls, v: str) -> str:
        if len(v) != 11 or not v.isdigit():
            raise ValueError("RUC debe tener 11 dígitos")
        if v[:2] not in PREFIJOS_RUC:
            raise ValueError("RUC debe iniciar con 10, 15, 17 ó 20")
        return v


class ClienteEmpresaUpdate(BaseModel):
    ruc: Optional[str] = None
    razon_social: Optional[str] = None

    @field_validator("ruc")
    @classmethod
    def validar_ruc(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if len(v) != 11 or not v.isdigit():
            raise ValueError("RUC debe tener 11 dígitos")
        if v[:2] not in PREFIJOS_RUC:
            raise ValueError("RUC debe iniciar con 10, 15, 17 ó 20")
        return v


class ClienteEmpresaResponse(BaseModel):
    id_empresa: str
    id_cliente: str
    ruc: str
    razon_social: str

    model_config = {"from_attributes": True}
