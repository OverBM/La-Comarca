from pydantic import BaseModel


class ClienteCreate(BaseModel):
    id_usuario: str | None = None
    nombre: str
    apellido: str
    telefono: str | None = None
    email: str | None = None


class ClienteUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    telefono: str | None = None
    email: str | None = None


class ClienteResponse(BaseModel):
    id_cliente: str
    id_usuario: str | None
    nombre: str
    apellido: str
    telefono: str | None
    email: str | None

    model_config = {"from_attributes": True}
