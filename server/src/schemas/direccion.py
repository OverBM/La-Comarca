from pydantic import BaseModel


class DireccionCreate(BaseModel):
    calle: str
    ciudad: str
    referencia: str | None = None


class DireccionResponse(BaseModel):
    id_direccion: str
    id_cliente: str
    calle: str
    ciudad: str
    referencia: str | None = None

    model_config = {"from_attributes": True}
