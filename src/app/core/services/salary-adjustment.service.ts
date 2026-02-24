import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// =============================
// Interfaces
// =============================

export interface Deduction {
  deductionType: string;
  amount: number;
  description: string;
}

export interface Bonus {
  bonusType: string;
  amount: number;
  description: string;
}

export interface SalaryAdjustment {
  userId: number;
  month: number;
  year: number;
  bonuses: Bonus[];
  deductions: Deduction[];
  TotalBonus?: number;       // calculated on backend
  TotalDeduction?: number;   // calculated on backend
  NetSalary?: number;       // calculated on backend
}

export interface ApiResponse {
  message: string;
  userId: number;
}


// =============================
// Service
// =============================

@Injectable({
  providedIn: 'root'
})
export class SalaryAdjustmentService {

  private apiUrl = 'https://localhost:7285/api/SalaryStructure';

  constructor(private http: HttpClient) {}

  // ==========================================
  // INSERT Bonus + Deduction (POST)
  // ==========================================
  insertSalaryAdjustment(
    userId: number,
    data: SalaryAdjustment
  ): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/insertSalaryBonusDeduction/${userId}`,
      data
    );
  }


  // ==========================================
  // GET Salary Adjustments by User
  // ==========================================
  getSalaryAdjustmentByUser(userId: number): Observable<SalaryAdjustment> {
  return this.http.get<SalaryAdjustment>(`${this.apiUrl}/getSalaryAdjustmentByUser?UserId=${userId}`);
}


  // ==========================================
  // GET Salary by User + Month + Year
  // ==========================================
  getSalaryByMonth(
    userId: number,
    month: number,
    year: number
  ): Observable<SalaryAdjustment> {
    return this.http.get<SalaryAdjustment>(
      `${this.apiUrl}/getByMonth/${userId}/${month}/${year}`
    );
  }


  // ==========================================
  // UPDATE Salary Adjustment
  // ==========================================
  updateSalaryAdjustment(
    userId: number,
    data: SalaryAdjustment
  ): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.apiUrl}/update/${userId}`,
      data
    );
  }


  // ==========================================
  // DELETE Salary Adjustment by Month
  // ==========================================
  deleteSalaryAdjustment(
    userId: number,
    month: number,
    year: number
  ): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/delete/${userId}/${month}/${year}`
    );
  }
}