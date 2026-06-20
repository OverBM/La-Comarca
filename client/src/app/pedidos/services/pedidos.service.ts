import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoResumen, PedidoDetalle, PedidoCreacion } from '../models/pedido.models';

export type { PedidoResumen, PedidoDetalle, PedidoCreacion };

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obtenerMisPedidos(): Observable<PedidoResumen[]> {
    return this.http.get<PedidoResumen[]>(`${this.apiUrl}/pedidos/mis-pedidos`);
  }

  obtenerPedidoPorId(id: string): Observable<PedidoDetalle> {
    return this.http.get<PedidoDetalle>(`${this.apiUrl}/pedidos/${id}`);
  }

  crear(data: PedidoCreacion): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(`${this.apiUrl}/pedidos`, data);
  }
}
