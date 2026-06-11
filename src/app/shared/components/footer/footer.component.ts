/** Componente del footer de la aplicación con enlaces y datos de contacto */
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DURACION_FEEDBACK_NEWSLETTER } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  subscribed = signal(false);

  suscribir(emailInput: HTMLInputElement): void {
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) return;
    this.subscribed.set(true);
    emailInput.value = '';
    setTimeout(() => this.subscribed.set(false), DURACION_FEEDBACK_NEWSLETTER);
  }
}