import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Direccion } from '../../core/models/direccion.model';

@Injectable({ providedIn: 'root' })
export class DireccionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly direccionesSignal = signal<Direccion[]>([]);
  readonly direcciones = this.direccionesSignal.asReadonly();

  cargarDirecciones(idCliente: string): void {
    this.http.get<Direccion[]>(`${this.apiUrl}/clientes/${idCliente}/direcciones`).subscribe(dirs => {
      this.direccionesSignal.set(dirs);
    });
  }

  agregarDireccion(idCliente: string, data: Omit<Direccion, 'id_direccion' | 'id_cliente'>): Observable<Direccion> {
    return this.http.post<Direccion>(`${this.apiUrl}/clientes/${idCliente}/direcciones`, data);
  }

  eliminarDireccion(id: string): void {
    this.direccionesSignal.update(list => list.filter(d => d.id_direccion !== id));
  }
}
