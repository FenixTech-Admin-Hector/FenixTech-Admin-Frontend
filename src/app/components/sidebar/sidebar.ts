import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  
  // Inyectamos el servicio de autenticación y el enrutador
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout(); // Elimina el token del localStorage
    this.router.navigate(['/login']); // Te expulsa a la pantalla de login
  }
}