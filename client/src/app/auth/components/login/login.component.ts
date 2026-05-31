import { Component, signal, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnDestroy {
  private _email = signal('');
  get email(): string { return this._email(); }
  set email(v: string) { this._email.set(v); }

  private _password = signal('');
  get password(): string { return this._password(); }
  set password(v: string) { this._password.set(v); }

  error = signal('');
  loading = signal(false);

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(): void {
    if (!this._email() || !this._password()) {
      this.error.set('Ingrese email y contraseña');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this._email(), this._password()).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.usuario.rol === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Credenciales incorrectas');
      },
    });
  }
}
