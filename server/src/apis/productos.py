from fastapi import APIRouter, HTTPException, Depends, Query

from src.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse
from src.services.producto import ProductoService
from src.core.dependencies import require_admin

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("", response_model=list[ProductoResponse])
async def listar(id_categoria: str | None = Query(default=None)):
    service = ProductoService()
    return await service.listar(id_categoria)


@router.get("/count")
async def contar():
    service = ProductoService()
    return {"cantidad": await service.contar_activos()}


@router.get("/{id_producto}", response_model=ProductoResponse)
async def obtener(id_producto: str):
    service = ProductoService()
    try:
        return await service.obtener(id_producto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", response_model=ProductoResponse, status_code=201)
async def crear(body: ProductoCreate, _=Depends(require_admin)):
    service = ProductoService()
    return await service.crear(body.model_dump())


@router.put("/{id_producto}", response_model=ProductoResponse)
async def actualizar(id_producto: str, body: ProductoUpdate, _=Depends(require_admin)):
    service = ProductoService()
    try:
        return await service.actualizar(id_producto, body.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{id_producto}", status_code=204)
async def eliminar(id_producto: str, _=Depends(require_admin)):
    service = ProductoService()
    await service.eliminar(id_producto)
