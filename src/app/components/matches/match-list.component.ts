import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Match } from '../../models/match.model';
import { MatchService } from '../../services/match.service';
import { PlaylistService } from '../../services/playlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="matches-container">
      <h2>Sports Matches</h2>
      
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            [formControl]="searchControl" 
            placeholder="Search matches..." 
            class="search-input"
          />
        </div>
        
        <div class="filter-buttons">
          <button 
            (click)="filterMatches('all')" 
            [class.active]="currentFilter === 'all'" 
            class="filter-btn"
          >
            All
          </button>
          <button 
            (click)="filterMatches('live')" 
            [class.active]="currentFilter === 'live'" 
            class="filter-btn"
          >
            Live
          </button>
          <button 
            (click)="filterMatches('replay')" 
            [class.active]="currentFilter === 'replay'" 
            class="filter-btn"
          >
            Replay
          </button>
        </div>
      </div>
      
      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading matches...</p>
      </div>
      
      <div *ngIf="!loading && matches.length === 0" class="no-matches">
        <p>No matches found. Try adjusting your search or filters.</p>
      </div>
      
      <div class="match-grid">
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
                *ngIf="isLoggedIn && !isInPlaylist(match.id)"
                (click)="addToPlaylist(match.id)" 
                class="btn btn-outline"
                [disabled]="playlistLoading[match.id]"
              >
                <span *ngIf="playlistLoading[match.id]" class="spinner-sm"></span>
                Add to Playlist
              </button>
              
              <button 
                *ngIf="isLoggedIn && isInPlaylist(match.id)"
                (click)="removeFromPlaylist(match.id)" 
                class="btn btn-danger"
                [disabled]="playlistLoading[match.id]"
              >
                <span *ngIf="playlistLoading[match.id]" class="spinner-sm"></span>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .matches-container {
      padding: 20px;
    }
    
    .filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .search-box {
      flex: 1;
      max-width: 400px;
      margin-right: 20px;
    }
    
    .search-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .filter-buttons {
      display: flex;
      gap: 10px;
    }
    
    .filter-btn {
      padding: 8px 16px;
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .filter-btn.active {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }
    
    .match-grid {
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
    
    .btn-outline {
      background-color: transparent;
      border: 1px solid #007bff;
      color: #007bff;
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
    
    .no-matches {
      text-align: center;
      padding: 40px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .search-box {
        width: 100%;
        max-width: none;
        margin-right: 0;
        margin-bottom: 15px;
      }
    }
  `]
})
export class MatchListComponent implements OnInit {
  matches: Match[] = [];
  filteredMatches: Match[] = [];
  loading = true;
  currentFilter = 'all';
  searchControl = new FormControl('');
  playlistItems: Set<number> = new Set();
  playlistLoading: { [key: number]: boolean } = {};
  
  constructor(
    private matchService: MatchService,
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadAllMatches();
    
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query && query.trim()) {
        this.searchMatches(query);
      } else {
        this.filterMatches(this.currentFilter);
      }
    });
    
    // If user is logged in, load their playlist items
    if (this.isLoggedIn) {
      this.loadPlaylistItems();
    }
  }
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
  
  loadAllMatches(): void {
    this.loading = true;
    this.matchService.getAllMatches().subscribe({
      next: matches => {
        this.matches = matches;
        this.filteredMatches = matches;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading matches', error);
        this.loading = false;
      }
    });
  }
  
  filterMatches(filter: string): void {
    this.currentFilter = filter;
    this.loading = true;
    
    switch (filter) {
      case 'live':
        this.matchService.getLiveMatches().subscribe({
          next: matches => {
            this.matches = matches;
            this.loading = false;
          },
          error: error => {
            console.error('Error loading live matches', error);
            this.loading = false;
          }
        });
        break;
      
      case 'replay':
        this.matchService.getReplayMatches().subscribe({
          next: matches => {
            this.matches = matches;
            this.loading = false;
          },
          error: error => {
            console.error('Error loading replay matches', error);
            this.loading = false;
          }
        });
        break;
      
      default:
        this.loadAllMatches();
        break;
    }
  }
  
  searchMatches(query: string): void {
    this.loading = true;
    this.matchService.searchMatches(query).subscribe({
      next: matches => {
        this.matches = matches;
        this.loading = false;
      },
      error: error => {
        console.error('Error searching matches', error);
        this.loading = false;
      }
    });
  }
  
  loadPlaylistItems(): void {
    this.playlistService.getUserPlaylist().subscribe({
      next: matches => {
        this.playlistItems = new Set(matches.map(match => match.id));
      },
      error: error => {
        console.error('Error loading playlist', error);
      }
    });
  }
  
  isInPlaylist(matchId: number): boolean {
    return this.playlistItems.has(matchId);
  }
  
  addToPlaylist(matchId: number): void {
    this.playlistLoading[matchId] = true;
    
    this.playlistService.addToPlaylist(matchId).subscribe({
      next: () => {
        this.playlistItems.add(matchId);
        this.playlistLoading[matchId] = false;
      },
      error: error => {
        console.error('Error adding to playlist', error);
        this.playlistLoading[matchId] = false;
      }
    });
  }
  
  removeFromPlaylist(matchId: number): void {
    this.playlistLoading[matchId] = true;
    
    this.playlistService.removeFromPlaylist(matchId).subscribe({
      next: () => {
        this.playlistItems.delete(matchId);
        this.playlistLoading[matchId] = false;
      },
      error: error => {
        console.error('Error removing from playlist', error);
        this.playlistLoading[matchId] = false;
      }
    });
  }
}