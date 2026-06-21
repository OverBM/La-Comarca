import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { form, required, minLength, FormField } from '@angular/forms/signals';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-restablecer',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './restablecer.component.html',
  styleUrl: './restablecer.component.css',
})
export class RestablecerComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected model = signal({ nueva_password: '' });
  protected resetForm = form(this.model, (f) => {
    required(f.nueva_password, { message: 'La contraseña es obligatoria' });
    minLength(f.nueva_password, 8, { message: 'Mínimo 8 caracteres' });
  });

  readonly success = signal(false);
  readonly error = signal('');
  readonly loading = signal(false);

  protected readonly token = this.route.snapshot.queryParamMap.get('token') || '';
  protected readonly passLengthOk = computed(() => this.model().nueva_password.length >= 8);
  protected readonly passUpperOk = computed(() => /[A-Z]/.test(this.model().nueva_password));
  protected readonly passDigitOk = computed(() => /\d/.test(this.model().nueva_password));

  restablecer(): void {
    if (this.resetForm().invalid() || !this.token) return;
    this.loading.set(true);
    this.error.set('');
    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      nueva_password: this.model().nueva_password,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err.error?.detail;
        if (Array.isArray(detail)) {
          this.error.set(detail.map((d: any) => d.msg).join('. '));
        } else {
          this.error.set(detail || 'El enlace no es válido o ha expirado');
        }
      },
    });
  }
}
