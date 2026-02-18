import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserService, User } from '../../core/services/user.service';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AttendanceCalendarComponent } from '../user/attendance-calendar/attendance-calendar.component';
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AttendanceTableComponent, UserProfileComponent, AttendanceCalendarComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  // User Data
  user: User | null = null;
  loading = true;
  error: string | null = null;

  // ✅ Updated View Tracker
  view: 'dashboard' | 'attendance' | 'Show User Table' | 'profile' = 'dashboard';

  // Sidebar state
  isSidebarCollapsed = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadUser();
  }

  /** Load user data from localStorage */
  private loadUser(): void {
    const userIdStr = localStorage.getItem('userId');

    if (!userIdStr) {
      this.error = 'Please login again';
      this.loading = false;
      return;
    }

    this.user = {
      userId: Number(userIdStr),
      userName: localStorage.getItem('userName') || '',
      fullName: localStorage.getItem('fullName') || '',
      email: localStorage.getItem('email') || '',
      phone: localStorage.getItem('phone') || '',
      roleId: Number(localStorage.getItem('roleId') || 0),
      roleName: localStorage.getItem('userRole') || 'User',
      isActive: true
    };

    this.loading = false;
  }

  /** Logout user */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.router.navigate(['/admin/login']);
  }

  /** View Switchers */
  showDashboard(): void {
    this.view = 'dashboard';
  }

  showAttendance(): void {
    this.view = 'attendance';
  }

   showUserTable(): void {
    if (this.user?.roleName === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/user/dashboard']);
    }
  }

  showProfile(): void {
    this.view = 'profile';
  }

  /** Navigate to the previous page */
  goBack(): void {
    this.location.back();
  }

  /** Toggle sidebar collapse/expand */
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

}