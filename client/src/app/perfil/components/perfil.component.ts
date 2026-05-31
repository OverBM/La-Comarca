import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PERFIL_ADMIN_MOCK } from '../../core/mocks/perfil-admin.mock';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FormatoPrecioPipe } from '../../shared/pipes/formato-precio.pipe';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, NavbarComponent, FooterComponent, FormatoPrecioPipe, DatePipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  protected authService = inject(AuthService);
  protected mock = PERFIL_ADMIN_MOCK;
  protected esAdmin = computed(() => this.authService.authState().rol === 'admin');

  protected nombre = signal('');
  protected apellido = signal('');
  protected email = signal('');
  protected telefono = signal('');

  protected passActual = signal('');
  protected passNueva = signal('');
  protected passConfirmar = signal('');

  protected negocioNombre = signal('');
  protected negocioRuc = signal('');
  protected negocioDireccion = signal('');
  protected negocioTelefono = signal('');

  protected guardado = signal(false);
  protected passCambiada = signal(false);
  protected negocioGuardado = signal(false);

  constructor() {
    const state = this.authService.authState();
    this.nombre.set(state.nombre ?? '');
    this.apellido.set(state.apellido ?? '');
    this.email.set(state.email ?? '');
    this.telefono.set(state.telefono ?? '');
    this.negocioNombre.set(this.mock.negocio.nombre);
    this.negocioRuc.set(this.mock.negocio.ruc);
    this.negocioDireccion.set(this.mock.negocio.direccion);
    this.negocioTelefono.set(this.mock.negocio.telefono);
  }

  guardarInfo(): void {
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 2000);
  }

  cambiarPass(): void {
    if (!this.passActual() || !this.passNueva() || this.passNueva() !== this.passConfirmar()) return;
    this.passCambiada.set(true);
    this.passActual.set('');
    this.passNueva.set('');
    this.passConfirmar.set('');
    setTimeout(() => this.passCambiada.set(false), 2000);
  }

  guardarNegocio(): void {
    this.negocioGuardado.set(true);
    setTimeout(() => this.negocioGuardado.set(false), 2000);
  }
}
