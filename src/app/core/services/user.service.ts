  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { Time } from '@angular/common';

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
   export interface Attendance {
    AttendanceId: number;
    UserId: number;
    Date: Date;
    CheckInTime: Time;
    CheckOutTime: Time;
    Status: String;
  }

  @Injectable({
    providedIn: 'root'
  })
  export class UserService {
    private apiUrl = 'https://localhost:7285/api/test/users';
   
 

    constructor(private http: HttpClient) {}

    // ✅ Simplified: plain array returned
    getUsers(): Observable<User[]> {
      return this.http.get<User[]>(this.apiUrl);
    }

    
  }