import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddUserService } from '../../../core/services/add-user.service';
import { RoleService, Role } from '../../../core/services/role.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  addUserForm!: FormGroup;
  roles: Role[] = []; // dynamic roles from backend
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private addUserService: AddUserService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.fetchRoles();
  }

  // 🔹 Initialize form
  initializeForm() {
    this.addUserForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      roleId: ['', Validators.required]
    });
  }

  // 🔹 Fetch roles dynamically
  fetchRoles() {
    this.roleService.getRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Failed to fetch roles', err);
      }
    });
  }

  // 🔹 Submit form
  onSubmit() {
    if (this.addUserForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = { ...this.addUserForm.value };

    // Convert roleId to number
    formValue.roleId = Number(formValue.roleId);

    this.addUserService.createUser(formValue).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'User added successfully!';
        this.addUserForm.reset();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to add user.';
        console.error('API Error:', err);
      }
    });
  }

  // 🔹 Cancel
  onCancel() {
    this.router.navigate(['/admin/dashboard/users']);
  }
}