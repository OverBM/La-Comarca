export interface Usuario {
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: 'admin' | 'cliente' | 'vendedor';
  activo: boolean;
  fecha_registro: Date;
}
