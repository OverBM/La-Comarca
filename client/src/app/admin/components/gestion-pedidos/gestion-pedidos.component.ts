import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
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

  private readonly pedidosResource = toSignal(this.pedidosService.getPedidos(), { initialValue: [] as PedidoResumen[] });
  readonly pedidos = computed(() => this.pedidosResource());
  readonly selectedPedido = signal<PedidoDetalle | null>(null);
  readonly loading = signal(false);

  viewDetail(id: string): void {
    this.pedidosService.getPedidoDetalle(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(d => this.selectedPedido.set(d ?? null));
  }

  backToList(): void {
    this.selectedPedido.set(null);
  }
}