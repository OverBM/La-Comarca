import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function rolGuard(allowedRoles: string[]) {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const rol = authService.getRol();
    if (!rol || !allowedRoles.includes(rol)) {
      router.navigate(['/']);
      return false;
    }
    return true;
  };
}
