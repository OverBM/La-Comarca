import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-mis-pedidos',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.css',
})
export class MisPedidosComponent {}
