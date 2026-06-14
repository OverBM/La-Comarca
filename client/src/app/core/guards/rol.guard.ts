import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RolGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const rol = this.authService.getRol();
    if (rol !== 'admin') {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
