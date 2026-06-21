import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AdminPedidosService } from '../../services/admin-pedidos.service';
import { PedidoResumen } from '../../models/pedido-resumen.model';
import { PedidoDetalle } from '../../models/pedido-detalle.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { PaginacionComponent } from '../../../shared/components/paginacion/paginacion.component';
import { SinResultadosComponent } from '../../../shared/components/sin-resultados/sin-resultados.component';

@Component({
  selector: 'app-gestion-pedidos',
  standalone: true,
  imports: [LoadingComponent, DatePipe, FormatoPrecioPipe, PaginacionComponent, SinResultadosComponent],
  templateUrl: './gestion-pedidos.component.html',
  styleUrl: './gestion-pedidos.component.css',
})
export class GestionPedidosComponent {
  private readonly pedidosService = inject(AdminPedidosService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly esAdmin = computed(() => this.authService.authState().rol === 'admin');
  protected readonly esVendedor = computed(() => this.authService.authState().rol === 'vendedor');

  readonly pedidos = signal<PedidoResumen[]>([]);
  readonly selectedPedido = signal<PedidoDetalle | null>(null);
  readonly loading = signal(false);
  readonly confirmandoPago = signal<string | null>(null);

  readonly filtro = signal('');
  readonly filtroPago = signal('');
  readonly filtroEstado = signal('');
  readonly paginaActual = signal(1);
  readonly pageSize = signal(10);

  readonly pedidosFiltrados = computed(() => {
    let items = this.pedidos();
    const f = this.filtro().toLowerCase();
    if (f) {
      items = items.filter(p =>
        p.id_pedido.toLowerCase().includes(f) ||
        p.cliente.toLowerCase().includes(f)
      );
    }
    const pago = this.filtroPago();
    if (pago) {
      items = items.filter(p => p.metodo_pago === pago);
    }
    const estado = this.filtroEstado();
    if (estado) {
      items = items.filter(p => p.estado_pago === estado);
    }
    return items;
  });

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.pedidosFiltrados().length / this.pageSize())));

  readonly pedidosPaginados = computed(() => {
    const items = this.pedidosFiltrados();
    const inicio = (this.paginaActual() - 1) * this.pageSize();
    return items.slice(inicio, inicio + this.pageSize());
  });

  constructor() {
    this.cargarPedidos();
  }

  private cargarPedidos(): void {
    this.pedidosService.getPedidos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p => this.pedidos.set(p));
  }

  viewDetail(id: string): void {
    this.pedidosService.getPedidoDetalle(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(d => this.selectedPedido.set(d ?? null));
  }

  backToList(): void {
    this.selectedPedido.set(null);
    this.paginaActual.set(1);
  }

  confirmarPago(id: string): void {
    this.confirmandoPago.set(id);
    this.pedidosService.confirmarPago(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (pedido) => {
        this.selectedPedido.set(pedido);
        this.confirmandoPago.set(null);
        this.cargarPedidos();
      },
      error: () => this.confirmandoPago.set(null),
    });
  }

  readonly metodoPagoLabel: Record<string, string> = {
    efectivo: 'Efectivo',
    yape: 'Yape',
  };

  readonly estadoPagoLabel: Record<string, string> = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    anulado: 'Anulado',
  };
}