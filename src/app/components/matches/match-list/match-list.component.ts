import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Match } from '../../../models/match.model';
import { MatchService } from '../../../services/match.service';
import { PlaylistService } from '../../../services/playlist.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss']
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