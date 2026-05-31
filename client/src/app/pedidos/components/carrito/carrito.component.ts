import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CarritoService } from '../../../shared/services/carrito.service';
import { CatalogoService } from '../../../catalogo/services/catalogo.service';
import { DireccionService } from '../../../shared/services/direccion.service';
import { AuthService } from '../../../core/services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DialogoConfirmacionComponent } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion.component';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink, FormsModule, FormatoPrecioPipe, LoadingComponent, NavbarComponent, FooterComponent, DialogoConfirmacionComponent],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent implements OnInit, OnDestroy {
  protected carritoService = inject(CarritoService);
  protected direccionService = inject(DireccionService);
  protected authService = inject(AuthService);
  protected catalogoService = inject(CatalogoService);

  protected productosRelacionados = signal<Producto[]>([]);
  protected selectedAddressId = signal<string | null>(null);
  protected recogerEnTienda = signal(false);
  protected loading = signal(true);
  protected checkoutMsg = signal<string | null>(null);
  protected nuevaCalle = signal('');
  protected nuevaCiudad = signal('');
  protected nuevaReferencia = signal('');
  protected agregandoDireccion = signal(false);
  protected addedProducts = signal<Set<string>>(new Set());

  readonly envio = computed(() => this.recogerEnTienda() ? 0 : (this.carritoService.total() > 50 ? 0 : 9.90));
  readonly descuento = computed(() => this.carritoService.total() > 100 ? this.carritoService.total() * 0.05 : 0);
  readonly totalFinal = computed(() => this.carritoService.total() + this.envio() - this.descuento());

  protected pendingAction = signal<{ id: string; tipo: 'eliminar' | 'decrementar' } | null>(null);

  protected readonly mensajeDialogo = computed(() => {
    const action = this.pendingAction();
    if (!action) return '';
    return action.tipo === 'eliminar'
      ? '¿Estás seguro de eliminar este producto del carrito?'
      : '¿Estás seguro de eliminar este producto? Al disminuir la cantidad quedará en 0.';
  });

  protected readonly addedSet = this.addedProducts.asReadonly();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.catalogoService.getFeaturedProductos().pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.productosRelacionados.set(p);
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  agregarAlCarrito(p: Producto): void {
    this.carritoService.agregarItem(p, 1);
    const id = p.id_producto;
    this.addedProducts.update(s => new Set(s).add(id));
    setTimeout(() => this.addedProducts.update(s => { const n = new Set(s); n.delete(id); return n; }), 1500);
  }

  finalizarPedido(): void {
    this.carritoService.limpiar();
    this.checkoutMsg.set('Pedido simulado — pronto disponible');
    setTimeout(() => this.checkoutMsg.set(null), 3000);
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
    if (!this.nuevaCalle() || !this.nuevaCiudad()) return;
    this.direccionService.agregarDireccion({
      calle: this.nuevaCalle(),
      ciudad: this.nuevaCiudad(),
      referencia: this.nuevaReferencia() || undefined,
      esPrincipal: false,
    });
    this.nuevaCalle.set('');
    this.nuevaCiudad.set('');
    this.nuevaReferencia.set('');
    this.agregandoDireccion.set(false);
  }
}
