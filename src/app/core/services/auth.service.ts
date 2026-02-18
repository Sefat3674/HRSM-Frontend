import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adminLoginUrl = 'https://localhost:7285/api/admin/login';

  constructor(private http: HttpClient) {}

  // Match the form fields: username + password
  adminLogin(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.adminLoginUrl, credentials);
  }
}