import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AttendanceCalendarComponent } from '../attendance-calendar/attendance-calendar.component';
import { User } from '../../../core/services/user.service';
import { EditSalaryService, UserSalary } from '../../../core/services/edit-salary.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, AttendanceCalendarComponent],
  templateUrl: './dashboardview.component.html',
  styleUrls: ['./dashboardview.component.scss']
})
export class DashboardViewComponent implements OnInit {
  user: User | null = null;
  salary: UserSalary | null = null;
  isBrowser: boolean = false;
  loadingSalary: boolean = false;

  constructor(
    private salaryService: EditSalaryService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (!this.isBrowser) return;

    const userId = localStorage.getItem('userId');

    if (!userId) {
      // User not logged in → redirect to login
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    // Load user info from localStorage
    this.user = {
      userId: Number(userId),
      fullName: localStorage.getItem('fullName') || '',
      email: localStorage.getItem('email') || '',
      roleName: localStorage.getItem('userRole') || '',
      userName: localStorage.getItem('userName') || '',
      phone: localStorage.getItem('phone') || ''
    };

    this.loadSalary(Number(userId));
  }

  loadSalary(userId: number): void {
    this.loadingSalary = true;

    this.salaryService.getSalaryById(userId).subscribe({
      next: (response) => {
        this.salary = response && response.length > 0 ? response[0] : null;
        this.loadingSalary = false;
      },
      error: (error) => {
        console.error('Error fetching salary:', error);
        this.salary = null;
        this.loadingSalary = false;
      }
    });
  }

  getTotalSalary(): number {
    if (!this.salary) return 0;

    return (
      (this.salary.basicSalary || 0) +
      (this.salary.houseRentAllowance || 0) +
      (this.salary.medicalAllowance || 0) +
      (this.salary.transportAllowance || 0) +
      (this.salary.otherAllowance || 0)
    );
  }

  logout(): void {
    if (!this.isBrowser) return;

    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}