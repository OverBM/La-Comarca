import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private storage: StorageService,
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const token = this.storage.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}
