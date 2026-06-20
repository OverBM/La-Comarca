/** Componente para gestionar inventario, stock y movimientos desde el panel admin */
import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, required, minLength, min, FormField } from '@angular/forms/signals';
import { forkJoin, switchMap } from 'rxjs';
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
  readonly loading = signal(true);
  readonly showMovForm = signal(false);

  private movModel = signal({ id_producto: '', tipo: 'entrada' as 'entrada' | 'salida' | 'ajuste', cantidad: 0, motivo: '', id_usuario: 'usr-001' });
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
      movimientos: this.inventarioService.getUltimosMovimientos(10),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ stock, movimientos }) => {
        this.stockList.set(stock);
        this.movimientos.set(movimientos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancelForm(): void {
    this.showMovForm.set(false);
    this.movModel.set({ id_producto: '', tipo: 'entrada', cantidad: 0, motivo: '', id_usuario: 'usr-001' });
  }

  registerMovement(): void {
    if (this.movForm().invalid()) return;
    this.inventarioService.registerMovement(this.movModel()).pipe(
      takeUntilDestroyed(this.destroyRef),
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
    return this.productos().find((p: Producto) => p.id_producto === id)?.nombre ?? id;
  }

  isLowStock(item: Inventario): boolean {
    return item.stock_actual < item.stock_minimo;
  }
}
