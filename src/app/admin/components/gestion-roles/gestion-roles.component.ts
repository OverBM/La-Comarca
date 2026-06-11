/** Componente para la gestión de roles y permisos de usuarios desde el panel admin */
import { Component, signal } from '@angular/core';
import { MOCK_USUARIOS, MockUsuario } from '../../../core/mocks/usuarios.mock';
import { DialogoConfirmacionComponent } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion.component';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [DialogoConfirmacionComponent],
  templateUrl: './gestion-roles.component.html',
  styleUrl: './gestion-roles.component.css',
})
export class GestionRolesComponent {
  usuarios = signal<MockUsuario[]>(Object.values(MOCK_USUARIOS));
  dialogVisible = signal(false);
  pendingChange: { email: string; nuevoRol: 'admin' | 'cliente' } | null = null;
  toastMsg = signal<string | null>(null);
  private pendingSelectEl: HTMLSelectElement | null = null;

  solicitarCambio(email: string, nuevoRol: 'admin' | 'cliente', event: Event): void {
    this.pendingSelectEl = event.target as HTMLSelectElement;
    this.pendingChange = { email, nuevoRol };
    this.dialogVisible.set(true);
  }

  confirmarCambio(): void {
    if (!this.pendingChange) return;
    const { email, nuevoRol } = this.pendingChange;
    MOCK_USUARIOS[email].rol = nuevoRol;
    this.usuarios.set(Object.values(MOCK_USUARIOS));
    this.dialogVisible.set(false);
    this.pendingChange = null;
    this.pendingSelectEl = null;
    this.toastMsg.set(`Rol actualizado para ${email}`);
    setTimeout(() => this.toastMsg.set(null), 2500);
  }

  cancelarCambio(): void {
    if (this.pendingChange && this.pendingSelectEl) {
      this.pendingSelectEl.value = MOCK_USUARIOS[this.pendingChange.email].rol;
    }
    this.dialogVisible.set(false);
    this.pendingChange = null;
    this.pendingSelectEl = null;
  }
}
