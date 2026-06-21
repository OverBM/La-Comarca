import { Component, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { form, required, email, minLength, validate, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';
import { ClienteEmpresaService } from '../../core/services/cliente-empresa.service';
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
  private readonly clienteEmpresaService = inject(ClienteEmpresaService);
  protected readonly direccionService = inject(DireccionService);
  private readonly adminPedidosService = inject(AdminPedidosService);
  private readonly inventarioService = inject(InventarioService);
  private readonly adminProductosService = inject(AdminProductosService);
  private readonly destroyRef = inject(DestroyRef);
  protected esAdmin = computed(() => this.authService.authState().rol === 'admin');
  protected esVendedor = computed(() => this.authService.authState().rol === 'vendedor');
  protected readonly rolLabel = computed(() => {
    const r = this.authService.authState().rol;
    if (r === 'admin') return 'Administrador';
    if (r === 'vendedor') return 'Vendedor';
    return 'Cliente';
  });
  protected readonly empresa = signal<{ ruc: string; razon_social: string } | null>(null);
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
    this.adminPedidosService.getPedidosDelDia().pipe(catchError(() => of(0))),
    { initialValue: 0 },
  );

  protected readonly ingresosGenerados = toSignal(
    this.adminPedidosService.getVentasDelDia().pipe(catchError(() => of(0))),
    { initialValue: 0 },
  );

  protected readonly stockBajoCount = toSignal(
    this.inventarioService.getLowStock().pipe(catchError(() => of([])), map(a => a.length)),
    { initialValue: 0 },
  );

  protected readonly productosActivos = toSignal(
    this.adminProductosService.getProductosCount().pipe(catchError(() => of({ cantidad: 0 })), map(r => r.cantidad)),
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
    minLength(f.passNueva, 8, { message: 'Mínimo 8 caracteres' });
    required(f.passConfirmar, { message: 'Confirme la nueva contraseña' });
  });

  private readonly negocioModel = signal({ negocioNombre: '', negocioRuc: '', negocioDireccion: '', negocioTelefono: '' });
  protected negocioForm = form(this.negocioModel, (f) => {
    required(f.negocioNombre, { message: 'El nombre del negocio es obligatorio' });
    required(f.negocioRuc, { message: 'El RUC es obligatorio' });
  });

  private readonly empresaModel = signal({ ruc: '', razon_social: '' });
  protected empresaForm = form(this.empresaModel, (f) => {
    required(f.ruc, { message: 'El RUC es obligatorio' });
    required(f.razon_social, { message: 'La razón social es obligatoria' });
    validate(f.ruc, (ctx) => {
      const v = ctx.value();
      if (!v) return null;
      if (!/^\d{11}$/.test(v)) return { kind: 'pattern', message: 'El RUC debe tener 11 dígitos' };
      if (!/^(10|15|17|20)/.test(v)) return { kind: 'pattern', message: 'El RUC debe iniciar con 10, 15, 17 ó 20' };
      return null;
    });
  });
  protected empresaGuardada = signal(false);

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
          this.clienteEmpresaService.getByClienteId(cliente.id_cliente).pipe(
            takeUntilDestroyed(this.destroyRef),
          ).subscribe({
            next: (emp) => {
              this.empresa.set(emp);
              this.empresaModel.set({ ruc: emp.ruc, razon_social: emp.razon_social });
            },
            error: () => this.empresa.set(null),
          });
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
      } else if (this.esVendedor()) {
        const state = this.authService.authState();
        this.perfilModel.set({
          nombre: state.nombre ?? '',
          apellido: state.apellido ?? '',
          email: state.email ?? '',
          telefono: state.telefono ?? '',
        });
      }
    });
  }

  guardarInfo(): void {
    this.guardarError.set('');
    if (this.perfilForm().invalid()) return;
    if (this.esAdmin() || this.esVendedor()) {
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
    this.clienteService.cargar();
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

  guardarEmpresa(): void {
    if (this.empresaForm().invalid()) return;
    const cliente = this.clienteService.cliente();
    if (!cliente?.id_cliente) return;
    const { ruc, razon_social } = this.empresaModel();
    this.clienteEmpresaService.update(cliente.id_cliente, { ruc, razon_social }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (emp) => {
        this.empresa.set(emp);
        this.empresaGuardada.set(true);
        setTimeout(() => this.empresaGuardada.set(false), 2000);
      },
      error: () => {
        this.empresaGuardada.set(false);
      },
    });
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