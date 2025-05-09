import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/" class="brand-link">MySportsPlaylist</a>
        </div>
        
        <div class="navbar-menu">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a routerLink="/matches" routerLinkActive="active" class="nav-link">Matches</a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn">
              <a routerLink="/playlist" routerLinkActive="active" class="nav-link">My Playlist</a>
            </li>
          </ul>
          
          <ul class="navbar-nav auth-nav">
            <ng-container *ngIf="!isLoggedIn">
              <li class="nav-item">
                <a routerLink="/login" routerLinkActive="active" class="nav-link">Login</a>
              </li>
              <li class="nav-item">
                <a routerLink="/register" routerLinkActive="active" class="nav-link register-link">Register</a>
              </li>
            </ng-container>
            
            <li class="nav-item" *ngIf="isLoggedIn">
              <span class="user-name">{{ currentUser?.username }}</span>
              <button class="logout-btn" (click)="logout()">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: #343a40;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 0;
    }
    
    .navbar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      max-width: 1200px;
      margin: 0 auto;
      height: 60px;
    }
    
    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .brand-link {
      color: white;
      text-decoration: none;
    }
    
    .navbar-menu {
      display: flex;
      align-items: center;
    }
    
    .navbar-nav {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 20px;
    }
    
    .auth-nav {
      margin-left: 20px;
    }
    
    .nav-link {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      padding: 8px 0;
      transition: color 0.3s;
      font-weight: 500;
    }
    
    .nav-link:hover, .nav-link.active {
      color: white;
    }
    
    .register-link {
      background-color: #007bff;
      padding: 8px 16px;
      border-radius: 4px;
      color: white;
    }
    
    .register-link:hover {
      background-color: #0069d9;
    }
    
    .user-name {
      color: rgba(255, 255, 255, 0.8);
      margin-right: 10px;
    }
    
    .logout-btn {
      background-color: transparent;
      border: 1px solid rgba(255, 255, 255, 0.5);
      color: rgba(255, 255, 255, 0.8);
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    @media (max-width: 768px) {
      .navbar-container {
        flex-direction: column;
        height: auto;
        padding: 15px;
      }
      
      .navbar-menu {
        flex-direction: column;
        width: 100%;
        margin-top: 15px;
      }
      
      .navbar-nav {
        flex-direction: column;
        width: 100%;
        gap: 10px;
      }
      
      .auth-nav {
        margin-left: 0;
        margin-top: 15px;
        width: 100%;
      }
    }
  `]
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
  
  get currentUser() {
    return this.authService.currentUser;
  }
  
  logout(): void {
    this.authService.logout();
  }
}