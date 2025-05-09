import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
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
      
      <div class="last-updated">
        <span>Auto-refreshing every 45 seconds. Last updated: {{ lastUpdated | date:'medium' }}</span>
        <button (click)="manualRefresh()" class="refresh-btn">
          <span *ngIf="refreshing" class="spinner-sm"></span>
          Refresh Now
        </button>
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
          </div>
          
          <div class="match-details">
            <h3>{{ match.title }}</h3>
            <p class="match-competition">{{ match.competition }}</p>
            <p class="match-date">
              {{ match.date | date:'medium' }}
              <span class="status-badge" [class.live-badge]="match.status === 'Live'" [class.replay-badge]="match.status === 'Replay'">
                {{ match.status }}
              </span>
            </p>
            
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
    
    .last-updated {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #6c757d;
    }
    
    .refresh-btn {
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
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
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .live-badge {
      background-color: #28a745; /* Green for live */
      color: white;
      animation: pulse-subtle 1.5s infinite;
    }
    
    .replay-badge {
      background-color: #6c757d; /* Grey for replay */
      color: white;
    }
    
    @keyframes pulse-subtle {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
      100% {
        opacity: 1;
      }
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
      
      .last-updated {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
    }
  `]
})
export class MatchListComponent implements OnInit, OnDestroy {
  matches: Match[] = [];
  loading = true;
  refreshing = false;
  currentFilter: 'all' | 'live' | 'replay' = 'all';
  searchControl = new FormControl('');
  playlistItems: Set<number> = new Set();
  playlistLoading: { [key: number]: boolean } = {};
  lastUpdated = new Date();
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private matchService: MatchService,
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Start auto-refresh with 'all' filter
    this.matchService.startAutoRefresh('all');
    
    // Subscribe to the matches observable
    this.subscribeToMatches();
    
    // Subscribe to search input changes
    this.subscriptions.push(
      this.searchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(query => {
        if (query && query.trim()) {
          this.searchMatches(query);
        } else {
          this.filterMatches(this.currentFilter);
        }
      })
    );
    
    // If user is logged in, load their playlist items
    if (this.isLoggedIn) {
      this.loadPlaylistItems();
    }
  }
  
  ngOnDestroy(): void {
    // Stop auto-refresh when component is destroyed
    this.matchService.stopAutoRefresh();
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
  
  subscribeToMatches(): void {
    // Reset existing subscriptions for matches
    this.subscriptions = this.subscriptions.filter(sub => 
      !sub.closed && sub !== this.subscriptions.find(s => s.closed)
    );
    
    // Subscribe based on current filter
    switch (this.currentFilter) {
      case 'live':
        this.subscriptions.push(
          this.matchService.liveMatches$.subscribe(matches => {
            this.matches = matches;
            this.loading = false;
            this.refreshing = false;
            this.lastUpdated = new Date();
          })
        );
        break;
      case 'replay':
        this.subscriptions.push(
          this.matchService.replayMatches$.subscribe(matches => {
            this.matches = matches;
            this.loading = false;
            this.refreshing = false;
            this.lastUpdated = new Date();
          })
        );
        break;
      default:
        this.subscriptions.push(
          this.matchService.matches$.subscribe(matches => {
            this.matches = matches;
            this.loading = false;
            this.refreshing = false;
            this.lastUpdated = new Date();
          })
        );
        break;
    }
  }
    
  filterMatches(filter: 'all' | 'live' | 'replay'): void {
    this.currentFilter = filter;
    this.loading = true;
    
    // Update the auto-refresh with new filter
    this.matchService.startAutoRefresh(filter);
    
    // Subscribe to the appropriate observable
    this.subscribeToMatches();
  }
  
  manualRefresh(): void {
    this.refreshing = true;
    this.matchService.refreshMatches(this.currentFilter);
  }
  
  searchMatches(query: string): void {
    this.loading = true;
    // Stop auto-refresh during search
    this.matchService.stopAutoRefresh();
    
    this.matchService.searchMatches(query).subscribe({
      next: matches => {
        this.matches = matches;
        this.loading = false;
        this.lastUpdated = new Date();
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