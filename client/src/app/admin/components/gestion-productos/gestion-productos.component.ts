/** Componente para la gestión CRUD de productos desde el panel admin */
import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { form, required, minLength, min, FormField } from '@angular/forms/signals';
import { AdminProductosService } from '../../services/admin-productos.service';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { CatalogoService } from '../../../catalogo/services/catalogo.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DialogoConfirmacionComponent } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion.component';
import { PaginacionComponent } from '../../../shared/components/paginacion/paginacion.component';
import { SinResultadosComponent } from '../../../shared/components/sin-resultados/sin-resultados.component';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [FormField, LoadingComponent, DialogoConfirmacionComponent, PaginacionComponent, SinResultadosComponent],
  templateUrl: './gestion-productos.component.html',
  styleUrl: './gestion-productos.component.css',
})
export class GestionProductosComponent {
  readonly editingProduct = signal<Producto | null>(null);
  readonly showForm = signal(false);
  readonly showConfirmDialog = signal(false);
  readonly pendingDeleteId = signal('');
  readonly deleteError = signal<string | null>(null);

  private readonly adminProductosService = inject(AdminProductosService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly esAdmin = computed(() => this.authService.authState().rol === 'admin');

  private readonly categoriasSignal = toSignal(
    this.catalogoService.getCategorias(),
    { initialValue: [] as Categoria[] },
  );

  readonly categorias = computed(() => this.categoriasSignal());
  readonly productos = signal<Producto[]>([]);
  readonly loading = signal(true);
  readonly selectedCategory = signal('');
  readonly filtro = signal('');

  readonly paginaActual = signal(1);
  readonly pageSize = signal(10);

  readonly productosFiltrados = computed(() => {
    const f = this.filtro().toLowerCase();
    if (!f) return this.productos();
    return this.productos().filter(p =>
      p.id_producto.toLowerCase().includes(f) ||
      p.nombre.toLowerCase().includes(f)
    );
  });

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.productosFiltrados().length / this.pageSize())));

  readonly productosPaginados = computed(() => {
    const p = this.productosFiltrados();
    const inicio = (this.paginaActual() - 1) * this.pageSize();
    return p.slice(inicio, inicio + this.pageSize());
  });

  getCategoriaNombre(id_categoria: string): string {
    return this.categorias().find(c => c.id_categoria === id_categoria)?.nombre ?? id_categoria;
  }

  private readonly prodModel = signal({ id_categoria: '', nombre: '', precio_unitario: 0, descripcion: '', imagen: '', stock_minimo: 0 });
  protected prodForm = form(this.prodModel, (f) => {
    required(f.nombre, { message: 'El nombre es obligatorio' });
    minLength(f.nombre, 2, { message: 'Mínimo 2 caracteres' });
    required(f.id_categoria, { message: 'Seleccione una categoría' });
    required(f.precio_unitario, { message: 'El precio es obligatorio' });
    min(f.precio_unitario, 0.01, { message: 'Debe ser mayor a 0' });
    required(f.stock_minimo, { message: 'El stock mínimo es obligatorio' });
    min(f.stock_minimo, 0, { message: 'No puede ser negativo' });
    required(f.descripcion, { message: 'La descripción es obligatoria' });
    required(f.imagen, { message: 'La imagen es obligatoria' });
  });

  constructor() {
    this.loadProductos();
  }

  loadProductos(): void {
    this.loading.set(true);
    this.adminProductosService.getProductos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: p => {
        this.productos.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filterByCategory(event: Event): void {
    const catId = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(catId);
    this.loading.set(true);
    if (catId) {
      this.adminProductosService.getProductosByCategoria(catId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: p => {
          this.productos.set(p);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
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
    this.prodModel.set({ id_categoria: product.id_categoria, nombre: product.nombre, precio_unitario: product.precio_unitario, descripcion: product.descripcion ?? '', imagen: product.imagen ?? '', stock_minimo: (product as Producto & { stock_minimo?: number }).stock_minimo ?? 0 });
    this.showForm.set(true);
  }

  saveProduct(): void {
    if (this.prodForm().invalid()) return;
    const fd = this.prodModel();
    const edit = this.editingProduct();
    if (edit) {
      this.adminProductosService.updateProducto(edit.id_producto, fd).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.showForm.set(false);
        this.loadProductos();
      });
    } else {
      this.adminProductosService.createProducto(fd).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
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
    this.deleteError.set(null);
    this.adminProductosService.deleteProducto(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadProductos(),
      error: (err) => {
        this.deleteError.set(err.error?.detail || 'Error al eliminar producto');
        setTimeout(() => this.deleteError.set(null), 4000);
      },
    });
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
