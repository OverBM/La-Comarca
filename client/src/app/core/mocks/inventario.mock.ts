export const MOCK_INVENTARIO = [
  { id_inventario: 'inv-001', id_producto: 'prod-001', stock_actual: 25, stock_minimo: 10, ultima_actualizacion: new Date('2026-05-29') },
  { id_inventario: 'inv-002', id_producto: 'prod-002', stock_actual: 3, stock_minimo: 15, ultima_actualizacion: new Date('2026-05-28') },
  { id_inventario: 'inv-003', id_producto: 'prod-003', stock_actual: 2, stock_minimo: 5, ultima_actualizacion: new Date('2026-05-29') },
  { id_inventario: 'inv-004', id_producto: 'prod-004', stock_actual: 20, stock_minimo: 8, ultima_actualizacion: new Date('2026-05-27') },
  { id_inventario: 'inv-005', id_producto: 'prod-005', stock_actual: 8, stock_minimo: 10, ultima_actualizacion: new Date('2026-05-29') },
  { id_inventario: 'inv-006', id_producto: 'prod-006', stock_actual: 15, stock_minimo: 5, ultima_actualizacion: new Date('2026-05-28') },
  { id_inventario: 'inv-007', id_producto: 'prod-007', stock_actual: 1, stock_minimo: 10, ultima_actualizacion: new Date('2026-05-29') },
  { id_inventario: 'inv-008', id_producto: 'prod-008', stock_actual: 30, stock_minimo: 10, ultima_actualizacion: new Date('2026-05-29') },
  { id_inventario: 'inv-009', id_producto: 'prod-009', stock_actual: 12, stock_minimo: 5, ultima_actualizacion: new Date('2026-05-28') },
];

export const MOCK_MOVIMIENTOS = [
  { id_movimiento: 'mov-001', id_producto: 'prod-001', tipo: 'entrada', cantidad: 20, motivo: 'Reposición diaria', id_usuario: 'usr-001', fecha: new Date('2026-05-29T06:00:00') },
  { id_movimiento: 'mov-002', id_producto: 'prod-002', tipo: 'salida', cantidad: -10, motivo: 'Venta del día', id_usuario: 'usr-001', fecha: new Date('2026-05-29T10:00:00') },
  { id_movimiento: 'mov-003', id_producto: 'prod-003', tipo: 'ajuste', cantidad: -1, motivo: 'Producto dañado', id_usuario: 'usr-001', fecha: new Date('2026-05-28T15:00:00') },
  { id_movimiento: 'mov-004', id_producto: 'prod-007', tipo: 'entrada', cantidad: 15, motivo: 'Horneado matutino', id_usuario: 'usr-001', fecha: new Date('2026-05-29T05:30:00') },
];
