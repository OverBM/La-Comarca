/** Componente de la página de historia que muestra la trayectoria de La Comarca */
import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './historia.component.html',
  styleUrl: './historia.component.css',
})
export class HistoriaComponent {}
