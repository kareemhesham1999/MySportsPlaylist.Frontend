import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatchService } from '../../../core/services/match.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Match } from '../../../core/models/match.model';
import { MatchItemComponent } from '../match-item/match-item.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatchItemComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss']
})
export class MatchListComponent implements OnInit {
  matches: Match[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private matchService: MatchService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadMatches();
    this.setupRealTimeUpdates();
  }

  private loadMatches(): void {
    this.loading = true;
    this.matchService.getAllMatches().subscribe({
      next: (matches) => {
        this.matches = matches;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load matches. Please try again later.';
        this.loading = false;
        console.error('Error loading matches:', err);
      }
    });
  }

  private setupRealTimeUpdates(): void {
    this.notificationService.startConnection();
    this.notificationService.matchStatusUpdated$.subscribe(update => {
      // Find the match in our list and update its status
      const index = this.matches.findIndex(m => m.id === update.matchId);
      if (index !== -1) {
        this.matches[index].isLive = update.isLive;
      }
    });
  }
}
