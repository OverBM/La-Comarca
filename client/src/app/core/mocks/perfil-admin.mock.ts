export const PERFIL_ADMIN_MOCK = {
  stats: {
    pedidosGestionados: 1248,
    ingresosGenerados: 482500,
    productosActivos: 156,
    valoracion: 4.8,
  },
  negocio: {
    nombre: 'La Comarca Panadería Artesanal',
    ruc: '20123456789',
    direccion: 'Av. Los Panaderos 456, Miraflores',
    telefono: '999 888 777',
  },
  actividadReciente: [
    { id: 'act-001', accion: 'Nuevo pedido #PED-018 registrado', timestamp: new Date(Date.now() - 30 * 60000) },
    { id: 'act-002', accion: 'Producto "Pan Francés" actualizado', timestamp: new Date(Date.now() - 2 * 3600000) },
    { id: 'act-003', accion: 'Comprobante F001-000005 emitido', timestamp: new Date(Date.now() - 4 * 3600000) },
    { id: 'act-004', accion: 'Inventario actualizado: +120 unidades', timestamp: new Date(Date.now() - 6 * 3600000) },
    { id: 'act-005', accion: 'Usuario "Cliente Demo" registrado', timestamp: new Date(Date.now() - 24 * 3600000) },
    { id: 'act-006', accion: 'Reporte mensual de ventas generado', timestamp: new Date(Date.now() - 48 * 3600000) },
  ],
};
