import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playlist } from '../models/playlist.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.getApiEndpoint('playlists');
  }

  getUserPlaylist(): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/user`);
  }

  addMatchToPlaylist(matchId: number): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/matches/${matchId}`, {});
  }

  removeMatchFromPlaylist(matchId: number): Observable<Playlist> {
    return this.http.delete<Playlist>(`${this.apiUrl}/matches/${matchId}`);
  }
}
