import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =============================
// Interfaces
// =============================

export interface PayrollPeriod {
  month: number;
  year: number;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
  status?: string;   // Optional: Draft / Processing / Completed / Cancelled
  createdBy: number;
}

export interface ApiResponse {
  message: string;
  payrollPeriodId?: number;
}

// =============================
// Service
// =============================

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private apiUrl = 'https://localhost:7285/api/SalaryStructure';

  constructor(private http: HttpClient) {}

  // ==========================================
  // CREATE Payroll Period (POST)
  // ==========================================
  createPayrollPeriod(data: PayrollPeriod): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/insertPayroll`, data);
  }
}