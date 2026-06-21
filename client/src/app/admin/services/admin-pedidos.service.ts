import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoResumen } from '../models/pedido-resumen.model';
import { PedidoDetalle } from '../models/pedido-detalle.model';
import { Comprobante } from '../models/comprobante.model';

@Injectable({ providedIn: 'root' })
export class AdminPedidosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getPedidos(): Observable<PedidoResumen[]> {
    return this.http.get<PedidoResumen[]>(`${this.apiUrl}/pedidos`);
  }

  getPedidoDetalle(id: string): Observable<PedidoDetalle> {
    return this.http.get<PedidoDetalle>(`${this.apiUrl}/pedidos/${id}`);
  }

  getComprobantes(): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(`${this.apiUrl}/comprobantes`);
  }

  getVentasDelDia(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/pedidos/ventas-hoy`);
  }

  getPedidosDelDia(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/pedidos/pedidos-hoy`);
  }

  getTiposComprobante(): Observable<TipoComprobante[]> {
    return this.http.get<TipoComprobante[]>(`${this.apiUrl}/comprobantes/tipos`);
  }

  emitirComprobantesMasivo(ids_pedido: string[], id_tipo: string): Observable<ComprobanteMasivoResponse> {
    return this.http.post<ComprobanteMasivoResponse>(`${this.apiUrl}/comprobantes/masivo`, { ids_pedido, id_tipo });
  }

  confirmarPago(id_pedido: string): Observable<PedidoDetalle> {
    return this.http.put<PedidoDetalle>(`${this.apiUrl}/pedidos/${id_pedido}/pago`, {});
  }

  anularPedido(id_pedido: string): Observable<PedidoDetalle> {
    return this.http.put<PedidoDetalle>(`${this.apiUrl}/pedidos/${id_pedido}/anular`, {});
  }
}

export interface TipoComprobante {
  id_tipo: string;
  nombre: string;
  serie_base: string;
}

export interface ComprobanteMasivoResponse {
  emitidos: ComprobanteEmitido[];
  errores: { id_pedido: string; error: string }[];
}

export interface ComprobanteEmitido {
  id_comprobante: string;
  tipo: string;
  serie: string;
  correlativo: string;
  total: number;
  fecha: string;
  cliente: string;
  ruc?: string;
  razon_social?: string;
  enlace?: string;
}
