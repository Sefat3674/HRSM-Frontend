import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard-container">

      <!-- Sidebar -->
      <div class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <button class="toggle-btn" (click)="toggleSidebar()">
          {{ isSidebarCollapsed ? '▶' : '◀' }}
        </button>

        <div class="sidebar-buttons" *ngIf="!isSidebarCollapsed">
          <button class="btn btn-primary" (click)="gotoAttendance()">
            <i class="bi bi-speedometer2 me-1"></i> Attendance
          </button>
          <button class="btn btn-primary" (click)="goToAddUser()">
            <i class="bi bi-person-plus-fill me-1"></i> Add User
          </button>
          <button class="btn btn-primary" (click)="goToReports()">
            <i class="bi bi-bar-chart-fill me-1"></i> Reports
          </button>
        
          <button class="btn btn-danger" (click)="logout()">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content" [class.full-width]="isSidebarCollapsed">
        <header class="dashboard-header">
          <h1>Admin Dashboard</h1>
         
        </header>

        <div class="router-container">
          <router-outlet></router-outlet>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      display: flex;
      min-height: 100vh;
      font-family: 'Segoe UI', sans-serif;
      background: #f0f4ff;
      transition: all 0.3s;
    }

    /* Sidebar */
    .sidebar {
      width: 220px;
      background: #b5bbf9;
      color: #eb9999;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      transition: width 0.3s;
      border-radius: 0 12px 12px 0;
      box-shadow: 4px 0 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 60px;
      padding: 1rem 0;
    }

   

    .toggle-btn {
      align-self: flex-end;
      margin-bottom: 1.5rem;
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      cursor: pointer;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: background 0.3s;
    }
    .toggle-btn:hover { background: rgba(255,255,255,0.35); }

    .sidebar-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .btn {
        display: flex;
        align-items: center;
        gap: 5px;
        background: #5a67d8;
        border: none;
        padding: 0.6rem 1rem;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        color: #fff;
        transition: all 0.3s;
      }
      .btn:hover {
        background: #4c51bf;
        transform: translateX(3px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    }

    .sidebar-logout {
      margin-top: auto;
      .btn {
        width: 100%;
        background: #708cc9;
      }
      .btn:hover { background: #6357e6; }
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      transition: all 0.3s;
    }

    .main-content.full-width {
      flex: 1 1 100%;
      margin-left: 0;
    }

    .dashboard-header {
  display: flex;                // enable flexbox
  justify-content: center;      // horizontal centering
  align-items: center;          // vertical centering
  height: 120px;                // adjust as needed
  background-color: #f8f9fa;   // optional
  border-bottom: 1px solid #ddd;

  .header-content {
    text-align: center;         // center h1 and p inside
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  p {
    margin: 5px 0 0 0;
    color: #555;
  }
}

    /* Smooth routing container */
    .router-container { width: 100%; }
  `]
})
export class AdminComponent {

  isSidebarCollapsed = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
 
  gotoAttendance() {
    this.router.navigate(['/user/dashboard']);
  }
  goToDashboard() {
    this.router.navigate(['/user/Attendance']);
  }

  goToAddUser() {
    this.router.navigate(['/admin/add-user']);
  }

  goToReports() {
    this.router.navigate(['/admin/reports']);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
}