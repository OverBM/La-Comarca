import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminPedidosService, PedidoResumen, PedidoDetalle } from '../../services/admin-pedidos.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-gestion-pedidos',
  imports: [LoadingComponent, DatePipe],
  templateUrl: './gestion-pedidos.component.html',
  styleUrl: './gestion-pedidos.component.css',
})
export class GestionPedidosComponent implements OnInit {
  pedidos = signal<PedidoResumen[]>([]);
  selectedPedido = signal<PedidoDetalle | null>(null);
  loading = signal(true);

  constructor(private pedidosService: AdminPedidosService) {}

  ngOnInit(): void {
    this.pedidosService.getPedidos().subscribe(p => {
      this.pedidos.set(p);
      this.loading.set(false);
    });
  }

  viewDetail(id: string): void {
    this.pedidosService.getPedidoDetalle(id).subscribe(d => this.selectedPedido.set(d ?? null));
  }

  backToList(): void {
    this.selectedPedido.set(null);
  }
}
