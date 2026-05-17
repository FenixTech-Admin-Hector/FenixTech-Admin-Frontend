import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/admin/orders`;

  constructor(private http: HttpClient) {}

  // 1. Obtener la lista general de pedidos
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. Obtener los detalles (productos) de un pedido específico
  getOrderDetails(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}`);
  }

  // 3. Cancelar un pedido
  cancelOrder(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {});
  }
}