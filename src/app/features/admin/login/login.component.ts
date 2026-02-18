import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    this.authService.adminLogin(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.loading = false;

        // Browser-only localStorage
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('adminToken', res.token);
          localStorage.setItem('userRole', res.roleName || 'User');
          localStorage.setItem('userId', res.userId.toString());
          localStorage.setItem('fullName', res.fullName);
          localStorage.setItem('email', res.email);
          localStorage.setItem('userName', res.userName);
          localStorage.setItem('phone', res.phone);
        }

        // Role-based navigation
        if (res.roleName === 'Admin') {
          this.router.navigate(['/user/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}