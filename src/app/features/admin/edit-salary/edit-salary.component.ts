import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EditSalaryService, UserSalary, UpdateUserSalaryResponse } from '../../../core/services/edit-salary.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-salary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-salary.component.html',
  styleUrls: ['./edit-salary.component.scss']
})
export class EditSalaryComponent implements OnInit {

  editUserSalaryForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  userId!: string;

  constructor(
    private fb: FormBuilder,
    private editSalaryService: EditSalaryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = id;
      this.fetchSalary(id);
    }
  }

  private initializeForm(): void {
    this.editUserSalaryForm = this.fb.group({
      basicSalary: [0, Validators.required],
      houseRentAllowance: [0, Validators.required],
      medicalAllowance: [0, Validators.required],
      transportAllowance: [0, Validators.required],
      otherAllowance: [0, Validators.required],
      effectiveFrom: [''],
      effectiveTo: [''],
      isActive: [true],
      isDeleted: [false]
    });
  }

  private fetchSalary(id: string | number): void {
  this.loading = true;
  this.editSalaryService.getSalaryById(id).subscribe({
    next: (salaries: UserSalary[]) => {
      this.loading = false;

      if (!salaries || salaries.length === 0) {
        this.errorMessage = 'Salary data not found.';
        return;
      }

      const salary = salaries[0]; // pick the first salary

      this.editUserSalaryForm.patchValue({
        basicSalary: salary.basicSalary,
        houseRentAllowance: salary.houseRentAllowance,
        medicalAllowance: salary.medicalAllowance,
        transportAllowance: salary.transportAllowance,
        otherAllowance: salary.otherAllowance,
        effectiveFrom: salary.effectiveFrom,
        effectiveTo: salary.effectiveTo,
        isActive: salary.isActive,
        isDeleted: false
      });
    },
    error: (err: HttpErrorResponse) => {
      this.loading = false;
      this.errorMessage = err?.error?.message || 'Failed to load salary data.';
      console.error('Fetch Salary Error:', err);
    }
  });
}

  onSubmit(): void {
  if (this.editUserSalaryForm.invalid) {
    this.errorMessage = 'Please fill all required fields correctly.';
    return;
  }

  this.loading = true;
  this.successMessage = '';
  this.errorMessage = '';

  const payload: Partial<UserSalary> = this.editUserSalaryForm.getRawValue();
  payload.isActive = Boolean(payload.isActive);

  this.editSalaryService.updateUserSalary(this.userId, payload).subscribe({
    next: (res: UpdateUserSalaryResponse) => {
      this.loading = false;

      // Show success message
      this.successMessage = 'Salary updated successfully!';

      // Optional: mark form pristine/untouched
      this.editUserSalaryForm.markAsPristine();
      this.editUserSalaryForm.markAsUntouched();

      // Navigate after a short delay so user sees the message
      setTimeout(() => {
        this.router.navigate(['/admin/add-salary']);
      }, 1000); // 1 second delay
    },
    error: (err: HttpErrorResponse) => {
      this.loading = false;
      this.errorMessage = err?.error?.message || 'Failed to update salary.';
      console.error('Update Salary Error:', err);
    }
  });
}

  onCancel(): void {
    this.router.navigate(['/admin/add-salary']);
  }
}