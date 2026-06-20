import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PedidosService } from '../../services/pedidos.service';
import { PedidoResumen, PedidoDetalle } from '../../models/pedido.models';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [RouterLink, FormatoPrecioPipe, LoadingComponent, NavbarComponent, FooterComponent, DatePipe],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.css',
})
export class MisPedidosComponent {
  protected readonly authService = inject(AuthService);
  private readonly pedidosService = inject(PedidosService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly pedidosResource = toSignal(
    this.pedidosService.obtenerMisPedidos(),
    { initialValue: [] as PedidoResumen[] },
  );

  readonly pedidos = this.pedidosResource;
  readonly loading = signal(false);

  readonly expandedId = signal<string | null>(null);
  readonly expandedPedido = signal<PedidoDetalle | undefined>(undefined);
  readonly detalleLoading = signal(false);

  toggleDetalle(id: string): void {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
      this.expandedPedido.set(undefined);
    } else {
      this.expandedId.set(id);
    this.detalleLoading.set(true);
    this.pedidosService.obtenerPedidoPorId(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: d => {
        this.expandedPedido.set(d ?? undefined);
        this.detalleLoading.set(false);
      },
      error: () => this.detalleLoading.set(false),
    });
    }
  }
}
