import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface UserSalary{
  salaryStructureId?: number;
  userId: number;
  userName?: string;

  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;

  effectiveFrom?: string;
  effectiveTo?: string;

  isActive: boolean;
  createdAt?: string;
}

// Response from backend after update
export interface UpdateUserSalaryResponse {
  salaryStructureId?: number;
  userId: number;
  userName?: string;

  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;

  effectiveFrom?: string;
  effectiveTo?: string;

  isActive: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EditSalaryService {
  private apiUrl = 'https://localhost:7285/api/SalaryStructure'; // Base API URL

  constructor(private http: HttpClient) {}

  // Fetch Salary by ID
 getSalaryById(id: number | string): Observable<UserSalary[]> {
  return this.http.get<UserSalary[]>(`${this.apiUrl}/getusersalary`, { 
    params: { UserId: id.toString() }
  });
}
 

  // Update salary by ID (send object directly, no wrapper)
 updateUserSalary(id: number | string, userData: Partial<UserSalary>): Observable<UpdateUserSalaryResponse> {
  // Use POST for upsert instead of PUT
  return this.http.post<UpdateUserSalaryResponse>(`${this.apiUrl}/upsert/${id}`, userData);
}
}