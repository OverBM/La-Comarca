import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Producto } from '../../core/models/producto.model';
import { Categoria } from '../../core/models/categoria.model';
import { MOCK_PRODUCTOS } from '../../core/mocks/productos.mock';
import { MOCK_CATEGORIAS } from '../../core/mocks/categorias.mock';
import { RETARDO_MOCK, LIMITE_PRODUCTOS_RELACIONADOS } from '../../core/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    if (environment.useMock) return of(MOCK_PRODUCTOS).pipe(delay(RETARDO_MOCK));
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getProductoById(id: string): Observable<Producto | undefined> {
    if (environment.useMock) return of(MOCK_PRODUCTOS.find(p => p.id_producto === id)).pipe(delay(RETARDO_MOCK));
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  searchProductos(query: string): Observable<Producto[]> {
    if (environment.useMock) {
      const q = query.toLowerCase();
      return of(MOCK_PRODUCTOS.filter(p => p.nombre.toLowerCase().includes(q))).pipe(delay(RETARDO_MOCK));
    }
    return this.http.get<Producto[]>(`${this.apiUrl}?q=${query}`);
  }

  getProductosByCategoria(categoriaId: string): Observable<Producto[]> {
    if (environment.useMock) return of(MOCK_PRODUCTOS.filter(p => p.id_categoria === categoriaId)).pipe(delay(RETARDO_MOCK));
    return this.http.get<Producto[]>(`${this.apiUrl}?categoria=${categoriaId}`);
  }

  getCategorias(): Observable<Categoria[]> {
    if (environment.useMock) return of(MOCK_CATEGORIAS).pipe(delay(RETARDO_MOCK));
    return this.http.get<Categoria[]>(`${environment.apiUrl}/categorias`);
  }

  getFeaturedProductos(): Observable<Producto[]> {
    if (environment.useMock) return of(MOCK_PRODUCTOS.slice(0, LIMITE_PRODUCTOS_RELACIONADOS)).pipe(delay(RETARDO_MOCK));
    return this.http.get<Producto[]>(`${this.apiUrl}?destacados=true`);
  }
}
