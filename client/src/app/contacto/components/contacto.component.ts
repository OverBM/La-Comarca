import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { TelefonoPipe } from '../../shared/pipes/telefono.pipe';
import { RETARDO_MOCK } from '../../core/constants/app.constants';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule, NavbarComponent, FooterComponent, TelefonoPipe],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css',
})
export class ContactoComponent {
  private _nombre = signal('');
  get nombre(): string { return this._nombre(); }
  set nombre(v: string) { this._nombre.set(v); }

  private _email = signal('');
  get email(): string { return this._email(); }
  set email(v: string) { this._email.set(v); }

  private _telefono = signal('');
  get telefono(): string { return this._telefono(); }
  set telefono(v: string) { this._telefono.set(v); }

  private _mensaje = signal('');
  get mensaje(): string { return this._mensaje(); }
  set mensaje(v: string) { this._mensaje.set(v); }

  enviando = signal(false);
  enviado = signal(false);
  error = signal('');

  onSubmit(): void {
    if (!this._nombre() || !this._email() || !this._mensaje()) {
      this.error.set('Completa los campos obligatorios');
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    of({ exito: true }).pipe(delay(RETARDO_MOCK)).subscribe({
      next: () => {
        this.enviado.set(true);
        this.enviando.set(false);
        this._nombre.set('');
        this._email.set('');
        this._telefono.set('');
        this._mensaje.set('');
      },
      error: () => {
        this.error.set('Error al enviar el mensaje');
        this.enviando.set(false);
      },
    });
  }
}
