import { Injectable } from '@angular/core';

const TOKEN_KEY = 'la-comarca-token';
const USER_KEY = 'la-comarca-user';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private persist = true;

  setPersist(value: boolean): void {
    this.persist = value;
  }

  private get storage(): Storage {
    return this.persist ? localStorage : sessionStorage;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    this.storage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  getUser(): string | null {
    return localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  }

  setUser(user: string): void {
    this.storage.setItem(USER_KEY, user);
  }
}