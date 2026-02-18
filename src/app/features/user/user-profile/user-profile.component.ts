import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { User } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {

  @Input() user!: User;
  @Input() loading: boolean = false;
  @Input() error: string | null = null;

  constructor(private router: Router) {}

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/admin/login']);
  }

  get avatarUrl(): string {
    if (this.user?.fullName) {
      const initials = this.user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
      return `https://via.placeholder.com/70/667eea/ffffff?text=${initials}`;
    }
    return 'https://via.placeholder.com/70/667eea/ffffff?text=U';
  }
}