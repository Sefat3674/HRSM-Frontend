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

// Payroll item interface
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

  runningUserId: number | null = null;   // For showing "Running..." state
  userId: number | null = null;
  isSidebarCollapsed = false;

  // Modal related
  isModalOpen = false;
  selectedPayroll: PayrollItem | null = null;
  confirmCheckedControl: FormControl = new FormControl(false); // Reactive checkbox

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
    if (isPlatformBrowser(this.platformId)) {
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      this.userId = idFromRoute ? Number(idFromRoute) : null;
    }
    this.initForm();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('adminToken');
    }
    this.router.navigate(['/admin/login']);
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

  // ==========================
  // Preview Payroll
  // ==========================
  onPreview(): void {
    if (this.previewForm.invalid) {
      this.previewForm.markAllAsTouched();
      this.previewErrorMessage = 'Please select month and year.';
      return;
    }

    this.previewLoading = true;
    this.previewErrorMessage = '';
    this.previewSubmitted = true;

    const payload = {
      userId: this.userId ?? undefined,
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
  // Run Payroll modal
  // ==========================
  openPayrollModal(payroll: PayrollItem) {
    if (payroll.isLocked) return;
    this.selectedPayroll = payroll;
    this.confirmCheckedControl.setValue(false); // Reset reactive checkbox
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedPayroll = null;
  }

  confirmRunPayroll() {
    if (!this.selectedPayroll || !this.confirmCheckedControl.value) return;
    this.runPayroll(this.selectedPayroll.userId, this.selectedPayroll);
    this.closeModal();
  }

  // ==========================
  // Run Payroll per row
  // ==========================
  runPayroll(userId: number, payroll: PayrollItem): void {

    if (payroll.isLocked) return;  // Already locked

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

        // Update row to locked after successful run
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
  viewSalarySlip(userId: number | string) {
    this.router.navigate(['/admin/salary-slip', userId]);
  }

  // ==========================
  // Reset Form & Table
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