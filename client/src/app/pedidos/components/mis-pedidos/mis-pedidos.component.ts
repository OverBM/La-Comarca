import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PedidosService } from '../../services/pedidos.service';
import { PedidoResumen, PedidoDetalle } from '../../models/pedido.models';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PaginacionComponent } from '../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [RouterLink, FormatoPrecioPipe, LoadingComponent, NavbarComponent, FooterComponent, DatePipe, PaginacionComponent],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.css',
})
export class MisPedidosComponent {
  protected readonly authService = inject(AuthService);
  private readonly pedidosService = inject(PedidosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly pedidosResource = toSignal(
    this.pedidosService.obtenerMisPedidos().pipe(
      catchError(() => {
        this.error.set('Error al cargar los pedidos. Intente de nuevo más tarde.');
        return of([] as PedidoResumen[]);
      }),
    ),
    { initialValue: [] as PedidoResumen[] },
  );

  readonly pedidos = this.pedidosResource;

  readonly filtro = signal('');
  readonly paginaActual = signal(1);
  readonly pageSize = signal(10);

  readonly pedidosFiltrados = computed(() => {
    const f = this.filtro().toLowerCase();
    if (!f) return this.pedidos();
    return this.pedidos().filter(p =>
      p.id_pedido.toLowerCase().includes(f) ||
      new Date(p.fecha).toLocaleDateString().includes(f)
    );
  });

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.pedidosFiltrados().length / this.pageSize())));

  readonly pedidosPaginados = computed(() => {
    const items = this.pedidosFiltrados();
    const inicio = (this.paginaActual() - 1) * this.pageSize();
    return items.slice(inicio, inicio + this.pageSize());
  });

  readonly expandedId = signal<string | null>(null);
  readonly expandedPedido = signal<PedidoDetalle | undefined>(undefined);
  readonly detalleLoading = signal(false);

  toggleDetalle(id: string): void {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
      this.expandedPedido.set(undefined);
    } else {
      this.expandedId.set(id);
    this.detalleLoading.set(true);
    this.pedidosService.obtenerPedidoPorId(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: d => {
        this.expandedPedido.set(d ?? undefined);
        this.detalleLoading.set(false);
      },
      error: () => this.detalleLoading.set(false),
    });
    }
  }
}
