import { Component } from '@angular/core';
import { ListaPacientesComponent } from './components/lista-pacientes/lista-pacientes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListaPacientesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {}