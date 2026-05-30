import { Injectable, signal, computed } from '@angular/core';
import { CarritoItem } from '../models/carrito.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  // Señal privada con el array de items del carrito
  private items = signal<CarritoItem[]>([]);

  // Señal pública de solo lectura para el número total de artículos
  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.cantidad, 0)
  );

  // Señal pública de solo lectura con el total en soles
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0)
  );

  // Señal para el mensaje de notificación del carrito
  readonly notification = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  // Temporizador para ocultar la notificación automáticamente
  private notificationTimer: ReturnType<typeof setTimeout> | null = null;

  /** Agrega un producto al carrito. Si ya existe, incrementa la cantidad. */
  addItem(producto: { id_producto: string; nombre: string; precio_unitario: number; imagen: string }, cantidad: number): void {
    this.items.update(current => {
      const existing = current.find(item => item.id_producto === producto.id_producto);
      if (existing) {
        // Si el producto ya está en el carrito, solo aumentamos la cantidad
        return current.map(item =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      // Si es nuevo, lo agregamos al array
      return [...current, { ...producto, cantidad }];
    });
    this.showNotification(`${producto.nombre} agregado al carrito`, 'success');
  }

  /** Elimina un producto del carrito por su id */
  removeItem(id_producto: string): void {
    this.items.update(current => current.filter(item => item.id_producto !== id_producto));
  }

  /** Actualiza la cantidad de un producto. Si la cantidad es 0, lo elimina. */
  updateQuantity(id_producto: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.removeItem(id_producto);
      return;
    }
    this.items.update(current =>
      current.map(item =>
        item.id_producto === id_producto ? { ...item, cantidad } : item
      )
    );
  }

  /** Vacía el carrito por completo */
  clear(): void {
    this.items.set([]);
  }

  // Muestra una notación temporal y la oculta después de 2.5 segundos
  private showNotification(message: string, type: 'success' | 'error'): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
    this.notification.set({ message, type });
    this.notificationTimer = setTimeout(() => {
      this.notification.set(null);
    }, 2500);
  }
}
