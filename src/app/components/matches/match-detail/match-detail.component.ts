import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Match } from '../../../models/match.model';
import { MatchService } from '../../../services/match.service';
import { PlaylistService } from '../../../services/playlist.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './match-detail.component.html',
  styleUrls: ['./match-detail.component.scss']
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