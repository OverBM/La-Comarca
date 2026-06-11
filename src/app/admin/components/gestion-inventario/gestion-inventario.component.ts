/** Componente para gestionar inventario, stock y movimientos desde el panel admin */
import { Component, OnInit, signal } from '@angular/core';
import { form, required, minLength, min, FormField } from '@angular/forms/signals';
import { Subject, forkJoin, switchMap, takeUntil } from 'rxjs';
import { InventarioService } from '../../services/inventario.service';
import { Inventario } from '../../models/inventario.model';
import { MovimientoInventario } from '../../models/movimiento.model';
import { Producto } from '../../../core/models/producto.model';
import { CatalogoService } from '../../../catalogo/services/catalogo.service';

@Component({
  selector: 'app-gestion-inventario',
  standalone: true,
  imports: [FormField],
  templateUrl: './gestion-inventario.component.html',
  styleUrl: './gestion-inventario.component.css',
})
export class GestionInventarioComponent implements OnInit {
  stockList = signal<(Inventario & { producto?: Producto })[]>([]);
  movimientos = signal<MovimientoInventario[]>([]);
  productos = signal<Producto[]>([]);
  loading = signal(true);
  showMovForm = signal(false);

  private readonly destroy$ = new Subject<void>();

  private movModel = signal({ id_producto: '', tipo: 'entrada' as 'entrada' | 'salida' | 'ajuste', cantidad: 0, motivo: '', id_usuario: 'usr-001' });
  protected movForm = form(this.movModel, (f) => {
    required(f.id_producto, { message: 'Seleccione un producto' });
    required(f.tipo, { message: 'Seleccione el tipo' });
    required(f.cantidad, { message: 'Ingrese la cantidad' });
    min(f.cantidad, 1, { message: 'Mínimo 1' });
    required(f.motivo, { message: 'Ingrese el motivo' });
    minLength(f.motivo, 3, { message: 'Mínimo 3 caracteres' });
  });

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

  registerMovement(): void {
    if (this.movForm().invalid()) return;
    this.inventarioService.registerMovement(this.movModel()).pipe(
      takeUntil(this.destroy$),
      switchMap(() => forkJoin({
        stock: this.inventarioService.getStock(),
        movimientos: this.inventarioService.getUltimosMovimientos(10),
      })),
    ).subscribe(({ stock, movimientos }) => {
      this.showMovForm.set(false);
      this.movModel.set({ id_producto: '', tipo: 'entrada', cantidad: 0, motivo: '', id_usuario: 'usr-001' });
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
}
