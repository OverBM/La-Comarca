import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Producto } from '../models/producto.model';
import { Categoria } from '../models/categoria.model';
import { MOCK_PRODUCTOS } from '../../core/mocks/productos.mock';
import { MOCK_CATEGORIAS } from '../../core/mocks/categorias.mock';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    if (environment.useMock) return of(MOCK_PRODUCTOS).pipe(delay(800));
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getProductoById(id: string): Observable<Producto | undefined> {
    if (environment.useMock) return of(MOCK_PRODUCTOS.find(p => p.id_producto === id)).pipe(delay(800));
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  searchProductos(query: string): Observable<Producto[]> {
    if (environment.useMock) {
      const q = query.toLowerCase();
      return of(MOCK_PRODUCTOS.filter(p => p.nombre.toLowerCase().includes(q))).pipe(delay(800));
    }
    return this.http.get<Producto[]>(`${this.apiUrl}?q=${query}`);
  }

  getProductosByCategoria(categoriaId: string): Observable<Producto[]> {
    if (environment.useMock) return of(MOCK_PRODUCTOS.filter(p => p.id_categoria === categoriaId)).pipe(delay(800));
    return this.http.get<Producto[]>(`${this.apiUrl}?categoria=${categoriaId}`);
  }

  getCategorias(): Observable<Categoria[]> {
    if (environment.useMock) return of(MOCK_CATEGORIAS).pipe(delay(800));
    return this.http.get<Categoria[]>(`${environment.apiUrl}/categorias`);
  }

  getFeaturedProductos(): Observable<Producto[]> {
    if (environment.useMock) return of(MOCK_PRODUCTOS.slice(0, 4)).pipe(delay(800));
    return this.http.get<Producto[]>(`${this.apiUrl}?destacados=true`);
  }
}
