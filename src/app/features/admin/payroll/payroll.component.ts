import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PayrollService } from '../../../core/services/payroll.service';

@Component({  
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {

  payrollForm!: FormGroup;
  payrollList: any[] = [];   // ✅ Added for table

  loading = false;
  successMessage = '';
  errorMessage = '';

  userId = Number(localStorage.getItem('userId')) || 0;

  // Sidebar
  isSidebarCollapsed = false;

  months = [
    { value: 1, name: 'Jan' },
    { value: 2, name: 'Feb' },
    { value: 3, name: 'Mar' },
    { value: 4, name: 'Apr' },
    { value: 5, name: 'May' },
    { value: 6, name: 'Jun' },
    { value: 7, name: 'Jul' },
    { value: 8, name: 'Aug' },
    { value: 9, name: 'Sep' },
    { value: 10, name: 'Oct' },
    { value: 11, name: 'Nov' },
    { value: 12, name: 'Dec' }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.generatePayrollCode();
    this.loadPayrollPeriods();   // ✅ Load table data
  }

  // =============================
  // Sidebar
  // =============================
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  gotoAddSalary() {
    this.router.navigate(['/admin/add-salary']);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/admin/login']);
  }

  // =============================
  // FORM INIT
  // =============================
  private initForm() {
    this.payrollForm = this.fb.group({
      month: [null, Validators.required],
      year: [new Date().getFullYear(), Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['Draft', Validators.required],
      payrollCode: ['']
    });

    this.payrollForm.get('month')?.valueChanges.subscribe(() => this.generatePayrollCode());
    this.payrollForm.get('year')?.valueChanges.subscribe(() => this.generatePayrollCode());
  }

  // ✅ MUST BE PUBLIC (used in HTML)
  getMonthName(value: number): string {
    const month = this.months.find(m => m.value === Number(value));
    return month ? month.name : '';
  }

  private generatePayrollCode() {
    const month = this.payrollForm.get('month')?.value;
    const year = this.payrollForm.get('year')?.value;

    if (month && year) {
      const code = `PAY-${year}-${this.getMonthName(month)}`;
      this.payrollForm.patchValue({ payrollCode: code }, { emitEvent: false });
    } else {
      this.payrollForm.patchValue({ payrollCode: '' }, { emitEvent: false });
    }
  }

  // =============================
  // LOAD PAYROLL HISTORY
  // =============================
 loadPayrollPeriods() {
  this.payrollService.getPayrollPeriods().subscribe({
    next: (res) => {
      this.payrollList = res;
    },
    error: (err) => {
      console.error(err);
    }
  });
}

  // =============================
  // SUBMIT
  // =============================
  onSubmit() {
    if (this.payrollForm.invalid) {
      this.payrollForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      ...this.payrollForm.value,
      createdBy: this.userId
    };

    this.payrollService.createPayrollPeriod(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = res?.message || 'Payroll created successfully!';
        this.resetForm();
        this.loadPayrollPeriods();   // ✅ Refresh table after create
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Something went wrong.';
        console.error(err);
      }
    });
  }

  // =============================
  // RESET
  // =============================
  resetForm() {
    this.payrollForm.reset({
      month: null,
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      status: 'Draft',
      payrollCode: ''
    });
    this.generatePayrollCode();
  }

  onCancel() {
    this.resetForm();
    this.successMessage = '';
    this.errorMessage = '';
  }

}