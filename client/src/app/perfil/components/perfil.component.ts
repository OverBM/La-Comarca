import { Component, inject, signal, computed, effect } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth.service';
import { DireccionService } from '../../shared/services/direccion.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CurrencyPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

interface InventarioItem {
  id_inventario: string;
  id_producto: string;
  stock_actual: number;
  stock_minimo: number;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormField, NavbarComponent, FooterComponent, CurrencyPipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  protected readonly authService = inject(AuthService);
  protected readonly direccionService = inject(DireccionService);
  protected esAdmin = computed(() => this.authService.authState().rol === 'admin');

  protected guardado = signal(false);
  protected passCambiada = signal(false);
  protected passError = signal('');
  protected negocioGuardado = signal(false);

  private readonly apiUrl = environment.apiUrl;

  private readonly meResource = httpResource<{ id_cliente: string }>(() => {
    if (this.esAdmin()) return undefined;
    return `${this.apiUrl}/clientes/me`;
  });

  protected direccionFormVisible = signal(false);
  private readonly direccionModel = signal({ calle: '', ciudad: '', referencia: '' });
  protected direccionForm = form(this.direccionModel, (f) => {
    required(f.calle, { message: 'La calle es obligatoria' });
    required(f.ciudad, { message: 'La ciudad es obligatoria' });
  });

  private readonly pedidosGestionadosResource = httpResource<number>(() => {
    if (!this.esAdmin()) return undefined;
    return `${this.apiUrl}/pedidos/pedidos-hoy`;
  });
  protected pedidosGestionados = computed(() => this.pedidosGestionadosResource.value() ?? 0);

  private readonly ingresosGeneradosResource = httpResource<number>(() => {
    if (!this.esAdmin()) return undefined;
    return `${this.apiUrl}/pedidos/ventas-hoy`;
  });
  protected ingresosGenerados = computed(() => this.ingresosGeneradosResource.value() ?? 0);

  private readonly stockBajoResource = httpResource<InventarioItem[]>(() => {
    if (!this.esAdmin()) return undefined;
    return `${this.apiUrl}/inventario?bajo=true`;
  });
  protected stockBajoCount = computed(() => this.stockBajoResource.value()?.length ?? 0);

  private readonly productosActivosResource = httpResource<{ cantidad: number }>(() => {
    if (!this.esAdmin()) return undefined;
    return `${this.apiUrl}/productos/count`;
  });
  protected productosActivos = computed(() => this.productosActivosResource.value()?.cantidad ?? 0);

  protected loadingStats = computed(() =>
    this.pedidosGestionadosResource.isLoading() ||
    this.ingresosGeneradosResource.isLoading() ||
    this.stockBajoResource.isLoading() ||
    this.productosActivosResource.isLoading()
  );

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

  private readonly saveProfileData = signal<{ nombre: string; apellido: string; email: string; telefono: string } | undefined>(undefined);
  private readonly saveProfileVersion = signal(0);
  private readonly saveProfileRes = httpResource(() => {
    this.saveProfileVersion();
    const data = this.saveProfileData();
    if (!data) return undefined;
    return { url: `${this.apiUrl}/clientes/me`, method: 'PUT' as const, body: data };
  });

  private readonly passData = signal<{ password_actual: string; password_nueva: string } | undefined>(undefined);
  private readonly passVersion = signal(0);
  private readonly passRes = httpResource(() => {
    this.passVersion();
    const data = this.passData();
    if (!data) return undefined;
    return { url: `${this.apiUrl}/auth/cambiar-password`, method: 'POST' as const, body: data };
  });

  constructor() {
    const state = this.authService.authState();
    this.perfilModel.set({
      nombre: state.nombre ?? '',
      apellido: state.apellido ?? '',
      email: state.email ?? '',
      telefono: state.telefono ?? '',
    });

    effect(() => {
      const err = this.passRes.error();
      if (err) {
        this.passError.set((err as any)?.error?.detail ?? 'Error al cambiar la contraseña');
      }
    });

    effect(() => {
      const cliente = this.meResource.value();
      if (cliente?.id_cliente) {
        this.direccionService.cargarDirecciones(cliente.id_cliente);
      }
    });
  }

  guardarInfo(): void {
    if (this.perfilForm().invalid()) return;
    if (this.esAdmin()) {
      this.guardado.set(true);
      setTimeout(() => this.guardado.set(false), 2000);
      return;
    }
    const { nombre, apellido, email, telefono } = this.perfilModel();
    this.saveProfileData.set({ nombre, apellido, email, telefono });
    this.saveProfileVersion.update(v => v + 1);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 2000);
  }

  cambiarPass(): void {
    if (this.passForm().invalid()) return;
    const { passActual, passNueva, passConfirmar } = this.passModel();
    if (passNueva !== passConfirmar) {
      this.passError.set('Las contraseñas no coinciden');
      return;
    }
    this.passError.set('');
    this.passData.set({ password_actual: passActual, password_nueva: passNueva });
    this.passVersion.update(v => v + 1);
    this.passCambiada.set(true);
    this.passModel.set({ passActual: '', passNueva: '', passConfirmar: '' });
    setTimeout(() => this.passCambiada.set(false), 2000);
  }

  guardarNegocio(): void {
    if (this.negocioForm().invalid()) return;
    this.negocioGuardado.set(true);
    setTimeout(() => this.negocioGuardado.set(false), 2000);
  }

  guardarDireccion(): void {
    if (this.direccionForm().invalid()) return;
    const { calle, ciudad, referencia } = this.direccionModel();
    this.direccionService.agregarDireccion({ calle, ciudad, referencia: referencia || undefined });
    this.direccionModel.set({ calle: '', ciudad: '', referencia: '' });
    this.direccionFormVisible.set(false);
  }

  eliminarDireccion(id: string): void {
    this.direccionService.eliminarDireccion(id);
  }
}
