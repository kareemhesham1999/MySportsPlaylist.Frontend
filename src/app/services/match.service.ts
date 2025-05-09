import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Match } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = `${environment.apiUrl}/matches`;

  constructor(private http: HttpClient) { }

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