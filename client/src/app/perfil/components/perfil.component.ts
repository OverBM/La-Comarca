import { Component, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth.service';
import { Cliente } from '../../core/models/cliente.model';
import { Inventario } from '../../admin/models/inventario.model';
import { DireccionService } from '../../shared/services/direccion.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CurrencyPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

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
  private readonly destroyRef = inject(DestroyRef);
  protected esAdmin = computed(() => this.authService.authState().rol === 'admin');

  protected guardado = signal(false);
  protected guardando = signal(false);
  protected guardarError = signal('');
  protected passCambiada = signal(false);
  protected passError = signal('');
  protected negocioGuardado = signal(false);

  private readonly apiUrl = environment.apiUrl;

  private readonly meVersion = signal(0);

  private readonly meResource = httpResource<Cliente>(() => {
    if (this.esAdmin()) return undefined;
    this.meVersion();
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

  private readonly stockBajoResource = httpResource<Inventario[]>(() => {
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

  constructor() {
    effect(() => {
      const cliente = this.meResource.value();
      if (cliente) {
        this.perfilModel.set({
          nombre: cliente.nombre ?? '',
          apellido: cliente.apellido ?? '',
          email: cliente.email ?? '',
          telefono: cliente.telefono ?? '',
        });
        if (cliente.id_cliente) {
          this.direccionService.cargarDirecciones(cliente.id_cliente);
        }
      }
    });
  }

  guardarInfo(): void {
    this.guardarError.set('');
    if (this.perfilForm().invalid()) return;
    if (this.esAdmin()) {
      this.guardado.set(true);
      setTimeout(() => this.guardado.set(false), 2000);
      return;
    }
    const { nombre, apellido, email, telefono } = this.perfilModel();
    this.guardando.set(true);
    this.authService.updateProfile({ nombre, apellido, email, telefono }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.authService.authState.update(s => ({ ...s, nombre, apellido, email, telefono }));
        this.authService.updateStoredUser({ nombre, apellido, email, telefono });
        this.meVersion.update(v => v + 1);
        this.guardando.set(false);
        this.guardado.set(true);
        setTimeout(() => this.guardado.set(false), 2000);
      },
      error: (err) => {
        this.guardando.set(false);
        this.guardarError.set(err.error?.detail ?? 'Error al guardar los cambios');
      },
    });
  }

  cambiarPass(): void {
    if (this.passForm().invalid()) return;
    const { passActual, passNueva, passConfirmar } = this.passModel();
    if (passNueva !== passConfirmar) {
      this.passError.set('Las contraseñas no coinciden');
      return;
    }
    this.passError.set('');
    this.authService.changePassword(passActual, passNueva).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.passCambiada.set(true);
        this.passModel.set({ passActual: '', passNueva: '', passConfirmar: '' });
        setTimeout(() => this.passCambiada.set(false), 2000);
      },
      error: (err) => {
        this.passError.set(err.error?.detail ?? 'Error al cambiar la contraseña');
      },
    });
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