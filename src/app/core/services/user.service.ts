import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  userId: number;
  userName: string;
  roleName: string;
  fullName: string;
  isActive: boolean;
  email: string;
  phone: string;
  roleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7285/api/test/users';
  private usersApi = 'https://localhost:7285/api/admin';

  constructor(private http: HttpClient) {}

  // ✅ Simplified: plain array returned
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

   getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.usersApi}/get-user/${userId}`);
  }
}