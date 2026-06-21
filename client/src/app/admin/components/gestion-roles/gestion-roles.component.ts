import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminUsuariosService } from '../../services/admin-usuarios.service';
import { DialogoConfirmacionComponent } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion.component';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [DialogoConfirmacionComponent],
  templateUrl: './gestion-roles.component.html',
  styleUrl: './gestion-roles.component.css',
})
export class GestionRolesComponent {
  private readonly adminUsuariosService = inject(AdminUsuariosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly usuarios = this.adminUsuariosService.usuarios;
  readonly filtro = signal('');

  readonly usuariosFiltrados = computed(() => {
    const f = this.filtro().toLowerCase();
    if (!f) return this.usuarios();
    return this.usuarios().filter(u =>
      u.nombre.toLowerCase().includes(f) ||
      u.apellido.toLowerCase().includes(f) ||
      u.email.toLowerCase().includes(f)
    );
  });

  readonly dialogVisible = signal(false);
  pendingChange: { id: string; email: string; rolActual: string; nuevoRol: string } | null = null;
  readonly toastMsg = signal<string | null>(null);
  private pendingSelectEl: HTMLSelectElement | null = null;

  solicitarCambio(id: string, email: string, rolActual: string, nuevoRol: string, event: Event): void {
    this.pendingSelectEl = event.target as HTMLSelectElement;
    this.pendingChange = { id, email, rolActual, nuevoRol };
    this.dialogVisible.set(true);
  }

  confirmarCambio(): void {
    if (!this.pendingChange) return;
    const { id, nuevoRol } = this.pendingChange;
    this.adminUsuariosService.cambiarRol(id, nuevoRol)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.dialogVisible.set(false);
          this.pendingChange = null;
          this.pendingSelectEl = null;
          this.adminUsuariosService.recargar();
          this.toastMsg.set('Rol actualizado correctamente');
          setTimeout(() => this.toastMsg.set(null), 2500);
        },
        error: () => {
          this.toastMsg.set('Error al actualizar el rol');
          setTimeout(() => this.toastMsg.set(null), 2500);
        },
      });
  }

  cancelarCambio(): void {
    if (this.pendingSelectEl && this.pendingChange) {
      this.pendingSelectEl.value = this.pendingChange.rolActual;
    }
    this.dialogVisible.set(false);
    this.pendingChange = null;
    this.pendingSelectEl = null;
  }
}
