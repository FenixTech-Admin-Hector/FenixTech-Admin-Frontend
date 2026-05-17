import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        if (response && response.token) { 
          localStorage.setItem('admin_token', response.token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  logout(): void {
    localStorage.removeItem('admin_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Verifica el rol sin importar cómo lo envíe Spring Boot
  isAdmin(): boolean {
    try {
      const token = this.getToken();
      if (!token) return false;

      // 1. Separamos el payload del JWT (parte central)
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;
      
      // 2. Corregimos el formato Base64URL estándar de los JWT para que 'atob' no falle
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      
      console.log('Payload del JWT recibido de Spring Boot:', payload);

      // 3. Buscamos de forma flexible en todos los mapeos posibles de Spring Security
      const claims = [payload.role, payload.roles, payload.authorities, payload.rolesUser];
      
      for (const claim of claims) {
        if (!claim) continue;
        
        // Caso A: El rol viene como un String simple (ej: "ROLE_ADMIN")
        if (typeof claim === 'string' && claim.toUpperCase().includes('ADMIN')) {
          return true;
        }
        
        // Caso B: El rol viene como un Array (ej: ["ROLE_ADMIN"] o [{"authority": "ROLE_ADMIN"}])
        if (Array.isArray(claim)) {
          for (const item of claim) {
            if (typeof item === 'string' && item.toUpperCase().includes('ADMIN')) {
              return true;
            }
            if (item && typeof item === 'object' && item.authority && typeof item.authority === 'string') {
              if (item.authority.toUpperCase().includes('ADMIN')) {
                return true;
              }
            }
          }
        }
      }
      
      return false; // Si recorrió todo y no encontró la palabra ADMIN, no es administrador
    } catch (error) {
      console.error('Error crítico al decodificar el rol del Admin:', error);
      return false;
    }
  }
}