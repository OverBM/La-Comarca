import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminPedidosService, Comprobante } from '../../services/admin-pedidos.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-facturacion',
  imports: [FormsModule, LoadingComponent, DatePipe],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.css',
})
export class FacturacionComponent implements OnInit {
  comprobantes = signal<Comprobante[]>([]);
  allComprobantes: Comprobante[] = [];
  tipoFilter = signal('');
  loading = signal(true);

  constructor(private pedidosService: AdminPedidosService) {}

  ngOnInit(): void {
    this.pedidosService.getComprobantes().subscribe(c => {
      this.allComprobantes = c;
      this.comprobantes.set(c);
      this.loading.set(false);
    });
  }

  filterByTipo(tipo: string): void {
    this.tipoFilter.set(tipo);
    if (tipo) {
      this.comprobantes.set(this.allComprobantes.filter(c => c.tipo === tipo));
    } else {
      this.comprobantes.set([...this.allComprobantes]);
    }
  }
}
