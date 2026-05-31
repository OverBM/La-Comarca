import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  protected carritoService = inject(CarritoService);
  protected menuOpen = signal(false);
  private router = inject(Router);

  private readonly paginas: Record<string, string> = {
    'inicio': '/',
    'home': '/',
    'catálogo': '/catalogo',
    'catalogo': '/catalogo',
    'productos': '/catalogo',
    'sobre nosotros': '/historia',
    'nosotros': '/historia',
    'historia': '/historia',
    'contacto': '/contacto',
    'perfil': '/auth/login',
    'mi perfil': '/auth/login',
    'mis pedidos': '/pedidos',
    'pedidos': '/pedidos',
    'carrito': '/catalogo',
    'admin': '/admin/dashboard',
    'panel': '/admin/dashboard',
  };

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  buscar(term: string): void {
    this.menuOpen.set(false);
    const q = term.trim().toLowerCase();

    if (q && this.paginas[q]) {
      this.router.navigate([this.paginas[q]]);
      return;
    }

    if (q) {
      for (const [key, ruta] of Object.entries(this.paginas)) {
        if (key.includes(q) || q.includes(key)) {
          this.router.navigate([ruta]);
          return;
        }
      }
    }

    this.router.navigate(['/catalogo'], { queryParams: q ? { q } : undefined });
  }
}