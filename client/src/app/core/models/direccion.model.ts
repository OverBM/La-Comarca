export interface Direccion {
  id_direccion: string;
  id_cliente?: string;
  calle: string;
  ciudad: string;
  referencia?: string;
  esPrincipal: boolean;
}
