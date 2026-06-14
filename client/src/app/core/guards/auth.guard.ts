import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const token = this.storage.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}
