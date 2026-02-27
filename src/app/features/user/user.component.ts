  import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
  import { CommonModule, isPlatformBrowser } from '@angular/common';
  import { RouterModule, Router } from '@angular/router';
  import { Location } from '@angular/common';
  import { UserService, User } from '../../core/services/user.service';
  import { AttendanceService, Attendance } from '../../core/services/attendance.service';

  @Component({
    selector: 'app-user-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
  })
  export class UserComponent implements OnInit {
    user: User | null = null;
    attendance: Attendance[] = [];
    isSidebarCollapsed = false;

    constructor(
      private userService: UserService,
      private attendanceService: AttendanceService,
      private router: Router,
      private location: Location,
      @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit(): void {
      if (!isPlatformBrowser(this.platformId)) return;

      // Load current user
      this.user = this.userService.loadUser();

      // Redirect if no user
      if (!this.user) {
        this.router.navigate(['/admin/login']);
        return;
      }

      // ✅ Fetch attendance for this user
      this.attendanceService.getAttendanceByUserId(this.user.userId)
        .subscribe({
          next: (data) => {
            console.log('Attendance fetched:', data);
            this.attendance = data;
          },
          error: (err) => {
            console.error('Error fetching attendance:', err);
          }
        });
    }

    toggleSidebar(): void {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    // Sidebar navigation
    goToDashboard(): void {
      this.router.navigate(['/user/dashboard']);
    }

    gotoAttendance(): void {
    if (this.user) {
      this.router.navigate(['/user/attendance', this.user.userId]);
    }
  }

    showUserTable(): void {
      this.router.navigate(['/admin/dashboard']);
    }

    showUserSalary(): void {
      this.router.navigate(['/admin/add-salary']);
    }
    showPayroll(): void {
      this.router.navigate(['/admin/payroll']);
    }
    reviewPayroll(): void {
      this.router.navigate(['/admin/preview-payroll']);
    }

    showProfile(): void {
      this.router.navigate(['/user/profile']);
    }

    logout(): void {
      if (isPlatformBrowser(this.platformId)) {
        this.userService.clearUser();
      }
      this.router.navigate(['/admin/login']);
    }

    goBack(): void {
      this.location.back();
    }
  }