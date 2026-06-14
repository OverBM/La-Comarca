/** Componente que lista productos con filtros por categoría y búsqueda para el catálogo público */
import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { CatalogoService } from '../../services/catalogo.service';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CarritoService } from '../../../shared/services/carrito.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { DURACION_FEEDBACK } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [RouterLink, LoadingComponent, NavbarComponent, FooterComponent, FormatoPrecioPipe],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.css',
})
export class ListaProductosComponent {
  private readonly catalogoService = inject(CatalogoService);
  private readonly carritoService = inject(CarritoService);
  private readonly route = inject(ActivatedRoute);

  private readonly cargaInicial = toSignal(
    forkJoin({
      categorias: this.catalogoService.getCategorias(),
      productos: this.catalogoService.getProductos(),
    }),
    { initialValue: { categorias: [] as Categoria[], productos: [] as Producto[] } },
  );

  readonly categorias = computed(() => this.cargaInicial().categorias);
  readonly allProducts = computed(() => this.cargaInicial().productos);
  readonly loading = signal(true);

  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');
  readonly sortBy = signal('');

  readonly productos = computed(() => {
    const all = this.allProducts();
    let filtered = [...all];
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
    return filtered;
  });

  addedProductIds = signal<Set<string>>(new Set());

  constructor() {
    const params = this.route.snapshot.queryParams;
    const q = params['q'];
    if (q) {
      this.searchQuery.set(q);
    }
    this.loading.set(false);
  }

  filterByCategory(categoriaId: string): void {
    this.selectedCategory.set(categoriaId);
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onSort(value: string): void {
    this.sortBy.set(value);
  }

  getCategoryName(categoriaId: string): string {
    return this.categorias().find((c: Categoria) => c.id_categoria === categoriaId)?.nombre ?? categoriaId;
  }

  clearFilters(): void {
    this.selectedCategory.set('');
    this.searchQuery.set('');
  }

  agregarAlCarrito(event: Event, product: Producto): void {
    event.stopPropagation();
    event.preventDefault();
    this.carritoService.agregarItem(product, 1);
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
    }, DURACION_FEEDBACK);
  }
}
