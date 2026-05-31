export interface CarritoItem {
  id_producto: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  imagen: string | null;
}
