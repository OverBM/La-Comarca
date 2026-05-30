import { Component, OnInit, signal } from '@angular/core';
import { AdminPedidosService } from '../../services/admin-pedidos.service';
import { InventarioService } from '../../services/inventario.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Inventario } from '../../models/inventario.model';
import { MovimientoInventario } from '../../models/movimiento.model';

@Component({
  selector: 'app-dashboard',
  imports: [LoadingComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  ventasHoy = signal(0);
  pedidosHoy = signal(0);
  stockBajo = signal<Inventario[]>([]);
  movimientos = signal<MovimientoInventario[]>([]);
  loading = signal(true);

  constructor(
    private pedidosService: AdminPedidosService,
    private inventarioService: InventarioService,
  ) {}

  ngOnInit(): void {
    this.pedidosService.getVentasDelDia().subscribe(v => this.ventasHoy.set(v));
    this.pedidosService.getPedidosDelDia().subscribe(p => this.pedidosHoy.set(p));
    this.inventarioService.getLowStock().subscribe(s => this.stockBajo.set(s));
    this.inventarioService.getUltimosMovimientos().subscribe(m => this.movimientos.set(m));
    this.loading.set(false);
  }
}
