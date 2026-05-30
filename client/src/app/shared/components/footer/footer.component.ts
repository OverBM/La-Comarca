import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
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
    setTimeout(() => this.subscribed.set(false), 4000);
  }
}