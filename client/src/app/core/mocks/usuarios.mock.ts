export interface MockUsuario {
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  rol: 'admin' | 'cliente';
}

export const MOCK_USUARIOS: Record<string, MockUsuario> = {
  'admin@comarca.com': { id_usuario: 'usr-001', nombre: 'Diana', apellido: 'Alfreda', email: 'admin@comarca.com', telefono: '999 888 777', password: 'admin123', rol: 'admin' },
  'cliente@comarca.com': { id_usuario: 'usr-002', nombre: 'Cliente', apellido: 'Demo', email: 'cliente@comarca.com', telefono: '988 777 666', password: 'cliente123', rol: 'cliente' },
};
