import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-mi-perfil',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
})
export class MiPerfilComponent {}
