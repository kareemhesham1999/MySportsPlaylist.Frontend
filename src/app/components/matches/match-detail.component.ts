import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Match } from '../../models/match.model';
import { MatchService } from '../../services/match.service';
import { PlaylistService } from '../../services/playlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="match-detail-container">
      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading match...</p>
      </div>
      
      <div *ngIf="error" class="error-message">
        <p>{{ error }}</p>
        <button (click)="goBack()" class="btn btn-primary">Go Back</button>
      </div>
      
      <div *ngIf="!loading && !error && match" class="match-content">
        <div class="match-header">
          <h2>{{ match.title }}</h2>
          <div class="match-info">
            <span class="match-competition">{{ match.competition }}</span>
            <span class="match-date">{{ match.date | date:'medium' }}</span>
            <span class="match-status" [class.live]="match.status === 'Live'">
              {{ match.status }}
            </span>
          </div>
          
          <div class="match-actions">
            <button (click)="goBack()" class="btn btn-outline">
              Back to Matches
            </button>
            
            <button 
              *ngIf="isLoggedIn && !isInPlaylist"
              (click)="addToPlaylist()" 
              class="btn btn-primary"
              [disabled]="playlistLoading"
            >
              <span *ngIf="playlistLoading" class="spinner-sm"></span>
              Add to Playlist
            </button>
            
            <button 
              *ngIf="isLoggedIn && isInPlaylist"
              (click)="removeFromPlaylist()" 
              class="btn btn-danger"
              [disabled]="playlistLoading"
            >
              <span *ngIf="playlistLoading" class="spinner-sm"></span>
              Remove from Playlist
            </button>
          </div>
        </div>
        
        <div class="video-container">
          <video 
            *ngIf="match.streamUrl" 
            [src]="match.streamUrl" 
            controls 
            autoplay
            class="match-video"
          >
            Your browser does not support video playback.
          </video>
          
          <div *ngIf="!match.streamUrl" class="no-video">
            <p>No video stream available for this match.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .match-detail-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .match-header {
      margin-bottom: 20px;
    }
    
    .match-header h2 {
      margin: 0 0 10px;
      font-size: 24px;
    }
    
    .match-info {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .match-competition {
      color: #6c757d;
      font-weight: 500;
    }
    
    .match-date {
      color: #495057;
    }
    
    .match-status {
      padding: 4px 8px;
      background-color: #6c757d;
      color: white;
      border-radius: 3px;
      font-size: 14px;
    }
    
    .match-status.live {
      background-color: #dc3545;
    }
    
    .match-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    
    .video-container {
      width: 100%;
      background-color: #000;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 20px;
    }
    
    .match-video {
      width: 100%;
      max-height: 70vh;
    }
    
    .no-video {
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #212529;
      color: #fff;
    }
    
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #007bff;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
    
    .spinner-sm {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      margin-right: 5px;
    }
    
    .error-message {
      text-align: center;
      padding: 40px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 5px;
      margin-top: 20px;
    }
    
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      border: none;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-outline {
      background-color: transparent;
      border: 1px solid #6c757d;
      color: #6c757d;
    }
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class MatchDetailComponent implements OnInit {
  match: Match | null = null;
  loading = true;
  error = '';
  isInPlaylist = false;
  playlistLoading = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService,
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (isNaN(id)) {
          throw new Error('Invalid match ID');
        }
        return this.matchService.getMatchById(id);
      })
    ).subscribe({
      next: match => {
        this.match = match;
        this.loading = false;
        
        if (this.isLoggedIn && this.match) {
          this.checkIfInPlaylist();
        }
      },
      error: error => {
        this.error = 'Failed to load match. It may not exist or is unavailable.';
        this.loading = false;
        console.error('Error loading match', error);
      }
    });
  }
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
  
  checkIfInPlaylist(): void {
    if (!this.match) return;
    
    this.playlistService.isMatchInPlaylist(this.match.id).subscribe({
      next: isInPlaylist => {
        this.isInPlaylist = isInPlaylist;
      },
      error: error => {
        console.error('Error checking playlist status', error);
      }
    });
  }
  
  addToPlaylist(): void {
    if (!this.match) return;
    
    this.playlistLoading = true;
    
    this.playlistService.addToPlaylist(this.match.id).subscribe({
      next: () => {
        this.isInPlaylist = true;
        this.playlistLoading = false;
      },
      error: error => {
        console.error('Error adding to playlist', error);
        this.playlistLoading = false;
      }
    });
  }
  
  removeFromPlaylist(): void {
    if (!this.match) return;
    
    this.playlistLoading = true;
    
    this.playlistService.removeFromPlaylist(this.match.id).subscribe({
      next: () => {
        this.isInPlaylist = false;
        this.playlistLoading = false;
      },
      error: error => {
        console.error('Error removing from playlist', error);
        this.playlistLoading = false;
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/matches']);
  }
}