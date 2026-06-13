import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventario } from '../models/inventario.model';
import { MovimientoInventario } from '../models/movimiento.model';

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
    return this.http.get<MovimientoInventario[]>(`${this.apiUrl}/movimientos?limit=${limit}`);
  }
}
