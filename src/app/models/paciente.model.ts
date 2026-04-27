export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  telefono: string;
  email: string;
  diagnostico: string;
  fechaIngreso: string;
}