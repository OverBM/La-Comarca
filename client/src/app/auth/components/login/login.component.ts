import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Ingrese email y contraseña';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.usuario.rol === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Credenciales incorrectas';
      },
    });
  }
}
