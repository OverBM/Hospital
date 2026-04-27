import { Injectable, signal, computed } from '@angular/core';
import { Paciente } from '../models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  readonly AFORO_MAXIMO = 10;

  private _pacientes = signal<Paciente[]>([]);
  private _nextId = signal<number>(1);

  readonly pacientes = this._pacientes.asReadonly();
  readonly totalPacientes = computed(() => this._pacientes().length);
  readonly aforoDisponible = computed(() => this.AFORO_MAXIMO - this._pacientes().length);
  readonly aforoCompleto = computed(() => this._pacientes().length >= this.AFORO_MAXIMO);

  agregar(paciente: Omit<Paciente, 'id'>): boolean {
    if (this.aforoCompleto()) return false;
    this._pacientes.update(lista => [
      ...lista,
      { ...paciente, id: this._nextId() }
    ]);
    this._nextId.update(id => id + 1);
    return true;
  }

  actualizar(id: number, datos: Omit<Paciente, 'id'>): void {
    this._pacientes.update(lista =>
      lista.map(p => p.id === id ? { ...datos, id } : p)
    );
  }

  eliminar(id: number): void {
    this._pacientes.update(lista => lista.filter(p => p.id !== id));
  }

  obtenerPorId(id: number): Paciente | undefined {
    return this._pacientes().find(p => p.id === id);
  }
}