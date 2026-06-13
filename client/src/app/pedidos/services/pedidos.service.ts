import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PedidoResumen {
  id_pedido: string;
  cliente: string;
  fecha: string;
  total: number;
}

export interface PedidoDetalle {
  id_pedido: string;
  id_cliente: string;
  cliente_nombre: string;
  fecha_pedido: string;
  detalle: {
    id_detalle: string;
    id_producto: string;
    nombre_producto?: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  crearPedido(id_cliente: string, items: { id_producto: string; cantidad: number }[]): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(`${this.apiUrl}/pedidos`, { id_cliente, items });
  }

  getMisPedidos(): Observable<PedidoResumen[]> {
    return this.http.get<PedidoResumen[]>(`${this.apiUrl}/pedidos/mis-pedidos`);
  }

  getPedidoPorId(id: string): Observable<PedidoDetalle> {
    return this.http.get<PedidoDetalle>(`${this.apiUrl}/pedidos/${id}`);
  }
}
