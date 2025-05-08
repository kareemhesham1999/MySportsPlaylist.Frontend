import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { PlaylistService } from '../../../core/services/playlist.service';
import { Playlist } from '../../../core/models/playlist.model';
import { Match } from '../../../core/models/match.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatTooltipModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  playlist: Playlist | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private playlistService: PlaylistService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadPlaylist();
  }

  loadPlaylist(): void {
    this.loading = true;
    this.playlistService.getUserPlaylist().subscribe({
      next: (playlist) => {
        this.playlist = playlist;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load your playlist. Please try again later.';
        this.loading = false;
        console.error('Error loading playlist:', err);
      }
    });
  }

  removeFromPlaylist(match: Match): void {
    if (confirm(`Are you sure you want to remove "${match.title}" from your playlist?`)) {
      this.playlistService.removeMatchFromPlaylist(match.id).subscribe({
        next: (updatedPlaylist) => {
          this.playlist = updatedPlaylist;
          this.toastr.success('Match removed from your playlist');
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to remove match from playlist');
          console.error('Error removing match from playlist:', err);
        }
      });
    }
  }
}
