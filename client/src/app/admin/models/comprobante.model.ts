export interface Comprobante {
  id_comprobante: string;
  id_pedido: string;
  tipo: string;
  serie: string;
  correlativo: string;
  total: number;
  fecha: string;
  cliente: string;
  ruc?: string;
  razon_social?: string;
  enlace?: string;
}
