export interface MovimientoInventario {
  id_movimiento: string;
  id_producto: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  id_usuario: string;
  fecha: Date;
}

export interface MovimientosPaginados {
  items: MovimientoInventario[];
  total: number;
  page: number;
  limit: number;
}
