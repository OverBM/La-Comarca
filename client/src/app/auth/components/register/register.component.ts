import { Component, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

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

    this.authService.register({ nombre, apellido, email, telefono, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
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
