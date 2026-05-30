import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminProductosService } from '../../services/admin-productos.service';
import { Producto } from '../../../catalogo/models/producto.model';
import { Categoria } from '../../../catalogo/models/categoria.model';
import { CatalogoService } from '../../../catalogo/services/catalogo.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-gestion-productos',
  imports: [FormsModule, LoadingComponent],
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
  formData: Omit<Producto, 'id_producto'> = { id_categoria: '', nombre: '', precio_unitario: 0, descripcion: '', imagen: '' };

  constructor(
    private adminProductosService: AdminProductosService,
    private catalogoService: CatalogoService,
  ) {}

  ngOnInit(): void {
    this.catalogoService.getCategorias().subscribe(c => this.categorias.set(c));
    this.loadProductos();
  }

  loadProductos(): void {
    this.loading.set(true);
    this.adminProductosService.getProductos().subscribe(p => {
      this.productos.set(p);
      this.loading.set(false);
    });
  }

  filterByCategory(catId: string): void {
    this.selectedCategory.set(catId);
    this.loading.set(true);
    if (catId) {
      this.adminProductosService.getProductosByCategoria(catId).subscribe(p => {
        this.productos.set(p);
        this.loading.set(false);
      });
    } else {
      this.loadProductos();
    }
  }

  openCreateForm(): void {
    this.editingProduct.set(null);
    this.formData = { id_categoria: '', nombre: '', precio_unitario: 0, descripcion: '', imagen: '' };
    this.showForm.set(true);
  }

  openEditForm(product: Producto): void {
    this.editingProduct.set(product);
    this.formData = { id_categoria: product.id_categoria, nombre: product.nombre, precio_unitario: product.precio_unitario, descripcion: product.descripcion, imagen: product.imagen };
    this.showForm.set(true);
  }

  saveProduct(): void {
    if (this.formData.precio_unitario < 0) {
      this.formData.precio_unitario = 0;
    }
    if (!this.formData.nombre.trim()) return;
    const edit = this.editingProduct();
    if (edit) {
      this.adminProductosService.updateProducto(edit.id_producto, this.formData).subscribe(() => {
        this.showForm.set(false);
        this.loadProductos();
      });
    } else {
      this.adminProductosService.createProducto(this.formData).subscribe(() => {
        this.showForm.set(false);
        this.loadProductos();
      });
    }
  }

  deleteProduct(id: string): void {
    if (confirm('¿Eliminar este producto?')) {
      this.adminProductosService.deleteProducto(id).subscribe(() => this.loadProductos());
    }
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }
}
