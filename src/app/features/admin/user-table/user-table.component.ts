import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { EditUserService, UpdateUserResponse } from '../../../core/services/edit-user.service';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];

  loading = false;
  error = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  searchTerm = '';
  searchTimeout: any;

  constructor(
    private userService: UserService,
    private editUserService: EditUserService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...data]; // important
        this.updatePagination();
        this.loading = false;

        this.cdr.detectChanges(); // force render after data loads
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const term = this.searchTerm.toLowerCase().trim();

      this.filteredUsers = term
        ? this.users.filter(user =>
            Object.values(user).some(val =>
              val?.toString().toLowerCase().includes(term)
            )
          )
        : [...this.users];

      this.currentPage = 1;
      this.updatePagination();
      this.cdr.detectChanges(); // ensure table updates
    }, 300);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  trackByUserId(index: number, user: User): number {
    return user.userId;
  }

  editUser(id: number | string) {
    this.router.navigate(['/admin/edit-user', id]);
  }

  // 🔹 Toggle Active/Inactive status
  toggleStatus(user: User) {
  const newStatus = !user.isActive;
  const statusText = newStatus ? 'Active' : 'Inactive';

  const confirmChange = confirm(
    `Do you want to change status to ${statusText}?`
  );
  if (!confirmChange) return;

  this.editUserService.updateUser(user.userId!, { isActive: newStatus }).subscribe({
    next: (res: UpdateUserResponse) => {
      // ✅ Update the object in place
      user.isActive = res.isActive;

      // Force Angular to detect changes
      this.cdr.detectChanges(); 

      // Optional: show message
      console.log(`Status updated to ${res.isActive ? 'Active' : 'Inactive'}`);
    },
    error: (err) => {
      console.error('Failed to update status', err);
      alert('Failed to update status.');
    }
  });
}
}