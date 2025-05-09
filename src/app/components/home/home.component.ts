import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <div class="hero">
        <div class="hero-content">
          <h1>Welcome to MySportsPlaylist</h1>
          <p class="lead">
            Your personal hub for sports matches. Watch live games, catch up on replays, 
            and build your own sports playlist.
          </p>
          
          <div class="cta-buttons">
            <button routerLink="/matches" class="btn btn-primary">Browse Matches</button>
            <button *ngIf="!isLoggedIn" routerLink="/register" class="btn btn-outline">
              Sign Up Now
            </button>
            <button *ngIf="isLoggedIn" routerLink="/playlist" class="btn btn-outline">
              My Playlist
            </button>
          </div>
        </div>
      </div>
      
      <div class="features">
        <div class="feature-card">
          <div class="feature-icon">🏆</div>
          <h3>Live Matches</h3>
          <p>
            Watch live sports matches as they happen. Never miss a moment of action 
            with our high-quality streams.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">⏱️</div>
          <h3>Match Replays</h3>
          <p>
            Missed a game? No problem. Catch up with our extensive library of match 
            replays available on demand.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📋</div>
          <h3>Custom Playlists</h3>
          <p>
            Create your own personal sports playlist. Save your favorite matches and 
            watch them anytime.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .hero {
      padding: 80px 0;
      text-align: center;
      background-color: #f8f9fa;
      margin-bottom: 40px;
      border-radius: 8px;
    }
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #343a40;
    }
    
    .lead {
      font-size: 1.25rem;
      margin-bottom: 30px;
      color: #6c757d;
    }
    
    .cta-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    
    .btn {
      padding: 12px 24px;
      font-size: 1rem;
      border-radius: 4px;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
      border: none;
    }
    
    .btn-outline {
      background-color: transparent;
      border: 1px solid #007bff;
      color: #007bff;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 60px;
    }
    
    .feature-card {
      padding: 30px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    
    .feature-card h3 {
      margin-bottom: 15px;
      color: #343a40;
    }
    
    .feature-card p {
      color: #6c757d;
    }
    
    @media (max-width: 768px) {
      .hero {
        padding: 60px 0;
      }
      
      .hero h1 {
        font-size: 2rem;
      }
      
      .cta-buttons {
        flex-direction: column;
      }
      
      .features {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  constructor(private authService: AuthService) {}
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}