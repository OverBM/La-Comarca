import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { DatePipe, NgIf } from '@angular/common';
import { AdminPedidosService, TipoComprobante, ComprobanteEmitido } from '../../services/admin-pedidos.service';
import { PedidoResumen } from '../../models/pedido-resumen.model';
import { Comprobante } from '../../models/comprobante.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { SinResultadosComponent } from '../../../shared/components/sin-resultados/sin-resultados.component';
import { PaginacionComponent } from '../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [DatePipe, LoadingComponent, FormatoPrecioPipe, SinResultadosComponent, PaginacionComponent, NgIf],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.css',
})
export class FacturacionComponent {
  private readonly pedidosService = inject(AdminPedidosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly versionRefresco = signal(0);

  readonly allComprobantes = toSignal(
    toObservable(this.versionRefresco).pipe(
      switchMap(() => this.pedidosService.getComprobantes()),
    ),
    { initialValue: [] as Comprobante[] },
  );

  private readonly comprobantesCargados = computed(() => this.allComprobantes() ?? []);
  readonly loading = signal(false);
  toastMsg = signal<string | null>(null);
  busqueda = signal('');

  /* Emitir comprobante */
  showForm = signal(false);
  pedidosSinComprobante = signal<PedidoResumen[]>([]);
  pedidosLoading = signal(false);
  selectedPedidosIds = signal<Set<string>>(new Set());
  tiposComprobante = signal<TipoComprobante[]>([]);
  emitirLoading = signal(false);
  filtroPedidoEstado = signal<string>('sin');
  busquedaPedido = signal('');
  emitirMsg = signal<string | null>(null);
  ultimosComprobantes = signal<ComprobanteEmitido[]>([]);
  erroresEmitir = signal<{ id_pedido: string; error: string }[]>([]);

  constructor() {
    this.pedidosService.getTiposComprobante().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(t => this.tiposComprobante.set(t));
  }

  page = signal(1);
  pageSize = signal(10);
  filtroTipo = signal<string>('');
  filtroFecha = signal<string>('');

  readonly totalDia = computed(() => {
    const hoy = new Date();
    return this.filtrados()
      .filter(c => new Date(c.fecha).toDateString() === hoy.toDateString())
      .reduce((s, c) => s + c.total, 0);
  });

  readonly filtrados = computed(() => {
    const comprobantes = this.comprobantesCargados();
    const q = this.busqueda().toLowerCase().trim();
    const tipo = this.filtroTipo();
    const fecha = this.filtroFecha();
    return comprobantes.filter(c => {
      if (q && !c.tipo.toLowerCase().includes(q) && !c.serie.toLowerCase().includes(q) &&
          !c.correlativo.toLowerCase().includes(q) && !c.cliente.toLowerCase().includes(q) &&
          !(c.ruc && c.ruc.includes(q))) return false;
      if (tipo && c.tipo !== tipo) return false;
      if (fecha) {
        const d = c.fecha.slice(0, 10);
        if (d !== fecha) return false;
      }
      return true;
    });
  });

  readonly totalPages = computed(() => Math.ceil(this.filtrados().length / this.pageSize()));

  readonly paginados = computed(() => {
    const ps = this.pageSize();
    const start = (this.page() - 1) * ps;
    return this.filtrados().slice(start, start + ps);
  });

  readonly haySeleccion = computed(() => this.selectedPedidosIds().size > 0);

  private readonly pedidoIdsConComprobante = computed(() => {
    const ids = new Set<string>();
    for (const c of this.comprobantesCargados()) {
      if (c.id_pedido) ids.add(c.id_pedido);
    }
    return ids;
  });

  readonly pedidosFiltradosEmitir = computed(() => {
    const todos = this.pedidosSinComprobante();
    const filtro = this.filtroPedidoEstado();
    const q = this.busquedaPedido().toLowerCase().trim();
    const conComprobante = this.pedidoIdsConComprobante();
    return todos.filter(p => {
      if (filtro === 'sin' && conComprobante.has(p.id_pedido)) return false;
      if (filtro === 'con' && !conComprobante.has(p.id_pedido)) return false;
      if (q && !p.id_pedido.toLowerCase().includes(q) && !p.cliente.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  toggleForm(): void {
    const visible = !this.showForm();
    this.showForm.set(visible);
    this.emitirMsg.set(null);
    this.ultimosComprobantes.set([]);
    this.erroresEmitir.set([]);
    this.selectedPedidosIds.set(new Set());
    this.filtroPedidoEstado.set('sin');
    this.busquedaPedido.set('');
    if (visible) {
      this.pedidosLoading.set(true);
      this.pedidosService.getPedidos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: p => {
          this.pedidosSinComprobante.set(p);
          this.pedidosLoading.set(false);
        },
        error: () => this.pedidosLoading.set(false),
      });
      this.pedidosService.getTiposComprobante().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(t => this.tiposComprobante.set(t));
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

    this.pedidosService.emitirComprobantesMasivo(ids, id_tipo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
        this.versionRefresco.update(v => v + 1);
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

  irPagina(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }

  cambiarPageSize(ps: number): void {
    this.pageSize.set(ps);
    this.page.set(1);
  }

  onFiltroTipo(tipo: string): void {
    this.filtroTipo.set(tipo);
    this.page.set(1);
  }

  onFiltroFecha(fecha: string): void {
    this.filtroFecha.set(fecha);
    this.page.set(1);
  }

  mostrarToast(msg: string): void {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(null), 2500);
  }

  irBovedaXml(): void {
    this.busqueda.set('');
    this.page.set(1);
    const el = document.querySelector('.fact-tabla-wrapper');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}