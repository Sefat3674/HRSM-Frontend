import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">

      <!-- Header -->
      <header class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, admin!</p>
      </header>

      <!-- Action Buttons -->
      <div class="dashboard-actions">
       
        <button class="btn btn-success" (click)="goToAddUser()">
          <i class="bi bi-person-plus-fill me-1"></i> Add User
        </button>
      </div>

      <!-- Child components render here -->
      <div class="router-container">
        <router-outlet></router-outlet>
      </div>

      <!-- Logout Button -->
      <div class="logout-section">
        <button class="btn btn-danger logout-btn" (click)="logout()">
          <i class="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      font-family: 'Segoe UI', sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      margin-bottom: 5px;
      color: #333;
    }

    .dashboard-header p {
      font-size: 1rem;
      color: #666;
    }

    .dashboard-actions {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 10px 20px;
      font-size: 1rem;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-primary { background-color: #0d6efd; color: #fff; }
    .btn-success { background-color: #198754; color: #fff; }
    .btn-danger { background-color: #f44336; color: #fff; }

    .router-container {
      width: 100%;
    }

    .logout-section {
      margin-top: 40px;
    }
  `]
})
export class AdminComponent {
  constructor(private router: Router) {}
 goToAddUser() {
    this.router.navigate(['/admin/add-user']);
  }
  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }



 
}