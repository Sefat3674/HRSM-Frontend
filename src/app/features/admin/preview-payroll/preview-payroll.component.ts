import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import {
  PayrollService,
  PayrollPreviewResponse,
  RunPayrollRequest,
  ApiResponse
} from '../../../core/services/preview-payroll.service';

interface PayrollItem {
  userId: number;
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  totalBonus: number;
  totalDeduction: number;
  netSalary: number;
  isLocked: boolean;
}

@Component({
  selector: 'app-payroll-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preview-payroll.component.html',
  styleUrls: ['./preview-payroll.component.scss']
})
export class PayrollReviewComponent implements OnInit {

  previewForm!: FormGroup;
  payrollPreviewList: PayrollItem[] = [];

  previewLoading = false;
  previewErrorMessage = '';
  previewSubmitted = false;

  runningUserId: number | null = null;
  userId: number | null = null;
  isSidebarCollapsed = false;

  isModalOpen = false;
  selectedPayroll: PayrollItem | null = null;
  confirmCheckedControl: FormControl = new FormControl(false);

  // Run All
  isRunningAll = false;
  isRunAllModalOpen = false;
  confirmRunAllChecked: FormControl = new FormControl(false);

  months = [
    { value: 1, name: 'Jan' }, { value: 2, name: 'Feb' },
    { value: 3, name: 'Mar' }, { value: 4, name: 'Apr' },
    { value: 5, name: 'May' }, { value: 6, name: 'Jun' },
    { value: 7, name: 'Jul' }, { value: 8, name: 'Aug' },
    { value: 9, name: 'Sep' }, { value: 10, name: 'Oct' },
    { value: 11, name: 'Nov' }, { value: 12, name: 'Dec' }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (isPlatformBrowser(this.platformId)) {
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      this.userId = idFromRoute ? Number(idFromRoute) : null;
    }

    if (this.userId) {
      this.onPreview(this.userId);
    }
  }

  private initForm(): void {
    this.previewForm = this.fb.group({
      month: [null, Validators.required],
      year: [new Date().getFullYear(), Validators.required]
    });
  }

  getMonthName(value: number): string {
    const month = this.months.find(m => m.value === Number(value));
    return month ? month.name : '';
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
  goToAddSalary(): void {
    this.router.navigate(['/admin/add-salary']);
  }

  CreatePayRoll(): void {
    this.router.navigate(['/admin/payroll']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('adminToken');
    }
    this.router.navigate(['/admin/login']);
  }

  // ==========================
  // Preview Payroll
  // ==========================
  onPreview(userId?: number): void {
    if (this.previewForm.invalid) {
      this.previewForm.markAllAsTouched();
      this.previewErrorMessage = 'Please select month and year.';
      return;
    }

    this.previewLoading = true;
    this.previewErrorMessage = '';
    this.previewSubmitted = true;

    const payload = {
      userId: userId ?? this.userId ?? undefined,
      month: this.previewForm.value.month,
      year: this.previewForm.value.year
    };

    this.payrollService.PreviewPayroll(payload).subscribe({
      next: (res: PayrollPreviewResponse[]) => {
        this.previewLoading = false;
        this.payrollPreviewList = (res || []).map(item => ({
          userId: item.UserId,
          basicSalary: item.BasicSalary,
          houseRentAllowance: item.HouseRentAllowance,
          medicalAllowance: item.MedicalAllowance,
          transportAllowance: item.TransportAllowance,
          otherAllowance: item.OtherAllowance,
          totalBonus: item.TotalBonus,
          totalDeduction: item.TotalDeduction,
          netSalary: item.NetSalary,
          isLocked: item.IsLocked === 1
        }));

        this.cdr.detectChanges();

        this.previewErrorMessage = this.payrollPreviewList.length === 0
          ? 'No payroll data found for the selected month/year.'
          : '';
      },
      error: (err: Error) => {
        this.previewLoading = false;
        this.previewErrorMessage = err?.message || 'Something went wrong while previewing payroll.';
        console.error(err);
      }
    });
  }

  // ==========================
  // Single Payroll Modal
  // ==========================
  openPayrollModal(payroll: PayrollItem): void {
    if (payroll.isLocked) return;
    this.selectedPayroll = payroll;
    this.confirmCheckedControl.setValue(false);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPayroll = null;
  }

  confirmRunPayroll(): void {
    if (!this.selectedPayroll || !this.confirmCheckedControl.value) return;
    this.runPayroll(this.selectedPayroll.userId, this.selectedPayroll);
    this.closeModal();
  }

  runPayroll(userId: number, payroll: PayrollItem): void {
    if (payroll.isLocked) return;
    if (this.previewForm.invalid) {
      this.previewErrorMessage = 'Please select month and year first.';
      return;
    }

    this.runningUserId = userId;

    const payload: RunPayrollRequest = {
      userId,
      month: this.previewForm.value.month,
      year: this.previewForm.value.year
    };

    this.payrollService.RunPayroll(payload).subscribe({
      next: (res: ApiResponse) => {
        this.runningUserId = null;
        alert(res.message || 'Payroll executed successfully!');
        const row = this.payrollPreviewList.find(p => p.userId === userId);
        if (row) row.isLocked = true;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.runningUserId = null;
        console.error(err);
        alert('Payroll execution failed.');
      }
    });
  }

  // ==========================
  // Run All Payroll Modal
  // ==========================
  openRunAllModal(): void {
    if (this.previewForm.invalid) {
      this.previewErrorMessage = 'Please select month and year first.';
      return;
    }

    const unlockedCount = this.payrollPreviewList.filter(p => !p.isLocked).length;
    if (unlockedCount === 0) {
      alert('All payrolls are already processed.');
      return;
    }

    this.confirmRunAllChecked.setValue(false);
    this.isRunAllModalOpen = true;
  }

  closeRunAllModal(): void {
    this.isRunAllModalOpen = false;
  }

  confirmRunAllPayroll(): void {
    if (!this.confirmRunAllChecked.value) return;
    this.closeRunAllModal();
    this.runAllPayroll();
  }

  get unlockedCount(): number {
    return this.payrollPreviewList.filter(p => !p.isLocked).length;
  }

  runAllPayroll(): void {
    if (this.previewForm.invalid) {
      this.previewErrorMessage = 'Please select month and year first.';
      return;
    }

    const unlockedPayrolls = this.payrollPreviewList.filter(p => !p.isLocked);
    if (unlockedPayrolls.length === 0) {
      alert('All payrolls are already processed.');
      return;
    }

    this.isRunningAll = true;
    const month = this.previewForm.value.month;
    const year = this.previewForm.value.year;
    let completed = 0;
    let hasError = false;

    unlockedPayrolls.forEach(payroll => {
      const payload: RunPayrollRequest = {
        userId: payroll.userId,
        month,
        year
      };

      this.payrollService.RunPayroll(payload).subscribe({
        next: (res: ApiResponse) => {
          const row = this.payrollPreviewList.find(p => p.userId === payroll.userId);
          if (row) row.isLocked = true;
          completed++;
          if (completed === unlockedPayrolls.length) {
            this.isRunningAll = false;
            alert(hasError
              ? 'Some payrolls failed. Please check the console for details.'
              : 'All payrolls executed successfully!'
            );
            this.cdr.detectChanges();
          }
        },
        error: (err: Error) => {
          hasError = true;
          completed++;
          console.error(`Payroll failed for userId ${payroll.userId}:`, err);
          if (completed === unlockedPayrolls.length) {
            this.isRunningAll = false;
            alert('Some payrolls failed. Please check the console for details.');
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  // ==========================
  // Salary Slip
  // ==========================
  viewSalarySlip(userId: number | string): void {
    if (!userId) {
      alert('User ID not found!');
      return;
    }
    this.router.navigate(['/admin/salary-slip', userId], {
      queryParams: {
        month: this.previewForm.value.month,
        year: this.previewForm.value.year
      }
    });
  }

  // ==========================
  // Reset
  // ==========================
  onPreviewReset(): void {
    this.previewForm.reset({
      month: null,
      year: new Date().getFullYear()
    });
    this.payrollPreviewList = [];
    this.previewErrorMessage = '';
    this.previewSubmitted = false;
  }
}