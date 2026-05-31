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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });
  }

  private cargarDesdeStorage(): Direccion[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Direccion[];
    } catch {
    }
    return [
      { id: 'dir-001', calle: 'Av. Los Panaderos 456', ciudad: 'Miraflores', referencia: 'Cerca a la plaza', esPrincipal: true },
    ];
  }

  agregarDireccion(d: Omit<Direccion, 'id'>): void {
    const nueva: Direccion = { ...d, id: crypto.randomUUID?.() ?? `dir-${Date.now()}` };
    this.direccionesSignal.update(list => [...list, nueva]);
  }

  eliminarDireccion(id: string): void {
    this.direccionesSignal.update(list => list.filter(d => d.id !== id));
  }
}
