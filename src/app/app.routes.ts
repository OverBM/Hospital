import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/lista-pacientes/lista-pacientes')
        .then(m => m.ListaPacientesComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./components/formulario-paciente/formulario-paciente')
        .then(m => m.FormularioPacienteComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./components/formulario-paciente/formulario-paciente')
        .then(m => m.FormularioPacienteComponent),
  },
  { path: '**', redirectTo: '' },
];