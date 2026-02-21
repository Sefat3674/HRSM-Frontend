import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { User, UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user?: User;
  loading = true;
  error: string | null = null;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    try {
      const loadedUser = this.userService.loadUser();
      if (loadedUser) {
        this.user = loadedUser;
        this.loading = false;
      } else {
        throw new Error('User not found');
      }
    } catch (err: any) {
      this.error = err.message;
      this.loading = false;
    }
  }

  logout(): void {
    this.userService.clearUser();
    this.router.navigate(['/login']);
  }

  get avatarUrl(): string {
    const initials = (this.user?.fullName || 'U')
      .split(' ')
      .filter(n => n)
      .map(n => n[0])
      .join('')
      .toUpperCase();

    return `https://via.placeholder.com/70/667eea/ffffff?text=${initials || 'U'}`;
  }
}