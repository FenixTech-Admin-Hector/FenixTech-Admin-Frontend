import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './components/sidebar/sidebar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('FenixTech-Admin');
  
  // 🚀 Variable para controlar cuándo mostramos el layout completo
  isLoginPage = false;

  constructor(private router: Router) {
    // Escuchamos los cambios de ruta en tiempo real
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si la URL actual incluye '/login', la variable será true
      this.isLoginPage = event.urlAfterRedirects.includes('/login');
    });
  }
}