import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  // Apuntamos a la ruta base del AdminProductsController
  private apiUrl = `${environment.apiUrl}/admin/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  hideProduct(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/hide`, {});
  }

  unhideProduct(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/unhide`, {});
  }
}