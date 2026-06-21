import { Component, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
export class DashboardComponent {
  private readonly pedidosService = inject(AdminPedidosService);
  private readonly inventarioService = inject(InventarioService);

  private readonly data = toSignal(
    forkJoin({
      ventasHoy: this.pedidosService.getVentasDelDia().pipe(catchError(() => of(0))),
      pedidosHoy: this.pedidosService.getPedidosDelDia().pipe(catchError(() => of(0))),
      stockBajo: this.inventarioService.getLowStock().pipe(catchError(() => of([] as Inventario[]))),
      movimientos: this.inventarioService.getUltimosMovimientos().pipe(catchError(() => of([] as MovimientoInventario[]))),
    }),
    { initialValue: { ventasHoy: 0, pedidosHoy: 0, stockBajo: [] as Inventario[], movimientos: [] as MovimientoInventario[] } },
  );

  readonly ventasHoy = computed(() => this.data().ventasHoy);
  readonly pedidosHoy = computed(() => this.data().pedidosHoy);
  readonly stockBajo = computed(() => this.data().stockBajo);
  readonly movimientos = computed(() => this.data().movimientos);
  readonly loading = signal(false);
}
