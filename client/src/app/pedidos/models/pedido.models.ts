export interface PedidoResumen {
  id_pedido: string;
  cliente: string;
  fecha: string;
  total: number;
}

export interface PedidoDetalle {
  id_pedido: string;
  id_cliente: string;
  cliente_nombre: string;
  fecha_pedido: string;
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

export interface PedidoCreacion {
  id_cliente: string;
  items: { id_producto: string; cantidad: number }[];
  metodo_pago: string;
}
