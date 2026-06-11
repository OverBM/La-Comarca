export interface Comprobante {
  id_comprobante: string;
  id_pedido: string;
  id_empresa?: string | null;
  tipo: 'Boleta' | 'Factura' | 'Nota de Venta';
  serie: string;
  correlativo: string;
  total: number;
  fecha: Date;
  cliente: string;
  ruc?: string;
  razon_social?: string;
  estado_sunat: 'Aceptado' | 'Enviando' | 'Pendiente' | 'Rechazado';
}
