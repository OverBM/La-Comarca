import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { form, required, FormField } from '@angular/forms/signals';
import { CarritoService } from '../../../shared/services/carrito.service';
import { DireccionService } from '../../../shared/services/direccion.service';
import { AuthService } from '../../../core/services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DialogoConfirmacionComponent } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [RouterLink, FormField, FormatoPrecioPipe, LoadingComponent, NavbarComponent, FooterComponent, DialogoConfirmacionComponent],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent {
  protected readonly carritoService = inject(CarritoService);
  protected readonly direccionService = inject(DireccionService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly apiUrl = environment.apiUrl;

  protected selectedAddressId = signal<string | null>(null);
  protected recogerEnTienda = signal(false);

  protected seleccionarDelivery(): void {
    this.recogerEnTienda.set(false);
    if (this.authService.authState().isAuthenticated) {
      this.direccionService.recargarDirecciones();
    }
  }

  protected seleccionarRecoger(): void {
    this.recogerEnTienda.set(true);
  }
  protected agregandoDireccion = signal(false);
  protected addedProducts = signal<Set<string>>(new Set());

  protected readonly relacionadosResource = httpResource<Producto[]>(() => `${this.apiUrl}/productos?destacados=true`);
  protected readonly relacionados = computed(() => this.relacionadosResource.value() ?? []);
  protected readonly loading = computed(() => this.relacionadosResource.isLoading());

  readonly envio = computed(() => this.recogerEnTienda() ? 0 : (this.carritoService.total() > 50 ? 0 : 5.90));
  readonly totalFinal = computed(() => this.carritoService.total() + this.envio());

  protected pendingAction = signal<{ id: string; tipo: 'eliminar' | 'decrementar' } | null>(null);

  protected readonly mensajeDialogo = computed(() => {
    const action = this.pendingAction();
    if (!action) return '';
    return action.tipo === 'eliminar'
      ? '¿Estás seguro de eliminar este producto del carrito?'
      : '¿Estás seguro de eliminar este producto? Al disminuir la cantidad quedará en 0.';
  });

  protected readonly addedSet = this.addedProducts.asReadonly();

  private direccionModel = signal({ calle: '', ciudad: '', referencia: '' });
  protected direccionForm = form(this.direccionModel, (f) => {
    required(f.calle, { message: 'La calle es obligatoria' });
    required(f.ciudad, { message: 'La ciudad es obligatoria' });
  });

  private readonly meResource = httpResource<{ id_cliente: string }>(() => {
    if (!this.authService.authState().isAuthenticated) return undefined;
    return `${this.apiUrl}/clientes/me`;
  });

  private readonly pedidoVersion = signal(0);
  private readonly pedidoBody = signal<{ id_cliente: string; items: { id_producto: string; cantidad: number }[] } | undefined>(undefined);
  private readonly pedidoResource = httpResource(() => {
    this.pedidoVersion();
    const body = this.pedidoBody();
    if (!body) return undefined;
    return { url: `${this.apiUrl}/pedidos`, method: 'POST' as const, body };
  });

  constructor() {
    const saved = localStorage.getItem('la-comarca-direccion');
    if (saved) {
      try {
        this.direccionModel.set(JSON.parse(saved));
      } catch { }
    }

    effect(() => {
      const addr = this.direccionModel();
      localStorage.setItem('la-comarca-direccion', JSON.stringify(addr));
    });

    effect(() => {
      const cliente = this.meResource.value();
      if (cliente?.id_cliente) {
        this.direccionService.cargarDirecciones(cliente.id_cliente);
      }
    });

    effect(() => {
      const value = this.pedidoResource.value() as { id_pedido?: string } | undefined;
      if (value?.id_pedido) {
        this.carritoService.limpiar();
        this.router.navigate(['/pedidos']);
      }
    });
  }

  irALogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/carrito' } });
  }

  agregarAlCarrito(p: Producto): void {
    this.carritoService.agregarItem(p, 1);
    const id = p.id_producto;
    this.addedProducts.update(s => new Set(s).add(id));
    setTimeout(() => this.addedProducts.update(s => { const n = new Set(s); n.delete(id); return n; }), 1500);
  }

  finalizarPedido(): void {
    if (!this.authService.authState().isAuthenticated) {
      this.irALogin();
      return;
    }
    const items = this.carritoService.items().map(i => ({
      id_producto: i.id_producto,
      cantidad: i.cantidad,
    }));
    if (items.length === 0) return;

    const cliente = this.meResource.value();
    if (!cliente?.id_cliente) return;
    this.pedidoBody.set({ id_cliente: cliente.id_cliente, items });
    this.pedidoVersion.update(v => v + 1);
  }

  incrementar(id: string): void {
    const item = this.carritoService.items().find(i => i.id_producto === id);
    if (item) this.carritoService.actualizarCantidad(id, item.cantidad + 1);
  }

  decrementar(id: string): void {
    const item = this.carritoService.items().find(i => i.id_producto === id);
    if (!item) return;
    if (item.cantidad === 1) {
      this.pendingAction.set({ id, tipo: 'decrementar' });
    } else {
      this.carritoService.actualizarCantidad(id, item.cantidad - 1);
    }
  }

  solicitarEliminar(id: string): void {
    this.pendingAction.set({ id, tipo: 'eliminar' });
  }

  confirmarAccion(): void {
    const action = this.pendingAction();
    if (action) this.carritoService.eliminarItem(action.id);
    this.pendingAction.set(null);
  }

  cancelarAccion(): void {
    this.pendingAction.set(null);
  }

  toggleDireccionForm(): void {
    this.agregandoDireccion.update(v => !v);
  }

  guardarNuevaDireccion(): void {
    if (this.direccionForm().invalid()) return;
    const { calle, ciudad, referencia } = this.direccionModel();
    this.direccionService.agregarDireccion({ calle, ciudad, referencia: referencia || undefined });
    this.direccionModel.set({ calle: '', ciudad: '', referencia: '' });
    this.agregandoDireccion.set(false);
  }

  eliminarDireccion(id: string): void {
    this.direccionService.eliminarDireccion(id);
  }
}