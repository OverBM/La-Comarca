import { Component, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';
import { DireccionService } from '../../shared/services/direccion.service';
import { AdminPedidosService } from '../../admin/services/admin-pedidos.service';
import { InventarioService } from '../../admin/services/inventario.service';
import { AdminProductosService } from '../../admin/services/admin-productos.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormField, NavbarComponent, FooterComponent, CurrencyPipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  protected readonly authService = inject(AuthService);
  protected readonly clienteService = inject(ClienteService);
  protected readonly direccionService = inject(DireccionService);
  private readonly adminPedidosService = inject(AdminPedidosService);
  private readonly inventarioService = inject(InventarioService);
  private readonly adminProductosService = inject(AdminProductosService);
  private readonly destroyRef = inject(DestroyRef);
  protected esAdmin = computed(() => this.authService.authState().rol === 'admin');
  protected readonly iniciales = computed(() => {
    const s = this.authService.authState();
    return (s.nombre?.charAt(0) ?? '') + (s.apellido?.charAt(0) ?? '');
  });

  protected guardado = signal(false);
  protected guardando = signal(false);
  protected guardarError = signal('');
  protected passCambiada = signal(false);
  protected passError = signal('');
  protected negocioGuardado = signal(false);

  protected direccionFormVisible = signal(false);
  private readonly direccionModel = signal({ calle: '', ciudad: '', referencia: '' });
  protected direccionForm = form(this.direccionModel, (f) => {
    required(f.calle, { message: 'La calle es obligatoria' });
    required(f.ciudad, { message: 'La ciudad es obligatoria' });
  });

  protected readonly pedidosGestionados = toSignal(
    this.adminPedidosService.getPedidosDelDia(),
    { initialValue: 0 },
  );

  protected readonly ingresosGenerados = toSignal(
    this.adminPedidosService.getVentasDelDia(),
    { initialValue: 0 },
  );

  protected readonly stockBajoCount = toSignal(
    this.inventarioService.getLowStock().pipe(map(a => a.length)),
    { initialValue: 0 },
  );

  protected readonly productosActivos = toSignal(
    this.adminProductosService.getProductosCount().pipe(map(r => r.cantidad)),
    { initialValue: 0 },
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
    this.clienteService.cargar();

    effect(() => {
      const cliente = this.clienteService.cliente();
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
      } else if (this.esAdmin()) {
        const state = this.authService.authState();
        this.perfilModel.set({
          nombre: state.nombre ?? '',
          apellido: state.apellido ?? '',
          email: state.email ?? '',
          telefono: state.telefono ?? '',
        });
        this.negocioModel.set({
          negocioNombre: state.nombre ?? '',
          negocioRuc: '',
          negocioDireccion: '',
          negocioTelefono: state.telefono ?? '',
        });
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
        this.clienteService.recargar();
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
    this.direccionService.agregarDireccion({ calle, ciudad, referencia: referencia || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.direccionService.recargarDirecciones();
          this.direccionModel.set({ calle: '', ciudad: '', referencia: '' });
          this.direccionFormVisible.set(false);
        },
        error: () => {
          // error handled via DireccionService.error signal
        },
      });
  }

  eliminarDireccion(id: string): void {
    this.direccionService.eliminarDireccion(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.direccionService.recargarDirecciones(),
        error: () => {
          // error handled via DireccionService.error signal
        },
      });
  }
}