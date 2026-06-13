from fastapi import APIRouter, HTTPException, Depends

from src.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from src.schemas.direccion import DireccionCreate, DireccionResponse
from src.services.cliente import ClienteService
from src.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.get("/me", response_model=ClienteResponse)
async def perfil(usuario: dict = Depends(get_current_user)):
    service = ClienteService()
    try:
        return await service.obtener_perfil(usuario["sub"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/me", response_model=ClienteResponse)
async def actualizar_perfil(body: ClienteUpdate, usuario: dict = Depends(get_current_user)):
    service = ClienteService()
    try:
        return await service.actualizar_perfil(usuario["sub"], body.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("", response_model=list[ClienteResponse])
async def listar_todos(_=Depends(require_admin)):
    service = ClienteService()
    return await service.listar_todos()


@router.get("/{id_cliente}/direcciones", response_model=list[DireccionResponse])
async def listar_direcciones(id_cliente: str, _=Depends(get_current_user)):
    service = ClienteService()
    return await service.listar_direcciones(id_cliente)


@router.post("/{id_cliente}/direcciones", response_model=DireccionResponse, status_code=201)
async def crear_direccion(id_cliente: str, body: DireccionCreate, _=Depends(get_current_user)):
    service = ClienteService()
    data = body.model_dump()
    data["id_cliente"] = id_cliente
    return await service.crear_direccion(data)
