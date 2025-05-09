import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Match } from '../models/match.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private apiUrl = `${environment.apiUrl}/playlists`;

  constructor(private http: HttpClient) {}

  getUserPlaylist(): Observable<Match[]> {
    return this.http.get<Match[]>(this.apiUrl);
  }

  addToPlaylist(matchId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${matchId}`, {});
  }

  removeFromPlaylist(matchId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${matchId}`);
  }

  isMatchInPlaylist(matchId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/contains/${matchId}`);
  }
}
