export interface Comprobante {
  id_comprobante: string;
  id_pedido: string;
  tipo: 'Boleta' | 'Factura' | 'Nota de Venta';
  serie: string;
  correlativo: string;
  total: number;
  fecha: Date;
  cliente: string;
}
