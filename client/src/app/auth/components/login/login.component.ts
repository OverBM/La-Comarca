import { Component, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly route = inject(ActivatedRoute);

  private model = signal({ email: '', password: '' });
  protected loginForm = form(this.model, (f) => {
    required(f.email, { message: 'El email es obligatorio' });
    email(f.email, { message: 'Ingrese un email válido' });
    required(f.password, { message: 'La contraseña es obligatoria' });
    minLength(f.password, 6, { message: 'Mínimo 6 caracteres' });
  });

  error = signal('');
  loading = signal(false);
  protected recordarme = signal(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login(): void {
    if (this.loginForm().invalid()) return;

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.model();
    this.authService.login(email, password, this.recordarme()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (res.rol === 'admin' || res.rol === 'vendedor') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Credenciales incorrectas');
      },
    });
  }
}
