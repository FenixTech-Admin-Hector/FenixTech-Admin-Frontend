import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  // Apuntamos a /admin
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ================= CATEGORÍAS =================
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }
  createCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, data);
  }
  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, data);
  }
  toggleCategory(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}/toggle`, {});
  }

  // ================= SUBCATEGORÍAS =================
  getSubcategories(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/${categoryId}/subcategories`);
  }
  createSubcategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/subcategories`, data);
  }
  updateSubcategory(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/subcategories/${id}`, data);
  }
  toggleSubcategory(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/subcategories/${id}/toggle`, {});
  }
}