import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { RETARDO_MOCK } from '../constants/app.constants';
import { MOCK_USUARIOS } from '../mocks/usuarios.mock';
import { TokenPayload } from '../../auth/models/token.model';

export interface AuthState {
  isAuthenticated: boolean;
  rol: string | null;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
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
    private http: HttpClient,
    private storage: StorageService,
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

  login(email: string, password: string): Observable<{ token: string; usuario: { id_usuario: string; nombre: string; apellido: string; email: string; telefono: string; rol: string } }> {
    if (environment.useMock) {
      return this.mockLogin(email, password);
    }
    return this.http.post<{ token: string; usuario: { id_usuario: string; nombre: string; apellido: string; email: string; telefono: string; rol: string } }>(
      `${this.apiUrl}/login`, { email, password }
    ).pipe(
      tap(res => this.handleLoginSuccess(res.token, res.usuario)),
    );
  }

  private mockLogin(email: string, password: string): Observable<{ token: string; usuario: { id_usuario: string; nombre: string; apellido: string; email: string; telefono: string; rol: string } }> {
    const user = MOCK_USUARIOS[email];
    if (!user || user.password !== password) {
      return throwError(() => new Error('Credenciales incorrectas')).pipe(delay(RETARDO_MOCK));
    }

    const tokenPayload: TokenPayload = { sub: user.id_usuario, email, rol: user.rol, nombre: user.nombre, apellido: user.apellido, telefono: user.telefono };
    const fakeToken = btoa(JSON.stringify(tokenPayload));

    return of({
      token: fakeToken,
      usuario: { id_usuario: user.id_usuario, nombre: user.nombre, apellido: user.apellido, email: user.email, telefono: user.telefono, rol: user.rol },
    }).pipe(
      delay(RETARDO_MOCK),
      tap(res => this.handleLoginSuccess(res.token, res.usuario)),
    );
  }

  private handleLoginSuccess(token: string, usuario: { id_usuario: string; nombre: string; apellido: string; email: string; telefono: string; rol: string }): void {
    this.storage.setToken(token);
    this.storage.setUser(JSON.stringify(usuario));
    this.authState.set({
      isAuthenticated: true,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
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
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }

  getRol(): string | null {
    const token = this.storage.getToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    return payload?.rol ?? null;
  }
}
