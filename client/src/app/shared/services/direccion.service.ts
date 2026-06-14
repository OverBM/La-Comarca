import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Direccion } from '../../core/models/direccion.model';

@Injectable({ providedIn: 'root' })
export class DireccionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly idCliente = signal<string | undefined>(undefined);
  private readonly refreshVersion = signal(0);

  private readonly direccionesResource = httpResource<Direccion[]>(() => {
    this.refreshVersion();
    const id = this.idCliente();
    if (!id) return undefined;
    return `${this.apiUrl}/clientes/${id}/direcciones`;
  });

  readonly direcciones = computed(() => this.direccionesResource.value() ?? []);
  readonly loading = computed(() => this.direccionesResource.isLoading());

  cargarDirecciones(idCliente: string): void {
    this.idCliente.set(idCliente);
  }

  recargarDirecciones(): void {
    if (this.idCliente()) {
      this.refreshVersion.update(v => v + 1);
    }
  }

  agregarDireccion(data: { calle: string; ciudad: string; referencia?: string }): void {
    const id = this.idCliente();
    if (!id) return;
    this.http.post<Direccion>(`${this.apiUrl}/clientes/${id}/direcciones`, data)
      .subscribe(() => this.refreshVersion.update(v => v + 1));
  }

  eliminarDireccion(id: string): void {
    const cliente = this.idCliente();
    if (!cliente) return;
    this.http.delete(`${this.apiUrl}/clientes/${cliente}/direcciones/${id}`)
      .subscribe(() => this.refreshVersion.update(v => v + 1));
  }
}
