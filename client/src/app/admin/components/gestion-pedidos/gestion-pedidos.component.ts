import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AdminPedidosService } from '../../services/admin-pedidos.service';
import { PedidoResumen } from '../../models/pedido-resumen.model';
import { PedidoDetalle } from '../../models/pedido-detalle.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';

@Component({
  selector: 'app-gestion-pedidos',
  standalone: true,
  imports: [LoadingComponent, DatePipe, FormatoPrecioPipe],
  templateUrl: './gestion-pedidos.component.html',
  styleUrl: './gestion-pedidos.component.css',
})
export class GestionPedidosComponent {
  private readonly pedidosService = inject(AdminPedidosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pedidos = signal<PedidoResumen[]>([]);
  readonly selectedPedido = signal<PedidoDetalle | null>(null);
  readonly loading = signal(false);
  readonly confirmandoPago = signal<string | null>(null);

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