from fastapi import APIRouter, HTTPException, Depends

from src.schemas.pedido import PedidoCreate, PedidoResponse, PedidoResumenResponse
from src.services.pedido import PedidoService
from src.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


@router.post("", response_model=PedidoResponse, status_code=201)
async def crear(body: PedidoCreate, usuario: dict = Depends(get_current_user)):
    service = PedidoService()
    try:
        result = await service.crear(body.id_cliente, [i.model_dump() for i in body.items], body.metodo_pago, usuario["sub"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/mis-pedidos", response_model=list[PedidoResumenResponse])
async def mis_pedidos(usuario: dict = Depends(get_current_user)):
    service = PedidoService()
    from src.repositories.cliente import ClienteRepository
    repo = ClienteRepository()
    cliente = await repo.get_by_usuario_id(usuario["sub"])
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return await service.listar_mios(cliente["id_cliente"])


@router.get("/pedidos-hoy")
async def pedidos_hoy(_=Depends(require_admin)):
    service = PedidoService()
    return await service.contar_hoy()


@router.get("/ventas-hoy")
async def ventas_hoy(_=Depends(require_admin)):
    service = PedidoService()
    return await service.ventas_hoy()


@router.get("/{id_pedido}", response_model=PedidoResponse)
async def obtener(id_pedido: str, _=Depends(get_current_user)):
    service = PedidoService()
    try:
        return await service.obtener(id_pedido)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{id_pedido}/pago", response_model=PedidoResponse)
async def confirmar_pago(id_pedido: str, _=Depends(require_admin)):
    service = PedidoService()
    try:
        return await service.confirmar_pago(id_pedido)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("", response_model=list[PedidoResumenResponse])
async def listar_todos(_=Depends(require_admin)):
    service = PedidoService()
    return await service.listar_todos()
