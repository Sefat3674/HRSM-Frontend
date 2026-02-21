import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AttendanceCalendarComponent } from '../attendance-calendar/attendance-calendar.component';
import { User, UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, AttendanceCalendarComponent],
  templateUrl: './dashboardview.component.html',
  styleUrls: ['./dashboardview.component.scss']
})
export class DashboardViewComponent implements OnInit {
  user: User | null = null;
  isBrowser: boolean = false;

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Only access localStorage in the browser
      this.user = this.userService.loadUser();

      if (!this.user) {
        console.warn('No user found. Redirect to login if necessary.');
        // Optional: use Router to redirect
        // this.router.navigate(['/login']);
      }
    }
  }
}