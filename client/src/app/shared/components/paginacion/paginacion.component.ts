import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [],
  templateUrl: './paginacion.component.html',
  styleUrl: './paginacion.component.css',
})
export class PaginacionComponent {
  readonly totalPaginas = input.required<number>();
  readonly paginaActual = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageSizeOptions = input<number[]>([10, 15, 20]);

  readonly paginaCambiada = output<number>();
  readonly pageSizeCambiado = output<number>();

  readonly mostrarAnterior = computed(() => this.paginaActual() > 1);
  readonly mostrarSiguiente = computed(() => this.paginaActual() < this.totalPaginas());

  readonly numerosPagina = computed(() => {
    const total = this.totalPaginas();
    const actual = this.paginaActual();
    const rango: number[] = [];
    const inicio = Math.max(1, actual - 2);
    const fin = Math.min(total, actual + 2);
    for (let i = inicio; i <= fin; i++) rango.push(i);
    return rango;
  });

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas() && pagina !== this.paginaActual()) {
      this.paginaCambiada.emit(pagina);
    }
  }

  cambiarPageSize(event: Event): void {
    const valor = Number((event.target as HTMLSelectElement).value);
    this.pageSizeCambiado.emit(valor);
  }
}
