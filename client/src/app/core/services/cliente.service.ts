import { Injectable, inject, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly apiUrl = `${environment.apiUrl}/clientes/me`;

  private readonly versionRefresco = signal(0);

  private readonly recursoCliente = httpResource<Cliente>(() => {
    this.versionRefresco();
    return this.apiUrl;
  });

  readonly cliente = computed(() => {
    try {
      return this.recursoCliente.value() ?? undefined;
    } catch {
      return undefined;
    }
  });
  readonly cargando = computed(() => this.recursoCliente.isLoading());
  readonly error = computed(() => this.recursoCliente.error() as Error | undefined);

  cargar(): void {
    this.versionRefresco.update(v => v + 1);
  }
}
