from fastapi import APIRouter, HTTPException, Depends, Query

from src.schemas.inventario import InventarioResponse, MovimientoCreate, MovimientoResponse
from src.services.inventario import InventarioService
from src.core.dependencies import require_admin

router = APIRouter(prefix="/inventario", tags=["inventario"])


@router.get("", response_model=list[InventarioResponse])
async def listar(bajo: bool = Query(default=False), _=Depends(require_admin)):
    service = InventarioService()
    return await service.listar(bajo)


@router.get("/movimientos", response_model=list[MovimientoResponse])
async def listar_movimientos(limit: int = Query(default=50), _=Depends(require_admin)):
    service = InventarioService()
    return await service.movimientos(None, limit)


@router.get("/{id_producto}", response_model=InventarioResponse)
async def obtener(id_producto: str, _=Depends(require_admin)):
    service = InventarioService()
    try:
        return await service.obtener(id_producto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/movimientos", response_model=MovimientoResponse, status_code=201)
async def registrar_movimiento(body: MovimientoCreate, usuario: dict = Depends(require_admin)):
    service = InventarioService()
    data = body.model_dump()
    data["id_usuario"] = usuario["sub"]
    try:
        return await service.registrar_movimiento(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id_producto}/movimientos", response_model=list[MovimientoResponse])
async def movimientos_por_producto(id_producto: str, limit: int = Query(default=50), _=Depends(require_admin)):
    service = InventarioService()
    return await service.movimientos(id_producto, limit)
