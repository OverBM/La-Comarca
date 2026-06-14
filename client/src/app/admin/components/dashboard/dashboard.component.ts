/** Componente del panel de administración que muestra resumen de ventas, pedidos y stock bajo */
import { Component, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
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
      ventasHoy: this.pedidosService.getVentasDelDia(),
      pedidosHoy: this.pedidosService.getPedidosDelDia(),
      stockBajo: this.inventarioService.getLowStock(),
      movimientos: this.inventarioService.getUltimosMovimientos(),
    }),
    { initialValue: { ventasHoy: 0, pedidosHoy: 0, stockBajo: [] as Inventario[], movimientos: [] as MovimientoInventario[] } },
  );

  readonly ventasHoy = computed(() => this.data().ventasHoy);
  readonly pedidosHoy = computed(() => this.data().pedidosHoy);
  readonly stockBajo = computed(() => this.data().stockBajo);
  readonly movimientos = computed(() => this.data().movimientos);
  readonly loading = signal(false);
}
