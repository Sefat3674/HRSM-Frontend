import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =============================
// Interfaces
// =============================

// 🔹 Create Payload Interface
export interface PayrollPeriod {
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  status?: string;
  createdBy: number;
}

// 🔹 Payroll List Response Interface
export interface PayrollPeriodResponse {
  payrollPeriodId: number;
  payrollCode: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalBasicAmount: number;
  totalBonusAmount: number;
  totalDeductionAmount: number;
  totalNetSalaryAmount: number;
  isLocked: boolean;
}

// 🔹 API Response Interface
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
  // CREATE Payroll Period
  // ==========================================
  createPayrollPeriod(data: PayrollPeriod): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/insertPayroll`,
      data
    );
  }

  // ==========================================
  // GET ALL Payroll Periods
  // ==========================================
  getPayrollPeriods(): Observable<PayrollPeriodResponse[]> {
    return this.http.get<PayrollPeriodResponse[]>(
      `${this.apiUrl}/getAll`
    );
  }

}