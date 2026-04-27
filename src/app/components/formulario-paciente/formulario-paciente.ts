import { Component, inject, input, output, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Paciente } from '../../models/paciente.model';
import { PacienteService } from '../../services/paciente';


function soloLetras(control: AbstractControl): ValidationErrors | null {
  const val = control.value as string;
  if (!val) return null;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) ? null : { soloLetras: true };
}

function soloNumeros(control: AbstractControl): ValidationErrors | null {
  const val = control.value as string;
  if (!val) return null;
  return /^\d+$/.test(val) ? null : { soloNumeros: true };
}

function fechaNacimientoValida(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(control.value);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha >= hoy) return { fechaFutura: true };
  const edadMin = new Date();
  edadMin.setFullYear(edadMin.getFullYear() - 120);
  if (fecha < edadMin) return { edadMaxima: true };
  return null;
}

function fechaIngresoValida(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(control.value);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  const limitePassado = new Date();
  limitePassado.setFullYear(limitePassado.getFullYear() - 2);
  if (fecha > hoy) return { fechaFutura: true };
  if (fecha < limitePassado) return { fechaMuyAntigua: true };
  return null;
}

function fechaIngresoPostNacimiento(group: AbstractControl): ValidationErrors | null {
  const nacimiento = group.get('fechaNacimiento')?.value;
  const ingreso = group.get('fechaIngreso')?.value;
  if (!nacimiento || !ingreso) return null;
  return new Date(ingreso) >= new Date(nacimiento) ? null : { ingresoAntesNacimiento: true };
}

@Component({
  selector: 'app-formulario-paciente',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './formulario-paciente.html',
  styleUrl: './formulario-paciente.css'
})
export class FormularioPacienteComponent implements OnInit {
  pacienteEditar = input<Paciente | null>(null);
  cancelar = output<void>();
  guardado = output<void>();

  private fb = inject(FormBuilder);
  private svc = inject(PacienteService);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), soloLetras]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), soloLetras]],
    dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), soloNumeros]],
    fechaNacimiento: ['', [Validators.required, fechaNacimientoValida]],
    genero: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9), soloNumeros]],
    email: ['', [Validators.required, Validators.email]],
    diagnostico: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
    fechaIngreso: ['', [Validators.required, fechaIngresoValida]],
  }, { validators: fechaIngresoPostNacimiento });

  modoEdicion = false;
  fechaMaxHoy = new Date().toISOString().split('T')[0];

  constructor() {
    effect(() => {
      const p = this.pacienteEditar();
      if (p) {
        this.modoEdicion = true;
        this.form.patchValue(p);
      } else {
        this.modoEdicion = false;
        this.form.reset();
      }
    });
  }

  ngOnInit(): void {}

  get f() { return this.form.controls; }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  errorMensaje(campo: string): string {
    const c = this.form.get(campo);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio.';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres.`;
    if (c.errors['email']) return 'Ingrese un correo válido. Ej: usuario@correo.com';
    if (c.errors['soloLetras']) return 'Solo se permiten letras y espacios.';
    if (c.errors['soloNumeros']) return 'Solo se permiten dígitos numéricos.';
    if (c.errors['fechaFutura']) return 'La fecha no puede ser futura.';
    if (c.errors['edadMaxima']) return 'La fecha de nacimiento no es válida.';
    if (c.errors['fechaMuyAntigua']) return 'La fecha de ingreso no puede ser mayor a 2 años atrás.';
    return 'Valor inválido.';
  }

  errorFormulario(): string {
    if (this.form.errors?.['ingresoAntesNacimiento']) {
      return 'La fecha de ingreso no puede ser anterior a la fecha de nacimiento.';
    }
    return '';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.value as Omit<Paciente, 'id'>;
    const p = this.pacienteEditar();
    if (this.modoEdicion && p) {
      this.svc.actualizar(p.id, datos);
    } else {
      const ok = this.svc.agregar(datos);
      if (!ok) return;
    }
    this.form.reset();
    this.guardado.emit();
  }

  onCancelar(): void {
    this.form.reset();
    this.cancelar.emit();
  }
}