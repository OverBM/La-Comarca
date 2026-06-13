from fastapi import APIRouter, HTTPException, Depends

from src.schemas.usuario import UsuarioResponse, UsuarioRolUpdate
from src.services.usuario import UsuarioService
from src.core.dependencies import require_admin

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioResponse])
async def listar(_=Depends(require_admin)):
    service = UsuarioService()
    return await service.listar()


@router.get("/{id_usuario}", response_model=UsuarioResponse)
async def obtener(id_usuario: str, _=Depends(require_admin)):
    service = UsuarioService()
    try:
        return await service.obtener(id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{id_usuario}/rol", response_model=UsuarioResponse)
async def actualizar_rol(id_usuario: str, body: UsuarioRolUpdate, _=Depends(require_admin)):
    service = UsuarioService()
    try:
        return await service.actualizar_rol(id_usuario, body.rol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{id_usuario}/desactivar", response_model=UsuarioResponse)
async def desactivar(id_usuario: str, _=Depends(require_admin)):
    service = UsuarioService()
    try:
        return await service.desactivar(id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
