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

@Injectable({
  providedIn: 'root'
})
export class AddSalaryService {

  
  private salaryApiUrl = 'https://localhost:7285/api/SalaryStructure/getusersalary';

  constructor(private http: HttpClient) {}

 

  // ✅ Get All Salary Structures
  getAllSalaryStructures(): Observable<UserSalary[]> {
    return this.http.get<UserSalary[]>(this.salaryApiUrl);
  }

 
}