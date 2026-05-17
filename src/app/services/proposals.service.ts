import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProposalsService {
  // Apuntamos directo a /admin/proposals
  private apiUrl = `${environment.apiUrl}/admin/proposals`;

  constructor(private http: HttpClient) {}

  getProposals(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Llama al método deleteById del backend
  deleteProposal(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}