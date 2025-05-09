import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, Subscription } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Match } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = `${environment.apiUrl}/matches`;
  private refreshInterval = 3000; // 45 seconds - a good middle value between 30-60 seconds
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  private liveMatchesSubject = new BehaviorSubject<Match[]>([]);
  private replayMatchesSubject = new BehaviorSubject<Match[]>([]);
  private autoRefreshSubscription: Subscription | null = null;
  private currentFilter: 'all' | 'live' | 'replay' = 'all';

  constructor(private http: HttpClient) { }

  // Public observables that components can subscribe to
  public matches$ = this.matchesSubject.asObservable();
  public liveMatches$ = this.liveMatchesSubject.asObservable();
  public replayMatches$ = this.replayMatchesSubject.asObservable();

  // Start auto-refresh
  startAutoRefresh(filter: 'all' | 'live' | 'replay' = 'all'): void {
    this.currentFilter = filter;
    this.stopAutoRefresh(); // Stop any existing subscription

    // Initial data load
    this.refreshData();

    // Set up interval for auto-refresh
    this.autoRefreshSubscription = interval(this.refreshInterval)
      .subscribe(() => this.refreshData());
  }

  // Stop auto-refresh
  stopAutoRefresh(): void {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
      this.autoRefreshSubscription = null;
    }
  }

  // Refresh data based on current filter
  private refreshData(): void {
    switch (this.currentFilter) {
      case 'live':
        this.fetchLiveMatches().subscribe();
        break;
      case 'replay':
        this.fetchReplayMatches().subscribe();
        break;
      default:
        this.fetchAllMatches().subscribe();
        break;
    }
  }

  // Manual refresh method that components can call
  refreshMatches(filter: 'all' | 'live' | 'replay' = 'all'): void {
    this.currentFilter = filter;
    this.refreshData();
  }

  // Private methods to fetch data and update subjects
  private fetchAllMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.apiUrl).pipe(
      tap(matches => this.matchesSubject.next(matches))
    );
  }

  private fetchLiveMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/live`).pipe(
      tap(matches => this.liveMatchesSubject.next(matches))
    );
  }

  private fetchReplayMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/replay`).pipe(
      tap(matches => this.replayMatchesSubject.next(matches))
    );
  }

  // Original methods (kept for backward compatibility)
  getAllMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.apiUrl);
  }

  getMatchById(id: number): Observable<Match> {
    return this.http.get<Match>(`${this.apiUrl}/${id}`);
  }

  getLiveMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/live`);
  }

  getReplayMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/replay`);
  }

  searchMatches(query: string): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/search`, {
      params: { query }
    });
  }
}