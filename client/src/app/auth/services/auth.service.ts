import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../core/services/storage.service';
import { Token, TokenPayload } from '../models/token.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  readonly authState = signal<{ isAuthenticated: boolean; rol: string | null; nombre: string | null }>({
    isAuthenticated: false,
    rol: null,
    nombre: null,
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
        this.authState.set({ isAuthenticated: true, rol: payload.rol, nombre: payload.nombre });
      }
    }
  }

  login(email: string, password: string): Observable<{ token: string; usuario: { id_usuario: string; nombre: string; rol: string } }> {
    if (environment.useMock) {
      return this.mockLogin(email, password);
    }
    return this.http.post<{ token: string; usuario: { id_usuario: string; nombre: string; rol: string } }>(
      `${this.apiUrl}/login`, { email, password }
    ).pipe(
      tap(res => this.handleLoginSuccess(res.token, res.usuario)),
    );
  }

  private mockLogin(email: string, password: string): Observable<{ token: string; usuario: { id_usuario: string; nombre: string; rol: string } }> {
    const users: Record<string, { id_usuario: string; nombre: string; password: string; rol: 'admin' | 'cliente' }> = {
      'admin@comarca.com': { id_usuario: 'usr-001', nombre: 'Admin La Comarca', password: 'admin123', rol: 'admin' },
      'cliente@comarca.com': { id_usuario: 'usr-002', nombre: 'Cliente Demo', password: 'cliente123', rol: 'cliente' },
    };

    const user = users[email];
    if (!user || user.password !== password) {
      return throwError(() => new Error('Credenciales incorrectas')).pipe(delay(800));
    }

    const tokenPayload: TokenPayload = { sub: user.id_usuario, email, rol: user.rol, nombre: user.nombre };
    const fakeToken = btoa(JSON.stringify(tokenPayload));

    return of({
      token: fakeToken,
      usuario: { id_usuario: user.id_usuario, nombre: user.nombre, rol: user.rol },
    }).pipe(
      delay(800),
      tap(res => this.handleLoginSuccess(res.token, res.usuario)),
    );
  }

  private handleLoginSuccess(token: string, usuario: { id_usuario: string; nombre: string; rol: string }): void {
    this.storage.setToken(token);
    this.storage.setUser(JSON.stringify(usuario));
    this.authState.set({ isAuthenticated: true, rol: usuario.rol, nombre: usuario.nombre });
  }

  logout(): void {
    this.storage.clearToken();
    this.authState.set({ isAuthenticated: false, rol: null, nombre: null });
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
