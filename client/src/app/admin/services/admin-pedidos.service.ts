import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_PEDIDOS, calcularTotal } from '../../core/mocks/pedidos.mock';
import { MOCK_COMPROBANTES } from '../../core/mocks/comprobantes.mock';

export interface PedidoResumen {
  id_pedido: string;
  cliente: string;
  fecha: Date;
  total: number;
}

export interface PedidoDetalle {
  id_pedido: string;
  id_cliente: string;
  cliente_nombre: string;
  fecha_pedido: Date;
  detalle: {
    id_detalle: string;
    id_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  total: number;
}

export interface Comprobante {
  id_comprobante: string;
  id_pedido: string;
  tipo: 'Boleta' | 'Factura' | 'Nota de Venta';
  serie: string;
  correlativo: string;
  total: number;
  fecha: Date;
  cliente: string;
}

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
      return of(resumen).pipe(delay(800));
    }
    return this.http.get<PedidoResumen[]>(`${this.apiUrl}/pedidos`);
  }

  getPedidoDetalle(id: string): Observable<PedidoDetalle | undefined> {
    if (environment.useMock) {
      const pedido = MOCK_PEDIDOS.find(p => p.id_pedido === id);
      if (!pedido) return of(undefined).pipe(delay(800));
      const detalle: PedidoDetalle = {
        ...pedido,
        total: calcularTotal(pedido.detalle),
      };
      return of(detalle).pipe(delay(800));
    }
    return this.http.get<PedidoDetalle>(`${this.apiUrl}/pedidos/${id}`);
  }

  getComprobantes(): Observable<Comprobante[]> {
    if (environment.useMock) {
      return of([...MOCK_COMPROBANTES] as Comprobante[]).pipe(delay(800));
    }
    return this.http.get<Comprobante[]>(`${this.apiUrl}/comprobantes`);
  }

  getComprobantesByTipo(tipo: string): Observable<Comprobante[]> {
    if (environment.useMock) {
      return of(MOCK_COMPROBANTES.filter(c => c.tipo === tipo) as Comprobante[]).pipe(delay(800));
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
      return of(total).pipe(delay(800));
    }
    return this.http.get<number>(`${this.apiUrl}/ventas-hoy`);
  }

  getPedidosDelDia(): Observable<number> {
    if (environment.useMock) {
      const hoy = new Date();
      const hoyStr = hoy.toDateString();
      const count = MOCK_PEDIDOS.filter(p => p.fecha_pedido.toDateString() === hoyStr).length;
      return of(count).pipe(delay(800));
    }
    return this.http.get<number>(`${this.apiUrl}/pedidos-hoy`);
  }
}
