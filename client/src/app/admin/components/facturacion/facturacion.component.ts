import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AdminPedidosService } from '../../services/admin-pedidos.service';
import { Comprobante } from '../../models/comprobante.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [DatePipe, LoadingComponent, FormatoPrecioPipe],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.css',
})
export class FacturacionComponent implements OnInit, OnDestroy {
  allComprobantes = signal<Comprobante[]>([]);
  loading = signal(true);
  toastMsg = signal<string | null>(null);

  page = signal(1);
  pageSize = 10;

  readonly totalDia = computed(() => {
    const hoy = new Date();
    return this.allComprobantes()
      .filter(c => c.fecha.toDateString() === hoy.toDateString())
      .reduce((s, c) => s + c.total, 0);
  });

  readonly aceptados = computed(() => this.allComprobantes().filter(c => c.estado_sunat === 'Aceptado').length);
  readonly pendientes = computed(() => this.allComprobantes().filter(c => c.estado_sunat === 'Pendiente').length);
  readonly rechazados = computed(() => this.allComprobantes().filter(c => c.estado_sunat === 'Rechazado').length);

  readonly totalPages = computed(() => Math.ceil(this.allComprobantes().length / this.pageSize));

  readonly paginados = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.allComprobantes().slice(start, start + this.pageSize);
  });

  private destroy$ = new Subject<void>();

  constructor(private readonly pedidosService: AdminPedidosService) {}

  ngOnInit(): void {
    this.pedidosService.getComprobantes().pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.allComprobantes.set(c);
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  irPagina(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }

  mostrarToast(msg: string): void {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(null), 2500);
  }

  badgeClass(estado: string): string {
    const map: Record<string, string> = {
      Aceptado: 'fact-badge--aceptado',
      Enviando: 'fact-badge--enviando',
      Pendiente: 'fact-badge--pendiente',
      Rechazado: 'fact-badge--rechazado',
    };
    return map[estado] ?? '';
  }
}
