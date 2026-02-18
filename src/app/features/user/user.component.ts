import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { UserService, User } from '../../core/services/user.service';
import { CommonModule, NgIf, NgClass, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgClass, RouterModule],
  template: `
    <div class="user-dashboard">
      <!-- Loading Spinner -->
      <div *ngIf="loading" class="spinner-container">
        <div class="spinner"></div>
        <p>Loading your profile...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="!loading && error" class="error-msg">
        {{ error }}
      </div>

      <!-- User Profile Card -->
      <div *ngIf="!loading && user" class="profile-card">
        <div class="profile-header">
          <img [src]="avatarUrl" alt="User Avatar" class="avatar">
          <h2>{{ user.fullName || user.userName }}</h2>
        </div>

        <div class="profile-details">
          <p><strong>Username:</strong> {{ user.userName }}</p>
          <p><strong>Full Name:</strong> {{ user.fullName }}</p>
          <p><strong>Email:</strong> {{ user.email || 'N/A' }}</p>
          <p><strong>Phone:</strong> {{ user.phone || 'N/A' }}</p>
          <p><strong>Status:</strong>
            <span [ngClass]="{'active': user.isActive, 'inactive': !user.isActive}">
              {{ user.isActive ? 'Active' : 'Inactive' }}
            </span>
          </p>
          <p><strong>Role:</strong> {{ roleName }}</p>
        </div>

        <nav class="user-nav">
          <a routerLink="/user/profile">Profile</a> |
          <a routerLink="/user/tasks">Tasks</a> |
          <a (click)="logout()" class="logout-link">Logout</a>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    .user-dashboard { padding: 2rem; text-align: center; font-family: Arial, sans-serif; }

    /* Spinner */
    .spinner-container { display: flex; flex-direction: column; align-items: center; }
    .spinner { border: 6px solid #f3f3f3; border-top: 6px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 0.5rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .error-msg { color: red; font-weight: bold; margin-top: 2rem; }

    /* Profile Card */
    .profile-card { max-width: 400px; margin: 2rem auto; padding: 1.5rem; border: 1px solid #ccc; border-radius: 10px; background-color: #f9f9ff; text-align: left; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .profile-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .avatar { width: 60px; height: 60px; border-radius: 50%; background-color: #667eea; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; }

    .profile-details p { margin: 0.3rem 0; }
    .profile-details .active { color: green; font-weight: bold; }
    .profile-details .inactive { color: red; font-weight: bold; }

    .user-nav { margin-top: 1.5rem; font-weight: 500; text-align: center; }
    .user-nav a { margin: 0 0.5rem; color: #667eea; text-decoration: none; cursor: pointer; }
    .user-nav a:hover { text-decoration: underline; }
    .logout-link { color: red; }

  `]
})
export class UserComponent implements OnInit, OnDestroy {

  user: User | null = null;
  loading = true;
  error: string | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.error = 'Cannot access user info on server.';
      this.loading = false;
      return;
    }

    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? Number(userIdStr) : undefined;

    if (!userId || isNaN(userId)) {
      this.error = 'Invalid user ID. Please login again.';
      this.loading = false;
      return;
    }

    // Fetch user profile
    this.subscription = this.userService.getUserById(userId).subscribe({
      next: (res) => {
        this.user = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.error = 'Failed to load user profile.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.router.navigate(['/admin/login']);
  }

  get roleName(): string {
    const roles: Record<number, string> = { 1: 'Admin', 2: 'User' };
    return this.user ? (roles[this.user.roleId] || 'Unknown') : 'Unknown';
  }

  get avatarUrl(): string {
    // Optional: use initials if no image
    if (this.user && this.user.fullName) {
      const initials = this.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      return `https://via.placeholder.com/60/667eea/ffffff?text=${initials}`;
    }
    return `https://via.placeholder.com/60/667eea/ffffff?text=U`;
  }
}