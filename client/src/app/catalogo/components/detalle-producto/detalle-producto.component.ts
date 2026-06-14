/** Componente que muestra el detalle completo de un producto con opción de agregar al carrito */
import { Component, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { CatalogoService } from '../../services/catalogo.service';
import { Producto } from '../../../core/models/producto.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CarritoService } from '../../../shared/services/carrito.service';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { DURACION_FEEDBACK, URL_IMAGEN_PLACEHOLDER } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [RouterLink, LoadingComponent, NavbarComponent, FooterComponent, FormatoPrecioPipe],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css',
})
export class DetalleProductoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogoService = inject(CatalogoService);
  private readonly carritoService = inject(CarritoService);
  private readonly location = inject(Location);

  private readonly productoId = toSignal<Producto | null>(
    this.route.paramMap.pipe(switchMap(params => {
      const id = params.get('id');
      return id ? this.catalogoService.getProductoById(id) : [];
    })),
    { initialValue: null },
  );

  readonly producto = computed(() => this.productoId());
  readonly loading = signal(false);
  readonly cantidad = signal(1);
  readonly total = computed(() => (this.producto()?.precio_unitario ?? 0) * this.cantidad());
  readonly added = signal(false);

  private readonly categorias = toSignal(this.catalogoService.getCategorias(), { initialValue: [] });
  readonly categoriaNombre = computed(() => {
    const p = this.producto();
    if (!p) return '';
    const cat = this.categorias().find(c => c.id_categoria === p.id_categoria);
    return cat?.nombre ?? p.id_categoria;
  });

  private readonly todosProductos = toSignal(this.catalogoService.getProductos(), { initialValue: [] });
  readonly relacionados = computed(() => {
    const p = this.producto();
    if (!p) return [];
    return this.todosProductos().filter(prod => prod.id_categoria === p.id_categoria && prod.id_producto !== p.id_producto);
  });

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
    this.carritoService.agregarItem(product, this.cantidad());
    this.added.set(true);
    setTimeout(() => this.added.set(false), DURACION_FEEDBACK);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = URL_IMAGEN_PLACEHOLDER;
  }
}