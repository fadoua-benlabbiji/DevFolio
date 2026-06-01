import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Acceuil } from './pages/acceuil/acceuil';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Dashboard,Acceuil],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('DevFolio');
}
