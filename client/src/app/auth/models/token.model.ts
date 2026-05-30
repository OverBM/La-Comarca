export interface Token {
  accessToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  sub: string;
  email: string;
  rol: 'admin' | 'cliente' | 'vendedor';
  nombre: string;
  iat?: number;
  exp?: number;
}
