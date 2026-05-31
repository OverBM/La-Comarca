import { Injectable, signal, computed } from '@angular/core';
import { CarritoItem } from '../../core/models/carrito.model';
import { DURACION_FEEDBACK_CARRITO } from '../../core/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private items = signal<CarritoItem[]>([]);

  readonly totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.cantidad, 0)
  );

  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0)
  );

  readonly notificacion = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  private notificationTimer: ReturnType<typeof setTimeout> | null = null;

  agregarItem(producto: { id_producto: string; nombre: string; precio_unitario: number; imagen: string | null }, cantidad: number): void {
    this.items.update(current => {
      const existing = current.find(item => item.id_producto === producto.id_producto);
      if (existing) {
        return current.map(item =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * item.precio_unitario }
            : item
        );
      }
      const subtotal = producto.precio_unitario * cantidad;
      return [...current, { ...producto, cantidad, subtotal }];
    });
    this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
  }

  eliminarItem(id_producto: string): void {
    this.items.update(current => current.filter(item => item.id_producto !== id_producto));
  }

  actualizarCantidad(id_producto: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminarItem(id_producto);
      return;
    }
    this.items.update(current =>
      current.map(item =>
        item.id_producto === id_producto ? { ...item, cantidad, subtotal: cantidad * item.precio_unitario } : item
      )
    );
  }

  limpiar(): void {
    this.items.set([]);
  }

  private mostrarNotificacion(message: string, type: 'success' | 'error'): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
    this.notificacion.set({ message, type });
    this.notificationTimer = setTimeout(() => {
      this.notificacion.set(null);
    }, DURACION_FEEDBACK_CARRITO);
  }
}
