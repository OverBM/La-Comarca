import { Injectable, signal, computed, effect } from '@angular/core';
import { Direccion } from '../../core/models/direccion.model';

const STORAGE_KEY = 'la-comarca-direcciones';

@Injectable({ providedIn: 'root' })
export class DireccionService {
  private direccionesSignal = signal<Direccion[]>(this.cargarDesdeStorage());
  readonly direcciones = this.direccionesSignal.asReadonly();

  constructor() {
    effect(() => {
      const data = this.direccionesSignal();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });
  }

  private cargarDesdeStorage(): Direccion[] {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Direccion[];
    } catch {
    }
    return [];
  }

  agregarDireccion(d: Omit<Direccion, 'id'>): void {
    const nueva: Direccion = { ...d, id: crypto.randomUUID?.() ?? `dir-${Date.now()}` };
    this.direccionesSignal.update(list => [...list, nueva]);
  }

  eliminarDireccion(id: string): void {
    this.direccionesSignal.update(list => list.filter(d => d.id !== id));
  }
}
