import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { form, required, email, minLength, validate, FormField } from '@angular/forms/signals';
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

  readonly empresa = signal(false);
  protected model = signal({ nombre: '', apellido: '', email: '', telefono: '', password: '', confirmar: '', ruc: '', razon_social: '' });
  protected registerForm = form(this.model, (f) => {
    required(f.nombre, { message: 'El nombre es obligatorio' });
    required(f.apellido, { message: 'El apellido es obligatorio' });
    required(f.email, { message: 'El email es obligatorio' });
    email(f.email, { message: 'Ingrese un email válido' });
    required(f.telefono, { message: 'El teléfono es obligatorio' });
    required(f.password, { message: 'La contraseña es obligatoria' });
    minLength(f.password, 8, { message: 'Mínimo 8 caracteres' });
    required(f.ruc, { message: 'El RUC es obligatorio', when: () => this.empresa() });
    required(f.razon_social, { message: 'La razón social es obligatoria', when: () => this.empresa() });
    validate(f.ruc, (ctx) => {
      const v = ctx.value();
      if (this.empresa() && v && !/^\d{11}$/.test(v)) return { kind: 'pattern', message: 'El RUC debe tener 11 dígitos' };
      return null;
    });
  });

  protected readonly passLengthOk = computed(() => this.model().password.length >= 8);
  protected readonly passUpperOk = computed(() => /[A-Z]/.test(this.model().password));
  protected readonly passDigitOk = computed(() => /\d/.test(this.model().password));

  error = signal('');
  loading = signal(false);

  registrar(): void {
    if (this.registerForm().invalid()) return;
    const { nombre, apellido, email, telefono, password, confirmar, ruc, razon_social } = this.model();
    if (password !== confirmar) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const payload: any = { nombre, apellido, email, telefono, password };
    if (this.empresa()) {
      payload.ruc = ruc;
      payload.razon_social = razon_social;
    }
    this.authService.register(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          this.router.navigateByUrl(returnUrl || '/');
        },
        error: (err) => {
          this.loading.set(false);
          const detail = err.error?.detail;
          if (Array.isArray(detail)) {
            this.error.set(detail.map((d: any) => d.msg).join('. '));
          } else {
            this.error.set(detail || 'Error al registrar');
          }
        },
      });
  }
}
