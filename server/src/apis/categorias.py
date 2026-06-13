from fastapi import APIRouter, HTTPException, Depends

from src.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse
from src.services.categoria import CategoriaService
from src.core.dependencies import require_admin

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("", response_model=list[CategoriaResponse])
async def listar():
    service = CategoriaService()
    return await service.listar()


@router.get("/{id_categoria}", response_model=CategoriaResponse)
async def obtener(id_categoria: str):
    service = CategoriaService()
    result = await service.obtener(id_categoria)
    if not result:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return result


@router.post("", response_model=CategoriaResponse, status_code=201)
async def crear(body: CategoriaCreate, _=Depends(require_admin)):
    service = CategoriaService()
    return await service.crear(body.nombre)


@router.put("/{id_categoria}", response_model=CategoriaResponse)
async def actualizar(id_categoria: str, body: CategoriaUpdate, _=Depends(require_admin)):
    service = CategoriaService()
    try:
        return await service.actualizar(id_categoria, body.nombre)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{id_categoria}", status_code=204)
async def eliminar(id_categoria: str, _=Depends(require_admin)):
    service = CategoriaService()
    await service.eliminar(id_categoria)
