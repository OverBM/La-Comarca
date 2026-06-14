import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AdminPedidosService, TipoComprobante, ComprobanteEmitido } from '../../services/admin-pedidos.service';
import { PedidoResumen } from '../../models/pedido-resumen.model';
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
  private readonly pedidosService = inject(AdminPedidosService);

  allComprobantes = signal<Comprobante[]>([]);
  loading = signal(true);
  toastMsg = signal<string | null>(null);
  busqueda = signal('');

  /* Emitir comprobante */
  showForm = signal(false);
  pedidosSinComprobante = signal<PedidoResumen[]>([]);
  pedidosLoading = signal(false);
  selectedPedidosIds = signal<Set<string>>(new Set());
  tiposComprobante = signal<TipoComprobante[]>([]);
  emitirLoading = signal(false);
  emitirMsg = signal<string | null>(null);
  ultimosComprobantes = signal<ComprobanteEmitido[]>([]);
  erroresEmitir = signal<{ id_pedido: string; error: string }[]>([]);

  page = signal(1);
  pageSize = 10;

  readonly totalDia = computed(() => {
    const hoy = new Date();
    return this.filtrados()
      .filter(c => new Date(c.fecha).toDateString() === hoy.toDateString())
      .reduce((s, c) => s + c.total, 0);
  });

  readonly filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.allComprobantes();
    return this.allComprobantes().filter(
      c =>
        c.tipo.toLowerCase().includes(q) ||
        c.serie.toLowerCase().includes(q) ||
        c.correlativo.toLowerCase().includes(q) ||
        c.cliente.toLowerCase().includes(q) ||
        (c.ruc && c.ruc.includes(q)),
    );
  });

  readonly totalPages = computed(() => Math.ceil(this.filtrados().length / this.pageSize));

  readonly paginados = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtrados().slice(start, start + this.pageSize);
  });

  readonly haySeleccion = computed(() => this.selectedPedidosIds().size > 0);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initialLoading();
  }

  private initialLoading(): void {
    this.pedidosService.getComprobantes().pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.allComprobantes.set(c);
      this.loading.set(false);
    });
  }

  toggleForm(): void {
    const visible = !this.showForm();
    this.showForm.set(visible);
    this.emitirMsg.set(null);
    this.ultimosComprobantes.set([]);
    this.erroresEmitir.set([]);
    this.selectedPedidosIds.set(new Set());
    if (visible) {
      this.pedidosLoading.set(true);
      this.pedidosService.getPedidos().pipe(takeUntil(this.destroy$)).subscribe(p => {
        this.pedidosSinComprobante.set(p);
        this.pedidosLoading.set(false);
      });
      this.pedidosService.getTiposComprobante().pipe(takeUntil(this.destroy$)).subscribe(t => this.tiposComprobante.set(t));
    }
  }

  togglePedido(id: string): void {
    this.selectedPedidosIds.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  emitirComprobantes(id_tipo: string): void {
    const ids = [...this.selectedPedidosIds()];
    if (!ids.length) return;

    this.emitirLoading.set(true);
    this.emitirMsg.set(null);
    this.ultimosComprobantes.set([]);
    this.erroresEmitir.set([]);

    this.pedidosService.emitirComprobantesMasivo(ids, id_tipo).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.ultimosComprobantes.set(res.emitidos);
        this.erroresEmitir.set(res.errores);
        const totalOk = res.emitidos.length;
        const totalErr = res.errores.length;
        if (totalErr === 0) {
          this.emitirMsg.set(`${totalOk} comprobante(s) emitido(s) exitosamente`);
        } else {
          this.emitirMsg.set(`${totalOk} emitido(s), ${totalErr} error(es)`);
        }
        this.emitirLoading.set(false);
        this.selectedPedidosIds.set(new Set());
        this.initialLoading();
      },
      error: (err) => {
        this.emitirMsg.set(err.error?.detail || 'Error al emitir comprobantes');
        this.emitirLoading.set(false);
      },
    });
  }

  onBuscar(val: string): void {
    this.busqueda.set(val);
    this.page.set(1);
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
}