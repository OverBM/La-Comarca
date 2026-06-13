import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DialogoConfirmacionComponent } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion.component';

interface Usuario {
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: string;
  activo: boolean;
}

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [DialogoConfirmacionComponent],
  templateUrl: './gestion-roles.component.html',
  styleUrl: './gestion-roles.component.css',
})
export class GestionRolesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  usuarios = signal<Usuario[]>([]);
  dialogVisible = signal(false);
  pendingChange: { id: string; email: string; nuevoRol: string } | null = null;
  toastMsg = signal<string | null>(null);
  private pendingSelectEl: HTMLSelectElement | null = null;

  ngOnInit(): void {
    this.http.get<Usuario[]>(`${environment.apiUrl}/usuarios`).subscribe(users => {
      this.usuarios.set(users);
    });
  }

  solicitarCambio(id: string, email: string, nuevoRol: string, event: Event): void {
    this.pendingSelectEl = event.target as HTMLSelectElement;
    this.pendingChange = { id, email, nuevoRol };
    this.dialogVisible.set(true);
  }

  confirmarCambio(): void {
    if (!this.pendingChange) return;
    const { id, nuevoRol } = this.pendingChange;
    this.http.put<Usuario>(`${environment.apiUrl}/usuarios/${id}/rol`, { rol: nuevoRol }).subscribe(user => {
      this.usuarios.update(list => list.map(u => u.id_usuario === id ? user : u));
      this.dialogVisible.set(false);
      this.pendingChange = null;
      this.pendingSelectEl = null;
      this.toastMsg.set(`Rol actualizado para ${user.email}`);
      setTimeout(() => this.toastMsg.set(null), 2500);
    });
  }

  cancelarCambio(): void {
    this.dialogVisible.set(false);
    this.pendingChange = null;
    this.pendingSelectEl = null;
  }
}
