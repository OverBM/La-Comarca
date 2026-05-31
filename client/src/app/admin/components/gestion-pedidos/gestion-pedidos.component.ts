import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
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
export class GestionPedidosComponent implements OnInit, OnDestroy {
  pedidos = signal<PedidoResumen[]>([]);
  selectedPedido = signal<PedidoDetalle | null>(null);
  loading = signal(true);

  private destroy$ = new Subject<void>();

  constructor(private pedidosService: AdminPedidosService) {}

  ngOnInit(): void {
    this.pedidosService.getPedidos().pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.pedidos.set(p);
      this.loading.set(false);
    });
  }

  viewDetail(id: string): void {
    this.pedidosService.getPedidoDetalle(id).pipe(takeUntil(this.destroy$)).subscribe(d => this.selectedPedido.set(d ?? null));
  }

  backToList(): void {
    this.selectedPedido.set(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
