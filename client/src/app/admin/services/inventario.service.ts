import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Inventario } from '../models/inventario.model';
import { MovimientoInventario } from '../models/movimiento.model';
import { MOCK_INVENTARIO, MOCK_MOVIMIENTOS } from '../../core/mocks/inventario.mock';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly apiUrl = `${environment.apiUrl}/admin/inventario`;

  constructor(private http: HttpClient) {}

  getStock(): Observable<Inventario[]> {
    if (environment.useMock) return of([...MOCK_INVENTARIO]).pipe(delay(800));
    return this.http.get<Inventario[]>(this.apiUrl);
  }

  getLowStock(): Observable<Inventario[]> {
    if (environment.useMock) return of(MOCK_INVENTARIO.filter(i => i.stock_actual < i.stock_minimo)).pipe(delay(800));
    return this.http.get<Inventario[]>(`${this.apiUrl}?bajo=true`);
  }

  registerMovement(movimiento: Omit<MovimientoInventario, 'id_movimiento' | 'fecha'>): Observable<MovimientoInventario> {
    if (environment.useMock) {
      const nuevo: MovimientoInventario = {
        ...movimiento,
        id_movimiento: `mov-${Date.now()}`,
        fecha: new Date(),
      };
      MOCK_MOVIMIENTOS.unshift(nuevo);

      const inv = MOCK_INVENTARIO.find(i => i.id_producto === movimiento.id_producto);
      if (inv) {
        inv.stock_actual += movimiento.cantidad;
        inv.ultima_actualizacion = new Date();
      }

      return of(nuevo).pipe(delay(800));
    }
    return this.http.post<MovimientoInventario>(`${this.apiUrl}/movimientos`, movimiento);
  }

  getUltimosMovimientos(limit = 5): Observable<MovimientoInventario[]> {
    if (environment.useMock) return of(MOCK_MOVIMIENTOS.slice(0, limit) as MovimientoInventario[]).pipe(delay(800));
    return this.http.get<MovimientoInventario[]>(`${this.apiUrl}/movimientos?limit=${limit}`);
  }
}
