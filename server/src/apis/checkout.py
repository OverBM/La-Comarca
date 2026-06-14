from fastapi import APIRouter, HTTPException

from src.schemas.checkout import CheckoutRequest
from src.schemas.pedido import PedidoResponse
from src.services.checkout import CheckoutService

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("", response_model=PedidoResponse, status_code=201)
async def checkout(body: CheckoutRequest):
    service = CheckoutService()
    try:
        return await service.checkout(body.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
