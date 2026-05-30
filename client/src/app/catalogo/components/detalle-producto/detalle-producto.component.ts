import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CatalogoService } from '../../services/catalogo.service';
import { Producto } from '../../models/producto.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-detalle-producto',
  imports: [RouterLink, LoadingComponent, NavbarComponent, FooterComponent],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css',
})
export class DetalleProductoComponent implements OnInit, OnDestroy {
  producto = signal<Producto | null>(null);
  loading = signal(true);
  cantidad = signal(1);
  added = signal(false);
  categoriaNombre = signal('');
  relacionados = signal<Producto[]>([]);

  private route = inject(ActivatedRoute);
  private catalogoService = inject(CatalogoService);
  private cartService = inject(CartService);
  private location = inject(Location);
  private destroy$ = new Subject<void>();

  volver(): void {
    this.location.back();
  }

  incrementar(): void {
    this.cantidad.update(c => Math.min(c + 1, 99));
  }

  decrementar(): void {
    this.cantidad.update(c => Math.max(c - 1, 1));
  }

  agregarAlCarrito(): void {
    const product = this.producto();
    if (!product) return;
    this.cartService.addItem(product, this.cantidad());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1500);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/400x300/e6e2db/504440?text=La+Comarca';
  }

  private cargarProducto(id: string): void {
    this.loading.set(true);
    this.catalogoService.getProductoById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (product) => {
        this.producto.set(product ?? null);
        if (product) {
          this.catalogoService.getCategorias().pipe(takeUntil(this.destroy$)).subscribe(cats => {
            const cat = cats.find(c => c.id_categoria === product.id_categoria);
            this.categoriaNombre.set(cat?.nombre ?? product.id_categoria);
          });
          this.catalogoService.getProductosByCategoria(product.id_categoria).pipe(takeUntil(this.destroy$)).subscribe(prods => {
            this.relacionados.set(prods.filter(p => p.id_producto !== product.id_producto));
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarProducto(id);
        this.cantidad.set(1);
        this.added.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}