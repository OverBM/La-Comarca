import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Producto } from '../../core/models/producto.model';
import { MOCK_PRODUCTOS } from '../../core/mocks/productos.mock';
import { RETARDO_MOCK } from '../../core/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class AdminProductosService {
  private readonly apiUrl = `${environment.apiUrl}/admin/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    if (environment.useMock) return of([...MOCK_PRODUCTOS]).pipe(delay(RETARDO_MOCK));
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getProductosByCategoria(categoriaId: string): Observable<Producto[]> {
    if (environment.useMock) return of(MOCK_PRODUCTOS.filter(p => p.id_categoria === categoriaId)).pipe(delay(RETARDO_MOCK));
    return this.http.get<Producto[]>(`${this.apiUrl}?categoria=${categoriaId}`);
  }

  createProducto(producto: Omit<Producto, 'id_producto'>): Observable<Producto> {
    if (environment.useMock) {
      const nuevo = { ...producto, id_producto: `prod-${Date.now()}` };
      MOCK_PRODUCTOS.push(nuevo);
      return of(nuevo).pipe(delay(RETARDO_MOCK));
    }
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  updateProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    if (environment.useMock) {
      const idx = MOCK_PRODUCTOS.findIndex(p => p.id_producto === id);
      if (idx !== -1) MOCK_PRODUCTOS[idx] = { ...MOCK_PRODUCTOS[idx], ...producto };
      return of(MOCK_PRODUCTOS[idx]).pipe(delay(RETARDO_MOCK));
    }
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  deleteProducto(id: string): Observable<void> {
    if (environment.useMock) {
      const idx = MOCK_PRODUCTOS.findIndex(p => p.id_producto === id);
      if (idx !== -1) MOCK_PRODUCTOS.splice(idx, 1);
      return of(void 0).pipe(delay(RETARDO_MOCK));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
