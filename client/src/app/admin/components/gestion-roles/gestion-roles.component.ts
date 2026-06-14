import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Usuario } from '../../../core/models/usuario.model';
import { DialogoConfirmacionComponent } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion.component';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [DialogoConfirmacionComponent],
  templateUrl: './gestion-roles.component.html',
  styleUrl: './gestion-roles.component.css',
})
export class GestionRolesComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly usuarios = toSignal(
    this.http.get<Usuario[]>(`${environment.apiUrl}/usuarios`),
    { initialValue: [] as Usuario[] },
  );

  readonly dialogVisible = signal(false);
  pendingChange: { id: string; email: string; nuevoRol: string } | null = null;
  readonly toastMsg = signal<string | null>(null);
  private pendingSelectEl: HTMLSelectElement | null = null;

  solicitarCambio(id: string, email: string, nuevoRol: string, event: Event): void {
    this.pendingSelectEl = event.target as HTMLSelectElement;
    this.pendingChange = { id, email, nuevoRol };
    this.dialogVisible.set(true);
  }

  confirmarCambio(): void {
    if (!this.pendingChange) return;
    const { id, nuevoRol } = this.pendingChange;
    this.http.put<Usuario>(`${environment.apiUrl}/usuarios/${id}/rol`, { rol: nuevoRol })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dialogVisible.set(false);
        this.pendingChange = null;
        this.pendingSelectEl = null;
        this.toastMsg.set('Rol actualizado correctamente');
        setTimeout(() => this.toastMsg.set(null), 2500);
      });
  }

  cancelarCambio(): void {
    this.dialogVisible.set(false);
    this.pendingChange = null;
    this.pendingSelectEl = null;
  }
}
