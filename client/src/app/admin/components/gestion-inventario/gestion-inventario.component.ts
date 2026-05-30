import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { Inventario } from '../../models/inventario.model';
import { MovimientoInventario } from '../../models/movimiento.model';
import { Producto } from '../../../catalogo/models/producto.model';
import { CatalogoService } from '../../../catalogo/services/catalogo.service';
@Component({
  selector: 'app-gestion-inventario',
  imports: [FormsModule],
  templateUrl: './gestion-inventario.component.html',
  styleUrl: './gestion-inventario.component.css',
})
export class GestionInventarioComponent implements OnInit {
  stockList = signal<(Inventario & { producto?: Producto })[]>([]);
  movimientos = signal<MovimientoInventario[]>([]);
  productos = signal<Producto[]>([]);
  loading = signal(true);
  showMovForm = signal(false);
  movForm = { id_producto: '', tipo: 'entrada' as 'entrada' | 'salida' | 'ajuste', cantidad: 0, motivo: '', id_usuario: 'usr-001' };

  constructor(
    private inventarioService: InventarioService,
    private catalogoService: CatalogoService,
  ) {}

  ngOnInit(): void {
    this.catalogoService.getProductos().subscribe(p => this.productos.set(p));
    this.inventarioService.getStock().subscribe(s => this.stockList.set(s));
    this.inventarioService.getUltimosMovimientos(10).subscribe(m => this.movimientos.set(m));
    this.loading.set(false);
  }

  registerMovement(): void {
    this.inventarioService.registerMovement(this.movForm).subscribe(() => {
      this.showMovForm.set(false);
      this.movForm = { id_producto: '', tipo: 'entrada', cantidad: 0, motivo: '', id_usuario: 'usr-001' };
      this.inventarioService.getStock().subscribe(s => this.stockList.set(s));
      this.inventarioService.getUltimosMovimientos(10).subscribe(m => this.movimientos.set(m));
    });
  }

  getProductoName(id: string): string {
    return this.productos().find(p => p.id_producto === id)?.nombre ?? id;
  }

  isLowStock(item: Inventario): boolean {
    return item.stock_actual < item.stock_minimo;
  }
}
