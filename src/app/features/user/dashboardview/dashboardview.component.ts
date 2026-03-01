import { Component, OnInit, Inject, PLATFORM_ID, HostListener, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceCalendarComponent } from '../attendance-calendar/attendance-calendar.component';
import { User } from '../../../core/services/user.service';
import { EditSalaryService, UserSalary } from '../../../core/services/edit-salary.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, FormsModule, AttendanceCalendarComponent],
  templateUrl: './dashboardview.component.html',
  styleUrls: ['./dashboardview.component.scss']
})
export class DashboardViewComponent implements OnInit {
  user: User | null = null;
  salary: UserSalary | null = null;
  isBrowser: boolean = false;
  loadingSalary: boolean = false;

  showProfileDropdown: boolean = false;
  hasNotifications: boolean = true;
  searchQuery: string = '';

  constructor(
    private salaryService: EditSalaryService,
    private router: Router,
    private ngZone: NgZone,           // ← ADDED
    private cdr: ChangeDetectorRef,   // ← ADDED
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.user = {
      userId: Number(userId),
      fullName: localStorage.getItem('fullName') || '',
      email: localStorage.getItem('email') || '',
      roleName: localStorage.getItem('userRole') || '',
      userName: localStorage.getItem('userName') || '',
      phone: localStorage.getItem('phone') || '',
      profilePic: localStorage.getItem('profilePic') || ''
    };

    this.loadSalary(Number(userId));
  }

  loadSalary(userId: number): void {
    this.loadingSalary = true;
    this.cdr.markForCheck();  // ← trigger spinner immediately

    this.salaryService.getSalaryById(userId).subscribe({
      next: (response) => {
        this.ngZone.run(() => {                                      // ← ADDED
          this.salary = response?.length > 0 ? response[0] : null;
          this.loadingSalary = false;
          this.cdr.markForCheck();                                   // ← ADDED
        });
      },
      error: (error) => {
        console.error('Error fetching salary:', error);
        this.ngZone.run(() => {                                      // ← ADDED
          this.salary = null;
          this.loadingSalary = false;
          this.cdr.markForCheck();                                   // ← ADDED
        });
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

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      const input = document.querySelector<HTMLInputElement>('.search-box input');
      input?.focus();
    }
  }
}