import { Component, input } from '@angular/core';

@Component({
  selector: 'app-sin-resultados',
  standalone: true,
  templateUrl: './sin-resultados.component.html',
  styleUrls: ['./sin-resultados.component.css'],
})
export class SinResultadosComponent {
  readonly mensaje = input('No se encontraron resultados');
}
