import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Attendance {
  attendanceId: number;
  userId: number;
  date: string;           // ISO string or 'YYYY-MM-DD'
  checkInTime: string;    // ISO string or 'HH:mm:ss'
  checkOutTime: string;   // ISO string or 'HH:mm:ss'
  status: string;
  notes?: string;         // optional notes field
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private apiUrl = 'https://localhost:7285/api/User';

  constructor(private http: HttpClient) {}

  /** Get all attendance records for a user */
  getAttendanceByUserId(userId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/Attendance/${userId}`);
  }
}