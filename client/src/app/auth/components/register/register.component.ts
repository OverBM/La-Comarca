import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { environment } from '../../../../environments/environment';

interface RegisterResponse {
  access_token: string;
  id_usuario: string;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly destroy$ = new Subject<void>();
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  protected model = signal({ nombre: '', apellido: '', email: '', telefono: '', password: '', confirmar: '' });
  protected registerForm = form(this.model, (f) => {
    required(f.nombre, { message: 'El nombre es obligatorio' });
    required(f.apellido, { message: 'El apellido es obligatorio' });
    required(f.email, { message: 'El email es obligatorio' });
    email(f.email, { message: 'Ingrese un email válido' });
    required(f.telefono, { message: 'El teléfono es obligatorio' });
    required(f.password, { message: 'La contraseña es obligatoria' });
    minLength(f.password, 6, { message: 'Mínimo 6 caracteres' });
  });

  error = signal('');
  loading = signal(false);

  registrar(): void {
    if (this.registerForm().invalid()) return;
    const { nombre, apellido, email, telefono, password, confirmar } = this.model();
    if (password !== confirmar) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, { nombre, apellido, email, telefono, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.storage.setToken(res.access_token);
          this.storage.setUser(JSON.stringify({
            id_usuario: res.id_usuario,
            nombre: res.nombre,
            apellido: res.apellido,
            email: res.email,
            telefono: res.telefono,
            rol: res.rol,
          }));
          this.authService.authState.set({
            isAuthenticated: true,
            rol: res.rol,
            nombre: res.nombre,
            apellido: res.apellido,
            email: res.email,
            telefono: res.telefono,
          });
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          this.router.navigateByUrl(returnUrl || '/');
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.detail || 'Error al registrar');
        },
      });
  }
}