export interface AuthState {
  isAuthenticated: boolean;
  rol: string | null;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  id_usuario: string;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
  telefono: string;
}
