import { Component, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { form, required, email, FormField } from '@angular/forms/signals';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './recuperar.component.html',
  styleUrl: './recuperar.component.css',
})
export class RecuperarComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private model = signal({ email: '' });
  protected recuperarForm = form(this.model, (f) => {
    required(f.email, { message: 'El email es obligatorio' });
    email(f.email, { message: 'Ingrese un email válido' });
  });

  readonly enviado = signal(false);
  readonly error = signal('');
  readonly loading = signal(false);

  recuperar(): void {
    if (this.recuperarForm().invalid()) return;
    this.loading.set(true);
    this.error.set('');
    this.http.post(`${environment.apiUrl}/auth/recuperar`, this.model()).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.enviado.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.enviado.set(true);
      },
    });
  }
}
