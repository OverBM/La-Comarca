/** Componente para gestionar inventario, stock y movimientos desde el panel admin */
import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { form, required, minLength, min, FormField } from '@angular/forms/signals';
import { forkJoin, switchMap } from 'rxjs';
import { InventarioService } from '../../services/inventario.service';
import { Inventario } from '../../models/inventario.model';
import { MovimientoInventario } from '../../models/movimiento.model';
import { Producto } from '../../../core/models/producto.model';
import { CatalogoService } from '../../../catalogo/services/catalogo.service';
import { PaginacionComponent } from '../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-gestion-inventario',
  standalone: true,
  imports: [FormField, PaginacionComponent, DatePipe],
  templateUrl: './gestion-inventario.component.html',
  styleUrl: './gestion-inventario.component.css',
})
export class GestionInventarioComponent {
  private readonly inventarioService = inject(InventarioService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly productosSignal = toSignal(
    this.catalogoService.getProductos(),
    { initialValue: [] as Producto[] },
  );

  readonly productos = computed(() => this.productosSignal());
  readonly stockList = signal<(Inventario & { producto?: Producto })[]>([]);
  readonly movimientos = signal<MovimientoInventario[]>([]);
  readonly totalMovimientos = signal(0);
  readonly loading = signal(true);
  readonly showMovForm = signal(false);
  readonly filtroStock = signal('');
  readonly ordenStock = signal<'asc' | 'desc'>('asc');
  readonly nivelStock = signal<'todos' | 'bajo' | 'normal'>('todos');

  readonly paginaStock = signal(1);
  readonly pageSizeStock = signal(10);

  readonly stockFiltrados = computed(() => {
    let items = this.stockList();
    const f = this.filtroStock().toLowerCase();
    if (f) {
      items = items.filter(item =>
        item.id_inventario.toLowerCase().includes(f) ||
        this.getProductoName(item.id_producto).toLowerCase().includes(f)
      );
    }
    const nivel = this.nivelStock();
    if (nivel === 'bajo') {
      items = items.filter(item => this.isLowStock(item));
    } else if (nivel === 'normal') {
      items = items.filter(item => !this.isLowStock(item));
    }
    const orden = this.ordenStock();
    if (orden === 'asc') {
      items = [...items].sort((a, b) => a.stock_actual - b.stock_actual);
    } else {
      items = [...items].sort((a, b) => b.stock_actual - a.stock_actual);
    }
    return items;
  });

  readonly totalPaginasStock = computed(() => Math.max(1, Math.ceil(this.stockFiltrados().length / this.pageSizeStock())));

  readonly stockPaginados = computed(() => {
    const items = this.stockFiltrados();
    const inicio = (this.paginaStock() - 1) * this.pageSizeStock();
    return items.slice(inicio, inicio + this.pageSizeStock());
  });

  readonly paginaMov = signal(1);
  readonly pageSizeMov = signal(10);
  readonly desdeInput = signal('');
  readonly hastaInput = signal('');
  readonly desde = signal('');
  readonly hasta = signal('');

  readonly totalPaginasMov = computed(() => Math.max(1, Math.ceil(this.totalMovimientos() / this.pageSizeMov())));

  private readonly movModel = signal({ id_producto: '', tipo: 'entrada' as 'entrada' | 'salida' | 'ajuste', cantidad: 0, motivo: '', id_usuario: 'usr-001' });
  protected movForm = form(this.movModel, (f) => {
    required(f.id_producto, { message: 'Seleccione un producto' });
    required(f.tipo, { message: 'Seleccione el tipo' });
    required(f.cantidad, { message: 'Ingrese la cantidad' });
    min(f.cantidad, 1, { message: 'Mínimo 1' });
    required(f.motivo, { message: 'Ingrese el motivo' });
    minLength(f.motivo, 3, { message: 'Mínimo 3 caracteres' });
  });

  constructor() {
    forkJoin({
      stock: this.inventarioService.getStock(),
      movimientos: this.inventarioService.getMovimientos(1, 10),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ stock, movimientos }) => {
        this.stockList.set(stock);
        this.movimientos.set(movimientos.items);
        this.totalMovimientos.set(movimientos.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private cargarMovimientos(): void {
    this.inventarioService.getMovimientos(this.paginaMov(), this.pageSizeMov(), this.desde() || undefined, this.hasta() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(r => {
        this.movimientos.set(r.items);
        this.totalMovimientos.set(r.total);
      });
  }

  irAPaginaMov(pagina: number): void {
    this.paginaMov.set(pagina);
    this.cargarMovimientos();
  }

  cambiarPageSizeMov(tamano: number): void {
    this.pageSizeMov.set(tamano);
    this.paginaMov.set(1);
    this.cargarMovimientos();
  }

  filtrarFechas(): void {
    this.desde.set(this.desdeInput());
    this.hasta.set(this.hastaInput());
    this.paginaMov.set(1);
    this.cargarMovimientos();
  }

  cancelForm(): void {
    this.showMovForm.set(false);
    this.movModel.set({ id_producto: '', tipo: 'entrada', cantidad: 0, motivo: '', id_usuario: 'usr-001' });
  }

  readonly errorMov = signal<string | null>(null);

  registerMovement(): void {
    if (this.movForm().invalid()) return;
    this.errorMov.set(null);
    this.inventarioService.registerMovement(this.movModel()).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(() => forkJoin({
        stock: this.inventarioService.getStock(),
        movimientos: this.inventarioService.getMovimientos(1, 10),
      })),
    ).subscribe({
      next: ({ stock, movimientos }) => {
        this.showMovForm.set(false);
        this.movModel.set({ id_producto: '', tipo: 'entrada', cantidad: 0, motivo: '', id_usuario: 'usr-001' });
        this.stockList.set(stock);
        this.movimientos.set(movimientos.items);
        this.totalMovimientos.set(movimientos.total);
      },
      error: (err) => {
        this.errorMov.set(err.error?.detail ?? 'Error al registrar movimiento');
      },
    });
  }

  getProductoName(id: string): string {
    return this.productos().find((p: Producto) => p.id_producto === id)?.nombre ?? id;
  }

  isLowStock(item: Inventario): boolean {
    return item.stock_actual < item.stock_minimo;
  }

  getTipoMovIcon(tipo: string): { icono: string; clase: string } {
    switch (tipo) {
      case 'entrada': return { icono: '+', clase: 'mov-icono--entrada' };
      case 'salida': return { icono: '−', clase: 'mov-icono--salida' };
      case 'ajuste': return { icono: '~', clase: 'mov-icono--ajuste' };
      default: return { icono: '?', clase: '' };
    }
  }
}
