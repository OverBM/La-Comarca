import { Component, inject, signal, computed } from '@angular/core';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormField, NavbarComponent, FooterComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  protected readonly authService = inject(AuthService);
  protected esAdmin = computed(() => this.authService.authState().rol === 'admin');

  protected guardado = signal(false);
  protected passCambiada = signal(false);
  protected negocioGuardado = signal(false);

  private readonly perfilModel = signal({ nombre: '', apellido: '', email: '', telefono: '' });
  protected perfilForm = form(this.perfilModel, (f) => {
    required(f.nombre, { message: 'El nombre es obligatorio' });
    required(f.apellido, { message: 'El apellido es obligatorio' });
    required(f.email, { message: 'El email es obligatorio' });
    email(f.email, { message: 'Ingrese un email válido' });
  });

  private readonly passModel = signal({ passActual: '', passNueva: '', passConfirmar: '' });
  protected passForm = form(this.passModel, (f) => {
    required(f.passActual, { message: 'Ingrese su contraseña actual' });
    required(f.passNueva, { message: 'Ingrese la nueva contraseña' });
    minLength(f.passNueva, 6, { message: 'Mínimo 6 caracteres' });
    required(f.passConfirmar, { message: 'Confirme la nueva contraseña' });
  });

  private readonly negocioModel = signal({ negocioNombre: '', negocioRuc: '', negocioDireccion: '', negocioTelefono: '' });
  protected negocioForm = form(this.negocioModel, (f) => {
    required(f.negocioNombre, { message: 'El nombre del negocio es obligatorio' });
    required(f.negocioRuc, { message: 'El RUC es obligatorio' });
  });

  constructor() {
    const state = this.authService.authState();
    this.perfilModel.set({
      nombre: state.nombre ?? '',
      apellido: state.apellido ?? '',
      email: state.email ?? '',
      telefono: state.telefono ?? '',
    });
  }

  guardarInfo(): void {
    if (this.perfilForm().invalid()) return;
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 2000);
  }

  cambiarPass(): void {
    if (this.passForm().invalid()) return;
    const { passNueva, passConfirmar } = this.passModel();
    if (passNueva !== passConfirmar) return;
    this.passCambiada.set(true);
    this.passModel.set({ passActual: '', passNueva: '', passConfirmar: '' });
    setTimeout(() => this.passCambiada.set(false), 2000);
  }

  guardarNegocio(): void {
    if (this.negocioForm().invalid()) return;
    this.negocioGuardado.set(true);
    setTimeout(() => this.negocioGuardado.set(false), 2000);
  }
}
