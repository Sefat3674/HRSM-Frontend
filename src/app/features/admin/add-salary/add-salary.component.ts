
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AddSalaryService, UserSalary } from '../../../core/services/add-salary.service';
import { EditUserService, UpdateUserResponse } from '../../../core/services/edit-user.service';
import { UserService,User  }  from '../../../core/services/user.service';
import { EditSalaryComponent } from '../edit-salary/edit-salary.component'; 

@Component({
  selector: 'app-add-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-salary.component.html',
  styleUrls: ['./add-salary.component.scss']
})
export class AddSalaryComponent implements OnInit {

  users: UserSalary[] = [];
  filteredUsers: UserSalary[] = [];
  loading = false;
  error = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  searchTerm = '';
  searchTimeout: any;

  isSidebarCollapsed = false;
 user: User | null = null;

  constructor(
    private addSalaryService: AddSalaryService,
    private editUserService: EditUserService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchSalaryData();
  }

  /** Sidebar toggle */
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
  goToPayroll() {
    this.router.navigate(['/admin/preview-payroll']);
  }

    gotoAttendance() {
    if (this.user) {
      this.router.navigate(['/user/attendance/:id', this.user.userId]);
    }
}

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/admin/login']);
  }

  /** Salary table logic */
  fetchSalaryData() {
    this.loading = true;
    this.addSalaryService.getAllSalaryStructures().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...data];
        this.updatePagination();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load salary data';
        this.loading = false;
      }
    });
  }

  get pagedUsers(): UserSalary[] {
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
      this.cdr.detectChanges();
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

  trackByUserId(index: number, user: UserSalary): number {
    return user.userId;
  }

 editSalary(userId: number) {
  this.router.navigate(['/admin/edit-salary', userId]);
}
adjustSalary(userId: number) {
  this.router.navigate(['/admin/salary-adjustment', userId]);
}
previewPayroll(userId: number) {
  this.router.navigate(['/admin/preview-payroll', userId]);
}
  toggleStatus(user: UserSalary) {
    const newStatus = !user.isActive;
    if (!confirm(`Change status to ${newStatus ? 'Active' : 'Inactive'}?`)) return;
  }

  goBack() {
    this.location.back();
  }
}