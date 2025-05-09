import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Notification {
  title: string;
  message: string;
  details?: string;
  status?: string;
  timestamp: Date;
  read?: boolean;
  id?: string;
}

export interface ToastNotification extends Notification {
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection: HubConnection | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private toastSubject = new Subject<ToastNotification>();
  private readonly MAX_NOTIFICATIONS = 50; // Maximum number of notifications to keep
  private readonly TOAST_DURATION = 5000; // Duration to show toast in milliseconds
  
  notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  toast$: Observable<ToastNotification> = this.toastSubject.asObservable();
  
  constructor(private authService: AuthService) {
    // Listen for auth changes to connect/disconnect from the hub
    this.authService.user$.subscribe(user => {
      if (user) {
        this.connect();
      } else if (this.hubConnection) {
        this.disconnect();
      }
    });
  }
  
  private connect(): void {
    const token = this.authService.token;
    
    if (!token) {
      return;
    }
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace('/api', '')}/hubs/notifications`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();
      
    this.hubConnection.start()
      .then(() => {
        console.log('SignalR Connected');
        
        // Single handler for all notifications
        this.hubConnection?.on('ReceiveNotification', (notification: Notification) => {
          // Parse the timestamp if it's a string
          if (typeof notification.timestamp === 'string') {
            notification.timestamp = new Date(notification.timestamp);
          }
          
          // Add unique ID and set as unread
          notification.id = this.generateId();
          notification.read = false;
          
          // Show toast notification
          this.showToastNotification(notification);
          
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = [notification, ...currentNotifications];
          
          // Limit the number of notifications
          const limitedNotifications = 
            updatedNotifications.length > this.MAX_NOTIFICATIONS
              ? updatedNotifications.slice(0, this.MAX_NOTIFICATIONS)
              : updatedNotifications;
          
          this.notificationsSubject.next(limitedNotifications);
          console.log('Received notification:', notification);
        });
      })
      .catch(err => {
        console.error('Error connecting to SignalR hub:', err);
      });
  }
  
  private disconnect(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('SignalR Disconnected');
          this.hubConnection = null;
        })
        .catch(err => {
          console.error('Error disconnecting from SignalR hub:', err);
        });
    }
  }
  
  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }
  
  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updatedNotifications);
  }
  
  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updatedNotifications);
  }
  
  removeNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(updatedNotifications);
  }
  
  getNotificationsCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        observer.next(notifications.length);
      });
    });
  }
  
  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        observer.next(notifications.filter(n => !n.read).length);
      });
    });
  }
  
  getNotificationsByType(type: string): Observable<Notification[]> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        observer.next(notifications.filter(n => n.title === type));
      });
    });
  }
  
  getNotificationsByStatus(status: string): Observable<Notification[]> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        observer.next(notifications.filter(n => n.status?.toLowerCase() === status.toLowerCase()));
      });
    });
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  private showToastNotification(notification: Notification): void {
    const toast: ToastNotification = {
      ...notification,
      visible: true
    };
    
    // Emit the toast notification
    this.toastSubject.next(toast);
    
    // Auto-hide the toast after a delay
    setTimeout(() => {
      toast.visible = false;
      this.toastSubject.next(toast);
    }, this.TOAST_DURATION);
  }
  
  // For testing - allows manually triggering a toast notification
  testToast(title: string, message: string, status?: string): void {
    const notification: Notification = {
      title,
      message,
      details: 'Test notification',
      status,
      timestamp: new Date(),
      id: this.generateId(),
      read: false
    };
    
    this.showToastNotification(notification);
    
    // Also add to notification list
    const updatedNotifications = [notification, ...this.notificationsSubject.value];
    this.notificationsSubject.next(updatedNotifications);
  }
}