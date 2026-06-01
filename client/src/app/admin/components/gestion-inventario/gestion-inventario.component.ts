import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, switchMap, takeUntil } from 'rxjs';
import { InventarioService } from '../../services/inventario.service';
import { Inventario } from '../../models/inventario.model';
import { MovimientoInventario } from '../../models/movimiento.model';
import { Producto } from '../../../core/models/producto.model';
import { CatalogoService } from '../../../catalogo/services/catalogo.service';
@Component({
  selector: 'app-gestion-inventario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './gestion-inventario.component.html',
  styleUrl: './gestion-inventario.component.css',
})
export class GestionInventarioComponent implements OnInit, OnDestroy {
  stockList = signal<(Inventario & { producto?: Producto })[]>([]);
  movimientos = signal<MovimientoInventario[]>([]);
  productos = signal<Producto[]>([]);
  loading = signal(true);
  showMovForm = signal(false);
  movForm = signal<{ id_producto: string; tipo: 'entrada' | 'salida' | 'ajuste'; cantidad: number; motivo: string; id_usuario: string }>({ id_producto: '', tipo: 'entrada', cantidad: 0, motivo: '', id_usuario: 'usr-001' });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly inventarioService: InventarioService,
    private readonly catalogoService: CatalogoService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      productos: this.catalogoService.getProductos().pipe(takeUntil(this.destroy$)),
      stock: this.inventarioService.getStock().pipe(takeUntil(this.destroy$)),
      movimientos: this.inventarioService.getUltimosMovimientos(10).pipe(takeUntil(this.destroy$)),
    }).pipe(takeUntil(this.destroy$)).subscribe(({ productos, stock, movimientos }) => {
      this.productos.set(productos);
      this.stockList.set(stock);
      this.movimientos.set(movimientos);
      this.loading.set(false);
    });
  }

  actualizarMovForm(campo: string, valor: string | number): void {
    this.movForm.update(d => ({ ...d, [campo]: valor }));
  }

  registerMovement(): void {
    this.inventarioService.registerMovement(this.movForm()).pipe(
      takeUntil(this.destroy$),
      switchMap(() => forkJoin({
        stock: this.inventarioService.getStock(),
        movimientos: this.inventarioService.getUltimosMovimientos(10),
      })),
    ).subscribe(({ stock, movimientos }) => {
      this.showMovForm.set(false);
      this.movForm.set({ id_producto: '', tipo: 'entrada', cantidad: 0, motivo: '', id_usuario: 'usr-001' });
      this.stockList.set(stock);
      this.movimientos.set(movimientos);
    });
  }

  getProductoName(id: string): string {
    return this.productos().find(p => p.id_producto === id)?.nombre ?? id;
  }

  isLowStock(item: Inventario): boolean {
    return item.stock_actual < item.stock_minimo;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
