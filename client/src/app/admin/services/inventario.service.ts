import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventario } from '../models/inventario.model';
import { MovimientoInventario, MovimientosPaginados } from '../models/movimiento.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventario`;

  getStock(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(this.apiUrl);
  }

  getLowStock(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiUrl}?bajo=true`);
  }

  registerMovement(movimiento: Omit<MovimientoInventario, 'id_movimiento' | 'fecha'>): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.apiUrl}/movimientos`, movimiento);
  }

  getUltimosMovimientos(limit = 5): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientosPaginados>(`${this.apiUrl}/movimientos?limit=${limit}`)
      .pipe(map(r => r.items));
  }

  getMovimientos(page = 1, limit = 10, desde?: string, hasta?: string): Observable<MovimientosPaginados> {
    let params = `?page=${page}&limit=${limit}`;
    if (desde) params += `&desde=${desde}`;
    if (hasta) params += `&hasta=${hasta}`;
    return this.http.get<MovimientosPaginados>(`${this.apiUrl}/movimientos${params}`);
  }
}
