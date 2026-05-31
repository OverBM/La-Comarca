export const MOCK_USUARIOS: Record<string, { id_usuario: string; nombre: string; password: string; rol: 'admin' | 'cliente' }> = {
  'admin@comarca.com': { id_usuario: 'usr-001', nombre: 'Admin La Comarca', password: 'admin123', rol: 'admin' },
  'cliente@comarca.com': { id_usuario: 'usr-002', nombre: 'Cliente Demo', password: 'cliente123', rol: 'cliente' },
};
