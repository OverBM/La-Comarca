import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { TokenPayload } from '../../auth/models/token.model';

export interface AuthState {
  isAuthenticated: boolean;
  rol: string | null;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  id_usuario: string;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  readonly authState = signal<AuthState>({
    isAuthenticated: false,
    rol: null,
    nombre: null,
    apellido: null,
    email: null,
    telefono: null,
  });

  constructor(
    private readonly http: HttpClient,
    private readonly storage: StorageService,
  ) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const token = this.storage.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      if (payload) {
        this.authState.set({
          isAuthenticated: true,
          rol: payload.rol,
          nombre: payload.nombre,
          apellido: payload.apellido,
          email: payload.email,
          telefono: payload.telefono,
        });
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => this.handleLoginSuccess(res)),
    );
  }

  private handleLoginSuccess(res: LoginResponse): void {
    this.storage.setToken(res.access_token);
    this.storage.setUser(JSON.stringify({
      id_usuario: res.id_usuario,
      nombre: res.nombre,
      apellido: res.apellido,
      email: res.email,
      telefono: res.telefono,
      rol: res.rol,
    }));
    this.authState.set({
      isAuthenticated: true,
      rol: res.rol,
      nombre: res.nombre,
      apellido: res.apellido,
      email: res.email,
      telefono: res.telefono,
    });
  }

  logout(): void {
    this.storage.clearToken();
    this.authState.set({
      isAuthenticated: false,
      rol: null,
      nombre: null,
      apellido: null,
      email: null,
      telefono: null,
    });
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  changePassword(passwordActual: string, passwordNueva: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/cambiar-password`, {
      password_actual: passwordActual,
      password_nueva: passwordNueva,
    });
  }

  updateProfile(data: { nombre?: string; apellido?: string; email?: string; telefono?: string }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/clientes/me`, data);
  }

  getRol(): string | null {
    const token = this.storage.getToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    return payload?.rol ?? null;
  }
}
