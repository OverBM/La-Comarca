/** Componente de la página de contacto con formulario de consulta y datos de la tienda */
import { Component, signal, inject } from '@angular/core';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { Subject, of } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { TelefonoPipe } from '../../shared/pipes/telefono.pipe';
import { RETARDO_MOCK } from '../../core/constants/app.constants';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormField, NavbarComponent, FooterComponent, TelefonoPipe],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css',
})
export class ContactoComponent {
  private readonly MAPS_URL = 'https://maps.google.com/?q=Av+La+Mar+1234+Miraflores+Lima';
  private readonly document = inject(DOCUMENT);
  private readonly destroy$ = new Subject<void>();

  private model = signal({ nombre: '', email: '', telefono: '', mensaje: '' });
  protected formulario = form(this.model, (f) => {
    required(f.nombre, { message: 'El nombre es obligatorio' });
    minLength(f.nombre, 2, { message: 'Mínimo 2 caracteres' });
    required(f.email, { message: 'El email es obligatorio' });
    email(f.email, { message: 'Ingrese un email válido' });
    required(f.mensaje, { message: 'El mensaje es obligatorio' });
    minLength(f.mensaje, 10, { message: 'Mínimo 10 caracteres' });
  });

  enviando = signal(false);
  enviado = signal(false);
  error = signal('');

  onSubmit(): void {
    if (this.formulario().invalid()) return;

    this.enviando.set(true);
    this.error.set('');
    of({ exito: true }).pipe(delay(RETARDO_MOCK), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.enviado.set(true);
        this.enviando.set(false);
        this.model.set({ nombre: '', email: '', telefono: '', mensaje: '' });
      },
      error: () => {
        this.error.set('Error al enviar el mensaje');
        this.enviando.set(false);
      },
    });
  }

  abrirMapa(): void {
    this.document.defaultView?.open(this.MAPS_URL, '_blank');
  }
}
