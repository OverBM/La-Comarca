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
}
