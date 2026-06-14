import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { FormatoPrecioPipe } from '../../../shared/pipes/formato-precio.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { environment } from '../../../../environments/environment';

interface DetallePedido {
  id_detalle: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface PedidoDetalle {
  id_pedido: string;
  cliente_nombre: string;
  fecha_pedido: string;
  total: number;
  detalle: DetallePedido[];
}

interface PedidoResumen {
  id_pedido: string;
  cliente: string;
  fecha: string;
  total: number;
}

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [RouterLink, FormatoPrecioPipe, LoadingComponent, NavbarComponent, FooterComponent, DatePipe],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.css',
})
export class MisPedidosComponent {
  protected readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  private readonly pedidosResource = httpResource<PedidoResumen[]>(() => {
    if (!this.authService.authState().isAuthenticated) return undefined;
    return `${this.apiUrl}/pedidos/mis-pedidos`;
  });

  protected readonly pedidos = computed(() => this.pedidosResource.value() ?? []);
  protected readonly loading = computed(() => this.pedidosResource.isLoading());

  protected readonly expandedId = signal<string | null>(null);

  private readonly detalleResource = httpResource<PedidoDetalle | undefined>(() => {
    const id = this.expandedId();
    if (!id) return undefined;
    return `${this.apiUrl}/pedidos/${id}`;
  });

  protected readonly expandedPedido = computed(() => this.detalleResource.value() ?? null);
  protected readonly detalleLoading = computed(() => this.detalleResource.isLoading());

  toggleDetalle(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
}