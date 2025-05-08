import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection: signalR.HubConnection | undefined;
  private matchStatusUpdated = new Subject<{ matchId: number, isLive: boolean }>();
  private hubUrl: string;
  
  matchStatusUpdated$ = this.matchStatusUpdated.asObservable();

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private configService: ConfigService
  ) {
    // The hub URL is outside the standard API path, so we need to modify it
    const baseApiUrl = this.configService.apiUrl.replace('/api', '');
    this.hubUrl = `${baseApiUrl}/hubs/notification`;
  }

  startConnection(): void {
    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connection started');
        this.registerSignalREvents();
      })
      .catch((err: Error) => console.error('Error starting SignalR connection:', err));
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR connection stopped'))
        .catch((err: Error) => console.error('Error stopping SignalR connection:', err));
      this.hubConnection = undefined;
    }
  }

  private registerSignalREvents(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('MatchStatusUpdated', (matchId: number, isLive: boolean) => {
      this.matchStatusUpdated.next({ matchId, isLive });
      
      const status = isLive ? 'live' : 'replay';
      this.toastr.info(`Match #${matchId} is now ${status}`, 'Match Status Updated');
    });
  }
}
