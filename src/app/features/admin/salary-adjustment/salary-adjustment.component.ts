import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SalaryAdjustmentService, SalaryAdjustment } from '../../../core/services/salary-adjustment.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-salary-adjustment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salary-adjustment.component.html',
  styleUrls: ['./salary-adjustment.component.scss']
})
export class SalaryAdjustmentComponent implements OnInit {

  userId!: number;
  salaryData!: SalaryAdjustment;

  salaryForm!: FormGroup;
  loading = false;

  months = [
    { id: 1, name: 'Jan' }, { id: 2, name: 'Feb' }, { id: 3, name: 'Mar' },
    { id: 4, name: 'Apr' }, { id: 5, name: 'May' }, { id: 6, name: 'Jun' },
    { id: 7, name: 'Jul' }, { id: 8, name: 'Aug' }, { id: 9, name: 'Sep' },
    { id: 10, name: 'Oct' }, { id: 11, name: 'Nov' }, { id: 12, name: 'Dec' }
  ];

  // Sidebar
  isSidebarCollapsed = false;

  constructor(
    private salaryService: SalaryAdjustmentService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.initializeForm();
    this.loadSalaryData();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
  goToaddSalary() {
    this.router.navigate(['/admin/add-salary']);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/admin/login']);
  }

  // Initialize form
  initializeForm() {
    const now = new Date();
    this.salaryForm = this.fb.group({
      year: [now.getFullYear(), Validators.required],
      month: [now.getMonth() + 1, Validators.required],
      bonuses: this.fb.array([]),
      deductions: this.fb.array([])
    });
  }

  // Load salary data
  loadSalaryData() {
    this.salaryService.getSalaryAdjustmentByUser(this.userId)
      .pipe(catchError(err => { console.error(err); return of(null); }))
      .subscribe(res => {
        this.salaryData = res || {
          userId: this.userId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          bonuses: [],
          deductions: []
        };

        this.salaryForm.patchValue({
          year: this.salaryData.year,
          month: this.salaryData.month
        });
      });
  }

  get bonuses(): FormArray { return this.salaryForm.get('bonuses') as FormArray; }
  get deductions(): FormArray { return this.salaryForm.get('deductions') as FormArray; }

  addBonus() {
    this.bonuses.push(this.fb.group({
      bonusType: ['', Validators.required],
      amount: [0, Validators.required],
      description: ['']
    }));
  }

  removeBonus(index: number) { this.bonuses.removeAt(index); }

  addDeduction() {
    this.deductions.push(this.fb.group({
      deductionType: ['', Validators.required],
      amount: [0, Validators.required],
      description: ['']
    }));
  }

  removeDeduction(index: number) { this.deductions.removeAt(index); }

  get totalBonus(): number {
    return this.bonuses.controls.reduce((sum, c) => sum + Number(c.get('amount')?.value || 0), 0);
  }

  get totalDeduction(): number {
    return this.deductions.controls.reduce((sum, c) => sum + Number(c.get('amount')?.value || 0), 0);
  }

  get netSalary(): number {
    return this.totalBonus - this.totalDeduction;
  }

  submit() {
    if (this.salaryForm.invalid) return;
    this.loading = true;

    const { year, month, bonuses, deductions } = this.salaryForm.value;

    const payload: SalaryAdjustment = {
      userId: this.userId,
      year,
      month,
      bonuses,
      deductions
    };

    this.salaryService.insertSalaryAdjustment(this.userId, payload)
      .subscribe({
        next: (res) => {
          alert(res.message || 'Salary adjustment saved successfully!');
          this.salaryForm.reset();
          this.bonuses.clear();
          this.deductions.clear();
          this.loadSalaryData();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error saving salary:', err);
          alert('Failed to save salary adjustment.');
          this.loading = false;
        }
      });
  }
}