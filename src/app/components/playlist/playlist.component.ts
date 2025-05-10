import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Match } from '../../models/match.model';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
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