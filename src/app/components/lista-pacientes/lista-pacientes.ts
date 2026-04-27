import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/paciente';
import { Paciente } from '../../models/paciente.model';
import { FormularioPacienteComponent } from '../formulario-paciente/formulario-paciente';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, FormularioPacienteComponent],
  templateUrl: './lista-pacientes.html',
  styleUrl: './lista-pacientes.css'
})
export class ListaPacientesComponent {
  svc = inject(PacienteService);

  mostrarFormulario = signal(false);
  pacienteSeleccionado = signal<Paciente | null>(null);
  pacienteAEliminar = signal<Paciente | null>(null);

  readonly pacientes = this.svc.pacientes;
  readonly total = this.svc.totalPacientes;
  readonly disponible = this.svc.aforoDisponible;
  readonly aforoCompleto = this.svc.aforoCompleto;

  porcentajeAforo = computed(() =>
    Math.round((this.total() / this.svc.AFORO_MAXIMO) * 100)
  );

  colorAforo = computed(() => {
    const p = this.porcentajeAforo();
    if (p >= 90) return 'danger';
    if (p >= 60) return 'warning';
    return 'success';
  });

  abrirFormulario(): void {
    if (this.aforoCompleto()) return;
    this.pacienteSeleccionado.set(null);
    this.mostrarFormulario.set(true);
  }

  editar(p: Paciente): void {
    this.pacienteSeleccionado.set(p);
    this.mostrarFormulario.set(true);
  }

  confirmarEliminar(p: Paciente): void {
    this.pacienteAEliminar.set(p);
  }

  eliminarConfirmado(): void {
    const p = this.pacienteAEliminar();
    if (p) {
      this.svc.eliminar(p.id);
      this.pacienteAEliminar.set(null);
    }
  }

  cancelarEliminar(): void {
    this.pacienteAEliminar.set(null);
  }

  onGuardado(): void {
    this.mostrarFormulario.set(false);
    this.pacienteSeleccionado.set(null);
  }

  onCancelar(): void {
    this.mostrarFormulario.set(false);
    this.pacienteSeleccionado.set(null);
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }
}