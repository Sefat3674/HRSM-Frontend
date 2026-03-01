import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Needed for [(ngModel)]
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

  // Top navigation state
  showProfileDropdown: boolean = false;
  hasNotifications: boolean = true; // Toggle dynamically from API if needed
  searchQuery: string = '';

  constructor(
    private salaryService: EditSalaryService,
    private router: Router, // private is fine
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
      profilePic: localStorage.getItem('profilePic') || '' // optional
    };

    this.loadSalary(Number(userId));
  }

  // Load salary info
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

  // Compute total salary
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

  // Top nav actions
  logout(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']); // or window.history.back()
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    // Optional: call search API or filter
  }

  // CTRL + / shortcut for search focus
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      const input = document.querySelector<HTMLInputElement>('.search-box input');
      input?.focus();
    }
  }
}