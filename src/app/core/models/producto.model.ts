export interface Producto {
  id_producto: string;
  id_categoria: string;
  nombre: string;
  precio_unitario: number;
  descripcion: string | null;
  imagen: string | null;
}
