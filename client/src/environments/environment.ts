const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

export const environment = {
  production: isProd,
  apiUrl: isProd ? 'https://lacomarca-api.onrender.com' : 'http://localhost:8000',
  useMock: false,
};
