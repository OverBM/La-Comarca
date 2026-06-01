import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, LoadingComponent, DialogoConfirmacionComponent],
  templateUrl: './gestion-productos.component.html',
  styleUrl: './gestion-productos.component.css',
})
export class GestionProductosComponent implements OnInit, OnDestroy {
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  loading = signal(true);
  selectedCategory = signal('');
  editingProduct = signal<Producto | null>(null);
  showForm = signal(false);
  formData = signal<Omit<Producto, 'id_producto'>>({ id_categoria: '', nombre: '', precio_unitario: 0, descripcion: '', imagen: '' });
  showConfirmDialog = signal(false);
  pendingDeleteId = signal('');

  private readonly destroy$ = new Subject<void>();

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

  filterByCategory(catId: string): void {
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
    this.formData.set({ id_categoria: '', nombre: '', precio_unitario: 0, descripcion: '', imagen: '' });
    this.showForm.set(true);
  }

  openEditForm(product: Producto): void {
    this.editingProduct.set(product);
    this.formData.set({ id_categoria: product.id_categoria, nombre: product.nombre, precio_unitario: product.precio_unitario, descripcion: product.descripcion, imagen: product.imagen });
    this.showForm.set(true);
  }

  actualizarFormData(campo: string, valor: string | number): void {
    this.formData.update(d => ({ ...d, [campo]: valor }));
  }

  saveProduct(): void {
    const fd = this.formData();
    if (fd.precio_unitario < 0) {
      this.formData.update(d => ({ ...d, precio_unitario: 0 }));
    }
    if (!fd.nombre.trim()) return;
    const edit = this.editingProduct();
    if (edit) {
      this.adminProductosService.updateProducto(edit.id_producto, this.formData()).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.showForm.set(false);
        this.loadProductos();
      });
    } else {
      this.adminProductosService.createProducto(this.formData()).pipe(takeUntil(this.destroy$)).subscribe(() => {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
