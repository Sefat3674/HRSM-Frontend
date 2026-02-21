import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
  roleId?: number;  // optional
  isActive?: boolean; 
  token?: string;
}

export interface Attendance {
  AttendanceId: number;
  UserId: number;
  Date: Date;
  CheckInTime: string;   // "HH:mm" or ISO string
  CheckOutTime: string;  // "HH:mm" or ISO string
  Status: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7285/api/test/users';
  private _currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Fetch all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  
  // Save logged-in user to service and localStorage (browser only)
  setUser(user: User) {
    this._currentUser = user;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userId', user.userId.toString());
      localStorage.setItem('userName', user.userName);
      localStorage.setItem('fullName', user.fullName);
      localStorage.setItem('email', user.email);
      localStorage.setItem('phone', user.phone);
      localStorage.setItem('userRole', user.roleName);
      if (user.roleId !== undefined) localStorage.setItem('roleId', user.roleId.toString());
      if (user.token) localStorage.setItem('token', user.token);
      if (user.isActive !== undefined) localStorage.setItem('isActive', String(user.isActive));
    }
  }

  // Load logged-in user from localStorage
  loadUser(): User | null {
    if (this._currentUser) return this._currentUser;

    if (!isPlatformBrowser(this.platformId)) return null;

    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) return null;

    this._currentUser = {
      userId: Number(userIdStr),
      userName: localStorage.getItem('userName') || '',
      fullName: localStorage.getItem('fullName') || '',
      email: localStorage.getItem('email') || '',
      phone: localStorage.getItem('phone') || '',
      roleId: localStorage.getItem('roleId') ? Number(localStorage.getItem('roleId')) : undefined,
      roleName: localStorage.getItem('userRole') || 'User',
      isActive: localStorage.getItem('isActive') === 'true',
      token: localStorage.getItem('token') || undefined
    };

    return this._currentUser;
  }

  // Clear logged-in user
  clearUser(): void {
    this._currentUser = null;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('fullName');
      localStorage.removeItem('email');
      localStorage.removeItem('phone');
      localStorage.removeItem('roleId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('token');
      localStorage.removeItem('isActive');
    }
  }

  // Optional: Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.loadUser();
  }
}