export const MOCK_PEDIDOS = [
  {
    id_pedido: 'ped-001',
    id_cliente: 'cli-001',
    fecha_pedido: new Date('2026-05-29T10:30:00'),
    cliente_nombre: 'María García',
    detalle: [
      { id_detalle: 'det-001', id_pedido: 'ped-001', id_producto: 'prod-001', cantidad: 2, precio_unitario: 8.50, subtotal: 17.00 },
      { id_detalle: 'det-002', id_pedido: 'ped-001', id_producto: 'prod-003', cantidad: 1, precio_unitario: 45.00, subtotal: 45.00 },
    ],
  },
  {
    id_pedido: 'ped-002',
    id_cliente: 'cli-002',
    fecha_pedido: new Date('2026-05-29T11:15:00'),
    cliente_nombre: 'Carlos Mendoza',
    detalle: [
      { id_detalle: 'det-003', id_pedido: 'ped-002', id_producto: 'prod-002', cantidad: 5, precio_unitario: 3.20, subtotal: 16.00 },
      { id_detalle: 'det-004', id_pedido: 'ped-002', id_producto: 'prod-007', cantidad: 3, precio_unitario: 7.50, subtotal: 22.50 },
    ],
  },
  {
    id_pedido: 'ped-003',
    id_cliente: 'cli-003',
    fecha_pedido: new Date('2026-05-28T09:00:00'),
    cliente_nombre: 'Ana Torres',
    detalle: [
      { id_detalle: 'det-005', id_pedido: 'ped-003', id_producto: 'prod-005', cantidad: 2, precio_unitario: 6.00, subtotal: 12.00 },
    ],
  },
  {
    id_pedido: 'ped-004',
    id_cliente: 'cli-001',
    fecha_pedido: new Date('2026-05-28T14:45:00'),
    cliente_nombre: 'María García',
    detalle: [
      { id_detalle: 'det-006', id_pedido: 'ped-004', id_producto: 'prod-008', cantidad: 4, precio_unitario: 5.00, subtotal: 20.00 },
      { id_detalle: 'det-007', id_pedido: 'ped-004', id_producto: 'prod-009', cantidad: 2, precio_unitario: 8.00, subtotal: 16.00 },
    ],
  },
];

export function calcularTotal(detalle: { subtotal: number }[]): number {
  return detalle.reduce((sum, item) => sum + item.subtotal, 0);
}
