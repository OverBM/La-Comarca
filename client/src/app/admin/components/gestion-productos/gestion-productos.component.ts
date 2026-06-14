/** Componente para la gestión CRUD de productos desde el panel admin */
import { Component, OnInit, signal } from '@angular/core';
import { form, required, minLength, min, FormField } from '@angular/forms/signals';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AdminProductosService } from '../../services/admin-productos.service';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { CatalogoService } from '../../../catalogo/services/catalogo.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DialogoConfirmacionComponent } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion.component';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [FormField, LoadingComponent, DialogoConfirmacionComponent],
  templateUrl: './gestion-productos.component.html',
  styleUrl: './gestion-productos.component.css',
})
export class GestionProductosComponent implements OnInit {
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  loading = signal(true);
  selectedCategory = signal('');
  editingProduct = signal<Producto | null>(null);
  showForm = signal(false);
  showConfirmDialog = signal(false);
  pendingDeleteId = signal('');

  private readonly destroy$ = new Subject<void>();

  private prodModel = signal({ id_categoria: '', nombre: '', precio_unitario: 0, descripcion: '', imagen: '', stock_minimo: 0 });
  protected prodForm = form(this.prodModel, (f) => {
    required(f.nombre, { message: 'El nombre es obligatorio' });
    minLength(f.nombre, 2, { message: 'Mínimo 2 caracteres' });
    required(f.id_categoria, { message: 'Seleccione una categoría' });
    required(f.precio_unitario, { message: 'El precio es obligatorio' });
    min(f.precio_unitario, 0, { message: 'No puede ser negativo' });
    min(f.stock_minimo, 0, { message: 'No puede ser negativo' });
  });

  constructor(
    private readonly adminProductosService: AdminProductosService,
    private readonly catalogoService: CatalogoService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      categorias: this.catalogoService.getCategorias().pipe(takeUntil(this.destroy$)),
      productos: this.adminProductosService.getProductos().pipe(takeUntil(this.destroy$)),
    }).pipe(takeUntil(this.destroy$)).subscribe(({ categorias, productos }) => {
      this.categorias.set(categorias);
      this.productos.set(productos);
      this.loading.set(false);
    });
  }

  loadProductos(): void {
    this.loading.set(true);
    this.adminProductosService.getProductos().pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.productos.set(p);
      this.loading.set(false);
    });
  }

  filterByCategory(event: Event): void {
    const catId = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(catId);
    this.loading.set(true);
    if (catId) {
      this.adminProductosService.getProductosByCategoria(catId).pipe(takeUntil(this.destroy$)).subscribe(p => {
        this.productos.set(p);
        this.loading.set(false);
      });
    } else {
      this.loadProductos();
    }
  }

  openCreateForm(): void {
    this.editingProduct.set(null);
    this.prodModel.set({ id_categoria: '', nombre: '', precio_unitario: 0, descripcion: '', imagen: '', stock_minimo: 0 });
    this.showForm.set(true);
  }

  openEditForm(product: Producto): void {
    this.editingProduct.set(product);
    this.prodModel.set({ id_categoria: product.id_categoria, nombre: product.nombre, precio_unitario: product.precio_unitario, descripcion: product.descripcion ?? '', imagen: product.imagen ?? '', stock_minimo: (product as any).stock_minimo ?? 0 });
    this.showForm.set(true);
  }

  saveProduct(): void {
    if (this.prodForm().invalid()) return;
    const fd = this.prodModel();
    const edit = this.editingProduct();
    if (edit) {
      this.adminProductosService.updateProducto(edit.id_producto, fd).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.showForm.set(false);
        this.loadProductos();
      });
    } else {
      this.adminProductosService.createProducto(fd).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.showForm.set(false);
        this.loadProductos();
      });
    }
  }

  deleteProduct(id: string): void {
    this.pendingDeleteId.set(id);
    this.showConfirmDialog.set(true);
  }

  onConfirmarEliminar(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.showConfirmDialog.set(false);
    this.pendingDeleteId.set('');
    this.adminProductosService.deleteProducto(id).pipe(takeUntil(this.destroy$)).subscribe(() => this.loadProductos());
  }

  onCancelarEliminar(): void {
    this.showConfirmDialog.set(false);
    this.pendingDeleteId.set('');
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }
}
