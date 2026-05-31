import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_PEDIDOS, calcularTotal } from '../../core/mocks/pedidos.mock';
import { MOCK_COMPROBANTES } from '../../core/mocks/comprobantes.mock';
import { RETARDO_MOCK } from '../../core/constants/app.constants';
import { PedidoResumen } from '../models/pedido-resumen.model';
import { PedidoDetalle } from '../models/pedido-detalle.model';
import { Comprobante } from '../models/comprobante.model';

@Injectable({ providedIn: 'root' })
export class AdminPedidosService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<PedidoResumen[]> {
    if (environment.useMock) {
      const resumen = MOCK_PEDIDOS.map(p => ({
        id_pedido: p.id_pedido,
        cliente: p.cliente_nombre,
        fecha: p.fecha_pedido,
        total: calcularTotal(p.detalle),
      }));
      return of(resumen).pipe(delay(RETARDO_MOCK));
    }
    return this.http.get<PedidoResumen[]>(`${this.apiUrl}/pedidos`);
  }

  getPedidoDetalle(id: string): Observable<PedidoDetalle | undefined> {
    if (environment.useMock) {
      const pedido = MOCK_PEDIDOS.find(p => p.id_pedido === id);
      if (!pedido) return of(undefined).pipe(delay(RETARDO_MOCK));
      const detalle: PedidoDetalle = {
        ...pedido,
        total: calcularTotal(pedido.detalle),
      };
      return of(detalle).pipe(delay(RETARDO_MOCK));
    }
    return this.http.get<PedidoDetalle>(`${this.apiUrl}/pedidos/${id}`);
  }

  getComprobantes(): Observable<Comprobante[]> {
    if (environment.useMock) {
      return of([...MOCK_COMPROBANTES] as Comprobante[]).pipe(delay(RETARDO_MOCK));
    }
    return this.http.get<Comprobante[]>(`${this.apiUrl}/comprobantes`);
  }

  getComprobantesByTipo(tipo: string): Observable<Comprobante[]> {
    if (environment.useMock) {
      return of(MOCK_COMPROBANTES.filter(c => c.tipo === tipo) as Comprobante[]).pipe(delay(RETARDO_MOCK));
    }
    return this.http.get<Comprobante[]>(`${this.apiUrl}/comprobantes?tipo=${tipo}`);
  }

  getVentasDelDia(): Observable<number> {
    if (environment.useMock) {
      const hoy = new Date();
      const hoyStr = hoy.toDateString();
      const total = MOCK_PEDIDOS
        .filter(p => p.fecha_pedido.toDateString() === hoyStr)
        .reduce((sum, p) => sum + calcularTotal(p.detalle), 0);
      return of(total).pipe(delay(RETARDO_MOCK));
    }
    return this.http.get<number>(`${this.apiUrl}/ventas-hoy`);
  }

  getPedidosDelDia(): Observable<number> {
    if (environment.useMock) {
      const hoy = new Date();
      const hoyStr = hoy.toDateString();
      const count = MOCK_PEDIDOS.filter(p => p.fecha_pedido.toDateString() === hoyStr).length;
      return of(count).pipe(delay(RETARDO_MOCK));
    }
    return this.http.get<number>(`${this.apiUrl}/pedidos-hoy`);
  }
}
