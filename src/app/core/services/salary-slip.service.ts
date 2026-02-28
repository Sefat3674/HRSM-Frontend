import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// =============================
// Interfaces
// =============================
export interface SalarySlipDto {
  userId: number;
  userName:string;
  monthName:string;
  salaryMonth: number;
  salaryYear: number;
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  totalBonus: number;
  totalDeduction: number;
  netSalary: number;
  bonusDetails: string;
  deductionDetails: string;
}

// =============================
// Service
// =============================
@Injectable({
  providedIn: 'root',
})
export class SalarySlipService {

  private apiUrl = 'https://localhost:7285/api/SalaryStructure';

  constructor(private http: HttpClient) {}

  // ==========================================
  // Get Salary Slips
  // Optional Filters: userId, month, year
  // ==========================================
  getSalarySlips(
    userId?: number | null,
    month?: number | null,
    year?: number | null
  ): Observable<SalarySlipDto[]> {

    let params = new HttpParams();
    if (userId != null) params = params.set('userId', userId.toString());
    if (month != null) params = params.set('month', month.toString());
    if (year != null) params = params.set('year', year.toString());

    return this.http
      .get<SalarySlipDto[]>(`${this.apiUrl}/getSalarySlips`, { params })
      .pipe(catchError(this.handleError));
  }

  // ==========================================
  // Error Handler
  // ==========================================
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    
    if (error.status === 0) {
      // Network error
      errorMessage = `Network Error: ${error.message}`;
    } else {
      // Server error
      errorMessage = `Server Error ${error.status}: ${JSON.stringify(error.error)}`;
    }

    console.error('SalarySlipService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}