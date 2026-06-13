from pydantic import BaseModel


class DireccionCreate(BaseModel):
    calle: str
    ciudad: str


class DireccionResponse(BaseModel):
    id_direccion: str
    id_cliente: str
    calle: str
    ciudad: str

    model_config = {"from_attributes": True}
