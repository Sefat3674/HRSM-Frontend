import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// =============================
// Interfaces
// =============================

// Request payload for preview
export interface PayrollPreviewRequest {
  userId ? : number;
  month: number;
  year: number;
}

// Response for each payroll item
export interface PayrollPreviewResponse {
  UserId  : number;
  BasicSalary: number;
  HouseRentAllowance: number;
  MedicalAllowance: number;
  TransportAllowance: number;
  OtherAllowance: number;
  TotalBonus: number;
  TotalDeduction: number;
  NetSalary: number;
}

// Generic API Response (for other endpoints)
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
  // Optional: Error handler
  // ==========================================
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side / network error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server returned code ${error.status}, body was: ${JSON.stringify(
        error.error
      )}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}