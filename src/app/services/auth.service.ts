import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenExpirationTimer: any;
  
  user$ = this.userSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuthData();
  }
  
  get currentUser(): User | null {
    return this.userSubject.value;
  }
  
  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }
  
  get token(): string | null {
    return localStorage.getItem('token');
  }
  
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData)
      .pipe(
        map(response => {
          // Transform the API response to match our frontend AuthResponse model
          return {
            token: response.token,
            expiresAt: this.calculateExpiryTime(24), // Set token to expire in 24 hours
            user: {
              id: response.userId,
              username: response.username, 
              email: response.email
            }
          } as AuthResponse;
        }),
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }
  
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/register`, registerData)
      .pipe(
        map(response => {
          // Transform the API response to match our frontend AuthResponse model
          return {
            token: response.token,
            expiresAt: this.calculateExpiryTime(24), // Set token to expire in 24 hours
            user: {
              id: response.userId,
              username: response.username, 
              email: response.email
            }
          } as AuthResponse;
        }),
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }
  
  logout(): void {
    this.userSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('user');
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.router.navigate(['/login']);
  }
  
  private handleAuthentication(authResponse: AuthResponse): void {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('expiresAt', authResponse.expiresAt);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    
    this.userSubject.next(authResponse.user);
    this.autoLogout(new Date(authResponse.expiresAt).getTime() - new Date().getTime());
  }
  
  private loadStoredAuthData(): void {
    const token = localStorage.getItem('token');
    const expiresAtStr = localStorage.getItem('expiresAt');
    const userData = localStorage.getItem('user');
    
    if (!token || !expiresAtStr || !userData) {
      return;
    }
    
    const expiresAt = new Date(expiresAtStr);
    
    if (expiresAt <= new Date()) {
      this.logout();
      return;
    }
    
    const user = JSON.parse(userData) as User;
    this.userSubject.next(user);
    this.autoLogout(expiresAt.getTime() - new Date().getTime());
  }
  
  private autoLogout(expirationDuration: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
  
  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
  
  // Helper to calculate expiry time
  private calculateExpiryTime(hoursFromNow: number): string {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + hoursFromNow);
    return expiryDate.toISOString();
  }
}