import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Direccion } from '../../core/models/direccion.model';

@Injectable({ providedIn: 'root' })
export class DireccionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly idCliente = signal<string | undefined>(undefined);
  private readonly versionRefresco = signal(0);

  private readonly direccionesResource = httpResource<Direccion[]>(() => {
    this.versionRefresco();
    const id = this.idCliente();
    if (!id) return undefined;
    return `${this.apiUrl}/clientes/${id}/direcciones`;
  });

  readonly direcciones = computed(() => this.direccionesResource.value() ?? []);
  readonly cargando = computed(() => this.direccionesResource.isLoading());
  readonly error = computed(() => this.direccionesResource.error());

  cargarDirecciones(idCliente: string): void {
    this.idCliente.set(idCliente);
  }

  recargarDirecciones(): void {
    if (this.idCliente()) {
      this.versionRefresco.update(v => v + 1);
    }
  }

  agregarDireccion(data: { calle: string; ciudad: string; referencia?: string }): Observable<Direccion> {
    const id = this.idCliente();
    if (!id) throw new Error('No hay cliente seleccionado');
    return this.http.post<Direccion>(`${this.apiUrl}/clientes/${id}/direcciones`, data);
  }

  eliminarDireccion(id: string): Observable<void> {
    const cliente = this.idCliente();
    if (!cliente) throw new Error('No hay cliente seleccionado');
    return this.http.delete<void>(`${this.apiUrl}/clientes/${cliente}/direcciones/${id}`);
  }
}
