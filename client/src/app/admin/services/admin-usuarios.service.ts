import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../core/models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  private readonly versionRefresco = signal(0);

  private readonly usuariosResource = httpResource<Usuario[]>(() => {
    this.versionRefresco();
    return `${this.apiUrl}`;
  });

  readonly usuarios = computed(() => this.usuariosResource.value() ?? []);
  readonly cargando = computed(() => this.usuariosResource.isLoading());
  readonly error = computed(() => this.usuariosResource.error());

  cambiarRol(id: string, rol: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}/rol`, { rol });
  }

  recargar(): void {
    this.versionRefresco.update(v => v + 1);
  }
}
