import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClienteEmpresa } from '../models/cliente-empresa.model';

@Injectable({ providedIn: 'root' })
export class ClienteEmpresaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getByClienteId(id_cliente: string): Observable<ClienteEmpresa> {
    return this.http.get<ClienteEmpresa>(`${this.apiUrl}/clientes-empresa/${id_cliente}`);
  }

  update(id_cliente: string, data: Partial<ClienteEmpresa>): Observable<ClienteEmpresa> {
    return this.http.put<ClienteEmpresa>(`${this.apiUrl}/clientes-empresa/${id_cliente}`, data);
  }
}
