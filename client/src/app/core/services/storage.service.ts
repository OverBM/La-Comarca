import { Injectable } from '@angular/core';

const TOKEN_KEY = 'la-comarca-token';
const USER_KEY = 'la-comarca-user';

@Injectable({ providedIn: 'root' })
export class StorageService {

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getUser(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  setUser(user: string): void {
    localStorage.setItem(USER_KEY, user);
  }

  clear(): void {
    localStorage.clear();
  }
}
