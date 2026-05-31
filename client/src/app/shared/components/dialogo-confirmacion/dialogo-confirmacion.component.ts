import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialogo-confirmacion',
  standalone: true,
  imports: [],
  templateUrl: './dialogo-confirmacion.component.html',
  styleUrl: './dialogo-confirmacion.component.css',
})
export class DialogoConfirmacionComponent {
  @Input({ required: true }) mensaje = '';
  @Input() titulo = 'Confirmar acci\u00f3n';
  @Input() textoBoton = 'Eliminar';

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  onConfirmar(): void {
    this.confirmar.emit();
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}