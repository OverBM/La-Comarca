import { Component, OnInit, signal, viewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoService } from '../catalogo/services/catalogo.service';
import { Producto } from '../catalogo/models/producto.model';
import { Categoria } from '../catalogo/models/categoria.model';
import { CartService } from '../core/services/cart.service';
import { LoadingComponent } from '../shared/components/loading/loading.component';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, LoadingComponent, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  loading = signal(true);
  slideIndex = signal(0);
  slideTrack = viewChild<ElementRef<HTMLElement>>('slideTrack');
  addedProducts = signal<Set<string>>(new Set());

  constructor(
    private catalogoService: CatalogoService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.catalogoService.getFeaturedProductos().subscribe({
      next: (products) => {
        this.featuredProducts.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.catalogoService.getCategorias().subscribe({
      next: (cats) => this.categorias.set(cats),
    });
  }

  getCategoriaName(id: string): string {
    const cat = this.categorias().find((c) => c.id_categoria === id);
    return cat ? cat.nombre : id;
  }

  addToCart(product: Producto, event: Event): void {
    event.stopPropagation();
    this.cartService.addItem(
      {
        id_producto: product.id_producto,
        nombre: product.nombre,
        precio_unitario: product.precio_unitario,
        imagen: product.imagen,
      },
      1
    );
    const updated = new Set(this.addedProducts());
    updated.add(product.id_producto);
    this.addedProducts.set(updated);
    setTimeout(() => {
      const cleared = new Set(this.addedProducts());
      cleared.delete(product.id_producto);
      this.addedProducts.set(cleared);
    }, 1500);
  }

  isAdded(id: string): boolean {
    return this.addedProducts().has(id);
  }

  scrollSlide(dir: number): void {
    const track = this.slideTrack()?.nativeElement;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>('.slide-card');
    if (!cards.length) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const cardW = cards[0].offsetWidth;
    const currentIdx = Math.round(track.scrollLeft / (cardW + gap));
    const targetIdx = Math.max(0, Math.min(currentIdx + dir, cards.length - 1));
    cards[targetIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    this.slideIndex.set(targetIdx);
  }

  actualizarSlidePosicion(): void {
    const track = this.slideTrack()?.nativeElement;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>('.slide-card');
    if (!cards.length) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const cardW = cards[0].offsetWidth;
    const idx = Math.round(track.scrollLeft / (cardW + gap));
    this.slideIndex.set(Math.min(idx, cards.length - 1));
  }

  irASlide(idx: number): void {
    const track = this.slideTrack()?.nativeElement;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>('.slide-card');
    if (!cards.length) return;
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    this.slideIndex.set(idx);
  }
}