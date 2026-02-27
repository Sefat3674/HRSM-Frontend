import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// =============================
// Interfaces
// =============================

// Preview Request
export interface PayrollPreviewRequest {
  userId?: number;
  month: number;
  year: number;
}

// Run Payroll Request
export interface RunPayrollRequest {
  userId: number;
  month: number;
  year: number;
}

// Preview Response
export interface PayrollPreviewResponse {
  UserId: number;
  BasicSalary: number;
  HouseRentAllowance: number;
  MedicalAllowance: number;
  TransportAllowance: number;
  OtherAllowance: number;
  TotalBonus: number;
  TotalDeduction: number;
  NetSalary: number;
  IsLocked: number;
}

// Generic API Response
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
  // Preview Payroll
  // ==========================================
  PreviewPayroll(
    data: PayrollPreviewRequest
  ): Observable<PayrollPreviewResponse[]> {
    return this.http
      .post<PayrollPreviewResponse[]>(`${this.apiUrl}/previewPayroll`, data)
      .pipe(catchError(this.handleError));
  }

  // ==========================================
  // Run Payroll
  // ==========================================
  RunPayroll(
    data: RunPayrollRequest
  ): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}/runPayroll`, data)
      .pipe(catchError(this.handleError));
  }

  // ==========================================
  // Error Handler
  // ==========================================
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side / Network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error ${error.status}: ${JSON.stringify(error.error)}`;
    }

    console.error('PayrollService Error:', errorMessage);

    return throwError(() => new Error(errorMessage));
  }
}