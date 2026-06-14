from fastapi import APIRouter, HTTPException, Depends, Query

from src.schemas.comprobante import (
    ComprobanteCreate,
    ComprobanteMasivoCreate,
    ComprobanteMasivoResponse,
    ComprobanteResponse,
    TipoComprobanteResponse,
)
from src.services.comprobante import ComprobanteService
from src.core.dependencies import require_admin

router = APIRouter(prefix="/comprobantes", tags=["comprobantes"])


@router.post("", response_model=ComprobanteResponse, status_code=201)
async def emitir(body: ComprobanteCreate, _=Depends(require_admin)):
    service = ComprobanteService()
    try:
        return await service.emitir(body.id_pedido, body.id_tipo)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/masivo", response_model=ComprobanteMasivoResponse, status_code=201)
async def emitir_masivo(body: ComprobanteMasivoCreate, _=Depends(require_admin)):
    service = ComprobanteService()
    emitidos, errores = await service.emitir_masivo(body.ids_pedido, body.id_tipo)
    return ComprobanteMasivoResponse(emitidos=emitidos, errores=errores)


@router.get("", response_model=list[ComprobanteResponse])
async def listar(id_tipo: str | None = Query(default=None), _=Depends(require_admin)):
    service = ComprobanteService()
    return await service.listar(id_tipo)


@router.get("/tipos", response_model=list[TipoComprobanteResponse])
async def listar_tipos(_=Depends(require_admin)):
    service = ComprobanteService()
    return await service.listar_tipos()


@router.get("/{id_comprobante}", response_model=ComprobanteResponse)
async def obtener(id_comprobante: str, _=Depends(require_admin)):
    service = ComprobanteService()
    try:
        return await service.obtener(id_comprobante)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
