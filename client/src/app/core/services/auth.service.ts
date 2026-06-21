import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { TokenPayload } from '../../auth/models/token.model';
import { AuthState, LoginResponse } from '../models/auth.model';

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

  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  constructor() {
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

  login(email: string, password: string, recordarme = true): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        this.storage.setPersist(recordarme);
        this.handleLoginSuccess(res);
      }),
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

  register(data: { nombre: string; apellido: string; email: string; telefono: string; password: string; ruc?: string; razon_social?: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleLoginSuccess(res)),
    );
  }

  updateProfile(data: { nombre?: string; apellido?: string; email?: string; telefono?: string }): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${environment.apiUrl}/clientes/me`, data);
  }

  updateStoredUser(data: { nombre: string; apellido: string; email: string; telefono: string }): void {
    const raw = this.storage.getUser();
    if (raw) {
      const user = JSON.parse(raw);
      user.nombre = data.nombre;
      user.apellido = data.apellido;
      user.email = data.email;
      user.telefono = data.telefono;
      this.storage.setUser(JSON.stringify(user));
    }
  }

  getRol(): string | null {
    const token = this.storage.getToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    return payload?.rol ?? null;
  }
}
