from fastapi import APIRouter, HTTPException, Depends, Query

from src.schemas.inventario import InventarioResponse, MovimientoCreate, MovimientoResponse, MovimientosPaginados
from src.services.inventario import InventarioService
from src.core.dependencies import require_admin_or_vendedor

router = APIRouter(prefix="/inventario", tags=["inventario"])


@router.get("", response_model=list[InventarioResponse])
async def listar(bajo: bool = Query(default=False), _=Depends(require_admin_or_vendedor)):
    service = InventarioService()
    return await service.listar(bajo)


@router.get("/movimientos", response_model=MovimientosPaginados)
async def listar_movimientos(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    desde: str | None = Query(default=None),
    hasta: str | None = Query(default=None),
    _=Depends(require_admin_or_vendedor),
):
    service = InventarioService()
    return await service.movimientos(None, page, limit, desde, hasta)


@router.get("/{id_producto}", response_model=InventarioResponse)
async def obtener(id_producto: str, _=Depends(require_admin_or_vendedor)):
    service = InventarioService()
    try:
        return await service.obtener(id_producto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/movimientos", response_model=MovimientoResponse, status_code=201)
async def registrar_movimiento(body: MovimientoCreate, usuario: dict = Depends(require_admin_or_vendedor)):
    service = InventarioService()
    data = body.model_dump()
    data["id_usuario"] = usuario["sub"]
    try:
        return await service.registrar_movimiento(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id_producto}/movimientos", response_model=MovimientosPaginados)
async def movimientos_por_producto(
    id_producto: str,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    desde: str | None = Query(default=None),
    hasta: str | None = Query(default=None),
    _=Depends(require_admin_or_vendedor),
):
    service = InventarioService()
    return await service.movimientos(id_producto, page, limit, desde, hasta)
