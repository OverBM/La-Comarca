export interface Inventario {
  id_inventario: string;
  id_producto: string;
  stock_actual: number;
  stock_minimo: number;
  ultima_actualizacion: Date;
}
