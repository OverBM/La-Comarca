export interface PedidoResumen {
  id_pedido: string;
  cliente: string;
  fecha: Date;
  total: number;
  metodo_pago: string;
  estado_pago: string;
}
