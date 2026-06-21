from typing import Any
from datetime import datetime

import aiohttp

from src.core.config import NUBEFACT_API_URL, NUBEFACT_API_KEY


class NubefactService:
    def __init__(self):
        self.api_url = NUBEFACT_API_URL
        self.api_key = NUBEFACT_API_KEY

    def construir_peticion(
        self,
        tipo_de_comprobante: int,
        serie: str,
        numero: str,
        cliente_tipo_de_documento: str,
        cliente_numero: str,
        cliente_denominacion: str,
        cliente_direccion: str,
        cliente_email: str,
        total_gravada: str,
        total_igv: str,
        total: str,
        items: list[dict],
    ) -> dict:
        return {
            "operacion": "generar_comprobante",
            "tipo_de_comprobante": tipo_de_comprobante,
            "serie": serie,
            "numero": numero,
            "sunat_transaction": 1,
            "cliente_tipo_de_documento": cliente_tipo_de_documento,
            "cliente_numero_de_documento": cliente_numero,
            "cliente_denominacion": cliente_denominacion,
            "cliente_direccion": cliente_direccion,
            "cliente_email": cliente_email,
            "fecha_de_emision": datetime.now().strftime("%d-%m-%Y"),
            "moneda": "1",
            "porcentaje_de_igv": "18.00",
            "total_gravada": total_gravada,
            "total_inafecta": "0",
            "total_exonerada": "0",
            "total_igv": total_igv,
            "total": total,
            "items": items or [],
            "enviar_automaticamente_a_la_sunat": "true",
            "enviar_automaticamente_al_cliente": "false",
        }

    async def emitir_comprobante(self, payload: dict) -> dict:
        headers = {
            "Authorization": self.api_key,
            "Content-Type": "application/json",
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(self.api_url, json=payload, headers=headers) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise ValueError(f"Nubefact respondió con código {resp.status}: {text}")
                return await resp.json()
