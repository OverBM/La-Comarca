import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../services/catalogo.service';
import { Producto } from '../../models/producto.model';
import { Categoria } from '../../models/categoria.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CartService } from '../../../core/services/cart.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-lista-productos',
  imports: [RouterLink, FormsModule, LoadingComponent, NavbarComponent, FooterComponent],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.css',
})
export class ListaProductosComponent implements OnInit {
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  selectedCategory = signal('');
  sortBy = signal('');

  private allProducts: Producto[] = [];
  private catalogoService = inject(CatalogoService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  addedProductIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.catalogoService.getCategorias().subscribe(cats => this.categorias.set(cats));
    this.catalogoService.getProductos().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.route.queryParams.subscribe(params => {
          const q = params['q'];
          if (q) {
            this.searchQuery.set(q);
          }
          this.applyFilters();
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filterByCategory(categoriaId: string): void {
    this.selectedCategory.set(categoriaId);
    this.applyFilters();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  onSort(value: string): void {
    this.sortBy.set(value);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.allProducts];
    const cat = this.selectedCategory();
    if (cat) {
      filtered = filtered.filter(p => p.id_categoria === cat);
    }
    const q = this.searchQuery().toLowerCase();
    if (q) {
      filtered = filtered.filter(p => p.nombre.toLowerCase().includes(q));
    }
    const sort = this.sortBy();
    if (sort === 'nombre') {
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sort === 'precio') {
      filtered.sort((a, b) => a.precio_unitario - b.precio_unitario);
    }
    this.productos.set(filtered);
  }

  getCategoryName(categoriaId: string): string {
    return this.categorias().find(c => c.id_categoria === categoriaId)?.nombre ?? categoriaId;
  }

  clearFilters(): void {
    this.selectedCategory.set('');
    this.searchQuery.set('');
    this.productos.set([...this.allProducts]);
  }

  agregarAlCarrito(event: Event, product: Producto): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addItem(product, 1);
    this.addedProductIds.update(set => {
      const newSet = new Set(set);
      newSet.add(product.id_producto);
      return newSet;
    });
    setTimeout(() => {
      this.addedProductIds.update(set => {
        const newSet = new Set(set);
        newSet.delete(product.id_producto);
        return newSet;
      });
    }, 1500);
  }
}
