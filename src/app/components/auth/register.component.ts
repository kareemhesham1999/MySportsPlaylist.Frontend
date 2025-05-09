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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <h2>Register</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="form-control"
            [ngClass]="{ 'is-invalid': submitted && f['email'].errors }"
          />
          <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
            <div *ngIf="f['email'].errors['required']">Email is required</div>
            <div *ngIf="f['email'].errors['email']">
              Email must be a valid email address
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
            <div *ngIf="f['password'].errors['minlength']">
              Password must be at least 6 characters
            </div>
          </div>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            <span
              *ngIf="loading"
              class="spinner-border spinner-border-sm mr-1"
            ></span>
            Register
          </button>
        </div>

        <div *ngIf="error" class="alert alert-danger mt-3">{{ error }}</div>

        <div class="mt-3">
          <p>Already have an account? <a routerLink="/login">Login here</a></p>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .register-container {
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

      .alert-danger {
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #f5c6cb;
      }
    `,
  ],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup; // Using definite assignment assertion
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
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService
      .register({
        username: this.f['username'].value,
        email: this.f['email'].value,
        password: this.f['password'].value,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' },
          });
        },
        error: (error) => {
          this.error = error.message || 'Registration failed';
          this.loading = false;
        },
      });
  }
}
