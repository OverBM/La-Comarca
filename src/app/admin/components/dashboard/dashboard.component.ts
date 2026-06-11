/** Componente del panel de administración que muestra resumen de ventas, pedidos y stock bajo */
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AdminPedidosService } from '../../services/admin-pedidos.service';
import { InventarioService } from '../../services/inventario.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Inventario } from '../../models/inventario.model';
import { MovimientoInventario } from '../../models/movimiento.model';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LoadingComponent, FormatoPrecioPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  ventasHoy = signal(0);
  pedidosHoy = signal(0);
  stockBajo = signal<Inventario[]>([]);
  movimientos = signal<MovimientoInventario[]>([]);
  loading = signal(true);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly pedidosService: AdminPedidosService,
    private readonly inventarioService: InventarioService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      ventasHoy: this.pedidosService.getVentasDelDia().pipe(takeUntil(this.destroy$)),
      pedidosHoy: this.pedidosService.getPedidosDelDia().pipe(takeUntil(this.destroy$)),
      stockBajo: this.inventarioService.getLowStock().pipe(takeUntil(this.destroy$)),
      movimientos: this.inventarioService.getUltimosMovimientos().pipe(takeUntil(this.destroy$)),
    }).pipe(takeUntil(this.destroy$)).subscribe(({ ventasHoy, pedidosHoy, stockBajo, movimientos }) => {
      this.ventasHoy.set(ventasHoy);
      this.pedidosHoy.set(pedidosHoy);
      this.stockBajo.set(stockBajo);
      this.movimientos.set(movimientos);
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
