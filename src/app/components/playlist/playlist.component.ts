import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Match } from '../../models/match.model';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="playlist-container">
      <h2>My Playlist</h2>
      
      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading your playlist...</p>
      </div>
      
      <div *ngIf="!loading && matches.length === 0" class="empty-playlist">
        <p>Your playlist is empty.</p>
        <button routerLink="/matches" class="btn btn-primary">Browse Matches</button>
      </div>
      
      <div *ngIf="!loading && matches.length > 0" class="match-list">
        <div *ngFor="let match of matches" class="match-card">
          <div class="match-thumbnail">
            <img [src]="match.thumbnailUrl || 'assets/default-match.jpg'" alt="{{ match.title }}">
            <span class="match-status" [class.live]="match.status === 'Live'">
              {{ match.status }}
            </span>
          </div>
          
          <div class="match-details">
            <h3>{{ match.title }}</h3>
            <p class="match-competition">{{ match.competition }}</p>
            <p class="match-date">{{ match.date | date:'medium' }}</p>
            
            <div class="match-actions">
              <button 
                [routerLink]="['/matches', match.id]" 
                class="btn btn-primary"
              >
                Watch
              </button>
              
              <button 
                (click)="removeFromPlaylist(match.id)" 
                class="btn btn-danger"
                [disabled]="removingIds[match.id]"
              >
                <span *ngIf="removingIds[match.id]" class="spinner-sm"></span>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playlist-container {
      padding: 20px;
    }
    
    .match-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .match-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .match-card:hover {
      transform: translateY(-5px);
    }
    
    .match-thumbnail {
      position: relative;
      height: 180px;
    }
    
    .match-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .match-status {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      background-color: #6c757d;
      color: white;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .match-status.live {
      background-color: #dc3545;
    }
    
    .match-details {
      padding: 15px;
    }
    
    .match-details h3 {
      margin: 0 0 10px;
      font-size: 18px;
    }
    
    .match-competition {
      color: #6c757d;
      margin-bottom: 5px;
    }
    
    .match-date {
      color: #495057;
      margin-bottom: 15px;
      font-size: 14px;
    }
    
    .match-actions {
      display: flex;
      gap: 10px;
    }
    
    .btn {
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      border: none;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
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
    
    .empty-playlist {
      text-align: center;
      padding: 40px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class PlaylistComponent implements OnInit {
  matches: Match[] = [];
  loading = true;
  removingIds: { [key: number]: boolean } = {};
  
  constructor(private playlistService: PlaylistService) {}
  
  ngOnInit(): void {
    this.loadPlaylist();
  }
  
  loadPlaylist(): void {
    this.loading = true;
    this.playlistService.getUserPlaylist().subscribe({
      next: matches => {
        this.matches = matches;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading playlist', error);
        this.loading = false;
      }
    });
  }
  
  removeFromPlaylist(matchId: number): void {
    this.removingIds[matchId] = true;
    
    this.playlistService.removeFromPlaylist(matchId).subscribe({
      next: () => {
        this.matches = this.matches.filter(match => match.id !== matchId);
        this.removingIds[matchId] = false;
      },
      error: error => {
        console.error('Error removing from playlist', error);
        this.removingIds[matchId] = false;
      }
    });
  }
}