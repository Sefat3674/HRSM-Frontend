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
  kpiCards: { title: string; value: string }[] = [];
  hasNotifications = true;
  showProfileDropdown = false;

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

    // Redirect to login if no user
    if (!this.user) {
      this.router.navigate(['/admin/login']);
      return;
    }

    // Fetch attendance for this user
    this.attendanceService.getAttendanceByUserId(this.user.userId)
      .subscribe({
        next: (data) => {
          console.log('Attendance fetched:', data);
          this.attendance = data;

          // Update KPI dynamically based on attendance (example)
          this.kpiCards = [
            { title: 'Attendance', value: `${this.attendance.length} / 154` },
            { title: 'Projects', value: '90 / 125' },
            { title: 'Clients', value: '69 / 86' },
            { title: 'Tasks', value: '96 / 100' },
            { title: 'Earnings', value: '$21,445' },
            { title: 'Profit This Week', value: '$5,544' },
            { title: 'Job Applicants', value: '98' },
            { title: 'New Hires', value: '45 / 48' }
          ];
        },
        error: (err) => {
          console.error('Error fetching attendance:', err);
        }
      });
  }

  // ================= SIDEBAR TOGGLE =================
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // ================= SIDEBAR NAVIGATION =================
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

  // ================= PROFILE DROPDOWN =================
  toggleProfileMenu(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }
}