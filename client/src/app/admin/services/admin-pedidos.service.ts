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

  getComprobantesByTipo(tipo: string): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(`${this.apiUrl}/comprobantes?id_tipo=${tipo}`);
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

  emitirComprobante(id_pedido: string, id_tipo: string): Observable<ComprobanteEmitido> {
    return this.http.post<ComprobanteEmitido>(`${this.apiUrl}/comprobantes`, { id_pedido, id_tipo });
  }

  emitirComprobantesMasivo(ids_pedido: string[], id_tipo: string): Observable<ComprobanteMasivoResponse> {
    return this.http.post<ComprobanteMasivoResponse>(`${this.apiUrl}/comprobantes/masivo`, { ids_pedido, id_tipo });
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
}
