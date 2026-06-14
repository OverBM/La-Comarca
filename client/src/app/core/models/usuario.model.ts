export interface Usuario {
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: string;
  activo: boolean;
}
