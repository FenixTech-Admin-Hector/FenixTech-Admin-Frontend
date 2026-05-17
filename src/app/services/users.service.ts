import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

 // Ahora recibe la dirección por parámetro (por defecto 'asc')
  getUsers(direction: string = 'asc'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?direction=${direction}`);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData);
  }

  banUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  restoreUser(id: number): Observable<any> {
    
    return this.http.put<any>(`${this.apiUrl}/${id}/unban`, {});
  }
}