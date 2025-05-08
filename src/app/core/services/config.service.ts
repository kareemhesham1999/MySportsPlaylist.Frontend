import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiBaseUrl = environment.apiUrl;

  constructor() { }

  get apiUrl(): string {
    return this.apiBaseUrl;
  }

  getApiEndpoint(endpoint: string): string {
    return `${this.apiBaseUrl}/${endpoint}`;
  }
}