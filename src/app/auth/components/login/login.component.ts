/** Componente de inicio de sesión con formulario de email y contraseña */
import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly destroy$ = new Subject<void>();

  private model = signal({ email: '', password: '' });
  protected loginForm = form(this.model, (f) => {
    required(f.email, { message: 'El email es obligatorio' });
    email(f.email, { message: 'Ingrese un email válido' });
    required(f.password, { message: 'La contraseña es obligatoria' });
    minLength(f.password, 6, { message: 'Mínimo 6 caracteres' });
  });

  error = signal('');
  loading = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  login(): void {
    if (this.loginForm().invalid()) return;

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.model();
    this.authService.login(email, password).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.usuario.rol === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Credenciales incorrectas');
      },
    });
  }
}
