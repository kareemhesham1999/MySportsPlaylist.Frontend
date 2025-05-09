import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            formControlName="username"
            class="form-control"
            [ngClass]="{ 'is-invalid': submitted && f['username'].errors }"
          />
          <div
            *ngIf="submitted && f['username'].errors"
            class="invalid-feedback"
          >
            <div *ngIf="f['username'].errors['required']">
              Username is required
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="form-control"
            [ngClass]="{ 'is-invalid': submitted && f['password'].errors }"
          />
          <div
            *ngIf="submitted && f['password'].errors"
            class="invalid-feedback"
          >
            <div *ngIf="f['password'].errors['required']">
              Password is required
            </div>
          </div>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            <span
              *ngIf="loading"
              class="spinner-border spinner-border-sm mr-1"
            ></span>
            Login
          </button>
        </div>

        <div *ngIf="error" class="alert alert-danger mt-3">{{ error }}</div>

        <div class="mt-3">
          <p>
            Don't have an account? <a routerLink="/register">Register here</a>
          </p>
          <div class="test-credentials mt-3 p-2 border rounded bg-light">
            <p class="mb-1"><strong>Demo Accounts:</strong></p>
            <ul class="mb-0 ps-3">
              <li><small>Username: admin</small></li>
              <li><small>Password: Admin123!</small></li>
              <li><small>Username: user1</small></li>
              <li><small>Password: User123!</small></li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        background-color: #f7f7f7;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .is-invalid {
        border-color: #dc3545;
      }

      .invalid-feedback {
        color: #dc3545;
        font-size: 14px;
        margin-top: 5px;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
      }

      .btn-primary:disabled {
        background-color: #6c757d;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Using the definite assignment assertion
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService
      .login({
        username: this.f['username'].value,
        password: this.f['password'].value,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.error = error.message || 'Login failed';
          this.loading = false;
        },
      });
  }
}
