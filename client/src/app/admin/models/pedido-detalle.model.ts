export interface PedidoDetalle {
  id_pedido: string;
  id_cliente: string;
  cliente_nombre: string;
  fecha_pedido: Date;
  detalle: {
    id_detalle: string;
    id_producto: string;
    nombre_producto?: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  total: number;
}
