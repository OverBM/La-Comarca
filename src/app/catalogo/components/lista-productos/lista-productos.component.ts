/** Componente que lista productos con filtros por categoría y búsqueda para el catálogo público */
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, switchMap, takeUntil } from 'rxjs';
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
export class ListaProductosComponent implements OnInit, OnDestroy {
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  selectedCategory = signal('');
  sortBy = signal('');

  private readonly allProducts = signal<Producto[]>([]);
  private readonly catalogoService = inject(CatalogoService);
  private readonly carritoService = inject(CarritoService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  addedProductIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    forkJoin({
      categorias: this.catalogoService.getCategorias().pipe(takeUntil(this.destroy$)),
      productos: this.catalogoService.getProductos().pipe(takeUntil(this.destroy$)),
    }).pipe(
      takeUntil(this.destroy$),
      switchMap(({ categorias, productos }) => {
        this.categorias.set(categorias);
        this.allProducts.set(productos);
        this.loading.set(false);
        return this.route.queryParams.pipe(takeUntil(this.destroy$));
      }),
    ).subscribe(params => {
      const q = params['q'];
      if (q) {
        this.searchQuery.set(q);
      }
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filterByCategory(categoriaId: string): void {
    this.selectedCategory.set(categoriaId);
    this.applyFilters();
  }

  onSearchInput(event: Event): void {
    this.onSearch((event.target as HTMLInputElement).value);
  }

  onSortChange(event: Event): void {
    this.onSort((event.target as HTMLSelectElement).value);
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
    let filtered = [...this.allProducts()];
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
    this.productos.set([...this.allProducts()]);
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
