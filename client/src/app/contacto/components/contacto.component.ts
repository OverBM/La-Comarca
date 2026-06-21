/** Componente de la página de contacto con formulario de consulta y datos de la tienda */
import { Component, signal, inject } from '@angular/core';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { TelefonoPipe } from '../../shared/pipes/telefono.pipe';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormField, NavbarComponent, FooterComponent, TelefonoPipe],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css',
})
export class ContactoComponent {
  private readonly MAPS_URL = 'https://www.google.com/maps/place/San+Pedro+1410,+lima+15036/data=!4m2!3m1!1s0x9105c872b7bcf307:0x873d3db69a928b78?sa=X&ved=1t:242&ictx=111';
  private readonly document = inject(DOCUMENT);

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

    const { nombre, email, telefono, mensaje } = this.model();
    const asunto = encodeURIComponent(`Consulta de ${nombre}`);
    const cuerpo = encodeURIComponent(
      `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono}\n\nMensaje:\n${mensaje}`
    );
    this.document.defaultView?.open(
      `mailto:comarcatesting@gmail.com?subject=${asunto}&body=${cuerpo}`,
      '_blank'
    );

    this.enviado.set(true);
    this.model.set({ nombre: '', email: '', telefono: '', mensaje: '' });
  }

  abrirMapa(): void {
    this.document.defaultView?.open(this.MAPS_URL, '_blank');
  }
}
