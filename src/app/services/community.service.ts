import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = `${environment.apiUrl}/admin/community`;

  constructor(private http: HttpClient) {}

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts`);
  }

  getComments(postId: number): Observable<any> {
    // Le pedimos a la paginación que nos traiga hasta 100 comentarios de golpe
    return this.http.get<any>(`${this.apiUrl}/posts/${postId}/comments?size=100`);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/posts/${id}`);
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/comments/${id}`);
  }
}