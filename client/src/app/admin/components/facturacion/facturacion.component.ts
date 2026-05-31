import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AdminPedidosService } from '../../services/admin-pedidos.service';
import { Comprobante } from '../../models/comprobante.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';

@Component({
  selector: 'app-facturacion',
  imports: [FormsModule, LoadingComponent, DatePipe, FormatoPrecioPipe],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.css',
})
export class FacturacionComponent implements OnInit, OnDestroy {
  comprobantes = signal<Comprobante[]>([]);
  allComprobantes = signal<Comprobante[]>([]);
  tipoFilter = signal('');
  loading = signal(true);

  private destroy$ = new Subject<void>();

  constructor(private pedidosService: AdminPedidosService) {}

  ngOnInit(): void {
    this.pedidosService.getComprobantes().pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.allComprobantes.set(c);
      this.comprobantes.set(c);
      this.loading.set(false);
    });
  }

  filterByTipo(tipo: string): void {
    this.tipoFilter.set(tipo);
    if (tipo) {
      this.comprobantes.set(this.allComprobantes().filter(c => c.tipo === tipo));
    } else {
      this.comprobantes.set([...this.allComprobantes()]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
