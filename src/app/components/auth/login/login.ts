import { Component, ChangeDetectorRef } from '@angular/core'; // 🚀 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef // 🚀 2. Lo inyectamos en el constructor
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, rellena todos los campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false; 

        try {
          if (this.authService.isAdmin()) {
            this.router.navigate(['/dashboard']); 
          } else {
            this.authService.logout(); 
            this.errorMessage = 'Acceso denegado. Este panel es exclusivo para administradores.';
            this.cdr.detectChanges(); // 🚀 3. ¡Obligamos a Angular a pintar el error ya!
          }
        } catch (innerError) {
          console.error('Error manejando la redirección:', innerError);
          this.errorMessage = 'Error al verificar los permisos de acceso.';
          this.cdr.detectChanges(); // 🚀 3. ¡Obligamos a Angular a pintar el error ya!
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'El correo electrónico o la contraseña son incorrectos.';
        } else if (err.status === 404) {
          this.errorMessage = 'Servicio de autenticación no encontrado.';
        } else {
          this.errorMessage = 'Ha ocurrido un error en el servidor. Inténtalo más tarde.';
        }
        console.error('Error capturado en el Login:', err);
        
        this.cdr.detectChanges(); // 🚀 3. ¡Obligamos a Angular a pintar el error ya!
      }
    });
  }
}