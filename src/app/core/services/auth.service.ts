import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  userId: number; // <-- include userId from backend
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adminLoginUrl = 'https://localhost:7285/api/admin/login';

  // Store current admin info in a BehaviorSubject
  private _currentUserId = new BehaviorSubject<number | null>(null);
  currentUserId$ = this._currentUserId.asObservable();

  constructor(private http: HttpClient) {}

  get currentUserId(): number | null {
    return this._currentUserId.value;
  }

  // Login API
  adminLogin(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.adminLoginUrl, credentials).pipe(
      tap(res => {
        if (res && res.userId) {
          this._currentUserId.next(res.userId); // store logged-in admin ID
          localStorage.setItem('adminUserId', res.userId.toString()); // optional: persist across refresh
          localStorage.setItem('token', res.token); // optional: store JWT
        }
      })
    );
  }

  // Optional: load current admin from localStorage
  loadCurrentAdminFromStorage(): void {
    const id = localStorage.getItem('adminUserId');
    if (id) this._currentUserId.next(Number(id));
  }

  // Logout
  logout(): void {
    this._currentUserId.next(null);
    localStorage.removeItem('adminUserId');
    localStorage.removeItem('token');
  }
}