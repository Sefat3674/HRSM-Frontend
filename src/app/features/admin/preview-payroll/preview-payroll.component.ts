import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PayrollService, PayrollPreviewResponse } from '../../../core/services/preview-payroll.service';

// Payroll item for display
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

  userId: number | null = null;
  isSidebarCollapsed = false;

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
    private cdr: ChangeDetectorRef,           // <-- added
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      this.userId = idFromRoute ? Number(idFromRoute) : null;
    }
    this.initForm();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem('adminToken');
    this.router.navigate(['/admin/login']);
  }

  private initForm() {
    this.previewForm = this.fb.group({
      month: [null, Validators.required],
      year: [new Date().getFullYear(), Validators.required]
    });
  }

  getMonthName(value: number): string {
    const month = this.months.find(m => m.value === Number(value));
    return month ? month.name : '';
  }

  onPreview() {
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

        // Map API response to PayrollItem
        this.payrollPreviewList = (res || []).map(item => ({
          userId: item.UserId,
          basicSalary: item.BasicSalary,
          houseRentAllowance: item.HouseRentAllowance,
          medicalAllowance: item.MedicalAllowance,
          transportAllowance: item.TransportAllowance,
          otherAllowance: item.OtherAllowance,
          totalBonus: item.TotalBonus,
          totalDeduction: item.TotalDeduction,
          netSalary: item.NetSalary
        }));

        // Force Angular to update the UI
        this.cdr.detectChanges();

        this.previewErrorMessage = this.payrollPreviewList.length === 0
          ? 'No payroll data found for the selected month/year.'
          : '';
      },
      error: (err) => {
        this.previewLoading = false;
        this.previewErrorMessage = err?.message || 'Something went wrong while previewing payroll.';
        console.error(err);
      }
    });
  }

  onPreviewReset() {
    this.previewForm.reset({ month: null, year: new Date().getFullYear() });
    this.payrollPreviewList = [];
    this.previewErrorMessage = '';
    this.previewSubmitted = false;
  }
}