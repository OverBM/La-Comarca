from pydantic import BaseModel


class UsuarioResponse(BaseModel):
    id_usuario: str
    nombre: str
    apellido: str
    email: str
    telefono: str | None
    rol: str
    activo: bool

    model_config = {"from_attributes": True}


class UsuarioRolUpdate(BaseModel):
    rol: str
