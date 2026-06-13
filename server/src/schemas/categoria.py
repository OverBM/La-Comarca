from pydantic import BaseModel


class CategoriaCreate(BaseModel):
    nombre: str


class CategoriaUpdate(BaseModel):
    nombre: str


class CategoriaResponse(BaseModel):
    id_categoria: str
    nombre: str

    model_config = {"from_attributes": True}
