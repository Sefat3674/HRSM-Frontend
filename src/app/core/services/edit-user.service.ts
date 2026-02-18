import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number | string;
  userName: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number | string;
  isActive?: boolean;
}

// Response from backend after update
export interface UpdateUserResponse {
  message: string;
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EditUserService {
  private apiUrl = 'https://localhost:7285/api/admin'; // Base API URL

  constructor(private http: HttpClient) {}

  // Fetch user by ID
  getUserById(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get-user/${id}`);
  }

  // Update user by ID (send object directly, no wrapper)
 updateUser(id: number | string, userData: Partial<User>): Observable<UpdateUserResponse> {
  return this.http.put<UpdateUserResponse>(`${this.apiUrl}/update-user/${id}`, userData);
}
}