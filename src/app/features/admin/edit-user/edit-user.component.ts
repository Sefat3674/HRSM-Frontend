import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { EditUserService, User, UpdateUserResponse } from '../../../core/services/edit-user.service';
import { RoleService, Role } from '../../../core/services/role.service';


@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {

  editUserForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  userId!: string;

  roles: Role[] = [];            // full list from API
  filteredRoles: Role[] = [];    // filtered for search
  roleSearchTerm = '';           // search input

  constructor(
    private fb: FormBuilder,
    private editUserService: EditUserService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.fetchRoles(); // fetch roles from backend

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = id;
      this.fetchUser(id);
    }
  }

  // Initialize form
  initializeForm() {
    this.editUserForm = this.fb.group({
      userName: ['', Validators.required],
      password: [''], // optional
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      roleId: ['', Validators.required],
      isActive: [true]
    });
  }

  // Fetch roles dynamically
  fetchRoles() {
    this.roleService.getRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data;
        this.filteredRoles = [...data];
      },
      error: (err) => {
        console.error('Failed to fetch roles', err);
      }
    });
  }

  // Filter roles for search
  filterRoles() {
    const term = this.roleSearchTerm.toLowerCase().trim();
    this.filteredRoles = term
      ? this.roles.filter(r => r.roleName.toLowerCase().includes(term))
      : [...this.roles];
  }

  // Select role from dropdown
  selectRole(role: Role) {
    this.editUserForm.patchValue({ roleId: role.roleId });
    this.roleSearchTerm = role.roleName;
    this.filteredRoles = [...this.roles];
  }

  // Fetch existing user data
  fetchUser(id: string) {
    this.loading = true;

    this.editUserService.getUserById(id).subscribe({
      next: (user: User) => {
        this.loading = false;

        this.editUserForm.patchValue({
          userName: user.userName ?? '',
          fullName: user.fullName ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          roleId: user.roleId ?? '',
          isActive: user.isActive ?? true
        });

        const selectedRole = this.roles.find(r => r.roleId === user.roleId);
        this.roleSearchTerm = selectedRole?.roleName ?? '';

        this.editUserForm.markAsPristine();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load user data.';
        console.error('API Error:', err);
      }
    });
  }

  // Submit updated user
  onSubmit() {
    if (this.editUserForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const rawValue = this.editUserForm.getRawValue();
    const payload: Partial<User> = {};

    Object.keys(rawValue).forEach(key => {
      const value = rawValue[key];
      if (value !== null && value !== undefined && value !== '') {
        payload[key as keyof User] = value;
      }
    });

    if (payload.roleId !== undefined) payload.roleId = Number(payload.roleId);
    if (payload.isActive !== undefined) payload.isActive = Boolean(payload.isActive);

    console.log('Sending to backend:', payload);

    this.editUserService.updateUser(this.userId, payload).subscribe({
      next: (res: UpdateUserResponse) => {
        this.loading = false;
        this.successMessage = res.message || 'User updated successfully!';
        this.editUserForm.markAsPristine();
        this.editUserForm.markAsUntouched();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to update user.';
        console.error('API Error:', err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/dashboard/users']);
  }
}