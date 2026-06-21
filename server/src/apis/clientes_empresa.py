from fastapi import APIRouter, HTTPException, Depends

from src.repositories.cliente_empresa import ClienteEmpresaRepository
from src.schemas.cliente_empresa import ClienteEmpresaResponse, ClienteEmpresaUpdate
from src.core.dependencies import get_current_user

router = APIRouter(prefix="/clientes-empresa", tags=["clientes-empresa"])


@router.get("/{id_cliente}", response_model=ClienteEmpresaResponse)
async def get_empresa(id_cliente: str, usuario: dict = Depends(get_current_user)):
    repo = ClienteEmpresaRepository()
    empresa = await repo.get_by_cliente_id(id_cliente)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return ClienteEmpresaResponse(**empresa)


@router.put("/{id_cliente}", response_model=ClienteEmpresaResponse)
async def update_empresa(id_cliente: str, body: ClienteEmpresaUpdate, usuario: dict = Depends(get_current_user)):
    repo = ClienteEmpresaRepository()
    empresa = await repo.get_by_cliente_id(id_cliente)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    data = body.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")
    updated = await repo.update(id_cliente, data)
    return ClienteEmpresaResponse(**updated)
