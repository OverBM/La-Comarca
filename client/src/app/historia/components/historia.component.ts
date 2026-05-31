import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-historia',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './historia.component.html',
  styleUrl: './historia.component.css',
})
export class HistoriaComponent {}
