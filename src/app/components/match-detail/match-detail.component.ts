import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { MatchService } from '../../core/services/match.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { AuthService } from '../../core/services/auth.service';
import { Match } from '../../core/models/match.model';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './match-detail.component.html',
  styleUrls: ['./match-detail.component.scss']
})
export class MatchDetailComponent implements OnInit {
  match: Match | null = null;
  loading = true;
  error: string | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  isAddingToPlaylist = false;
  isUserLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService,
    private playlistService: PlaylistService,
    private authService: AuthService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.loadMatch();
  }

  private loadMatch(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!id) {
      this.error = 'Invalid match ID';
      this.loading = false;
      return;
    }

    this.matchService.getMatchById(id).subscribe({
      next: (match) => {
        this.match = match;
        if (match.videoUrl || match.streamUrl) {
          // Use either videoUrl or streamUrl, whichever is available
          const videoSource = match.videoUrl || match.streamUrl || '';
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoSource);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load match. Please try again later.';
        this.loading = false;
        console.error('Error loading match:', err);
      }
    });
  }

  addToPlaylist(): void {
    if (!this.match) return;
    
    this.isAddingToPlaylist = true;
    this.playlistService.addMatchToPlaylist(this.match.id).subscribe({
      next: () => {
        this.toastr.success('Match added to your playlist');
        this.isAddingToPlaylist = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to add match to playlist');
        this.isAddingToPlaylist = false;
        console.error('Error adding match to playlist:', err);
      }
    });
  }
}
