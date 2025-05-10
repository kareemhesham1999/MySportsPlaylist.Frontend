import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-icon" (click)="toggleNotificationsPanel()">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <div class="notifications-badge" *ngIf="unreadCount > 0">
        {{ unreadCount }}
      </div>
    </div>

    <div class="notifications-container" [class.show]="showNotifications">
      <div class="notifications-header">
        <h4>Notifications <span *ngIf="unreadCount > 0">({{ unreadCount }} new)</span></h4>
        <div class="header-actions">
          <button *ngIf="unreadCount > 0" class="mark-btn" (click)="markAllAsRead()">Mark all as read</button>
          <button class="clear-btn" (click)="clearNotifications()">Clear All</button>
        </div>
      </div>
      
      <div class="notification-filters" *ngIf="notifications.length > 0">
        <button 
          class="filter-btn" 
          [class.active]="activeFilter === 'all'"
          (click)="setFilter('all')">All</button>
        <button 
          class="filter-btn" 
          [class.active]="activeFilter === 'live'"
          (click)="setFilter('live')">Live</button>
        <button 
          class="filter-btn" 
          [class.active]="activeFilter === 'playlist'"
          (click)="setFilter('playlist')">Playlist</button>
      </div>
      
      <div class="notifications-list">
        <div *ngFor="let notification of filteredNotifications" 
          class="notification-item" 
          [class.unread]="!notification.read">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          
          <!-- Show details if available -->
          <div *ngIf="notification.details" class="notification-details">{{ notification.details }}</div>
          
          <!-- Show status badge if available -->
          <div *ngIf="notification.status" class="notification-status" [ngClass]="'status-' + notification.status.toLowerCase()">
            {{ notification.status }}
          </div>
          
          <div class="notification-time">{{ notification.timestamp | date:'short' }}</div>
          
          <div class="notification-actions">
            <button 
              *ngIf="!notification.read" 
              class="action-btn mark-read-btn" 
              (click)="markAsRead(notification.id!)">
              Mark as read
            </button>
            <button 
              class="action-btn delete-btn" 
              (click)="removeNotification(notification.id!)">
              Delete
            </button>
          </div>
        </div>
        
        <div *ngIf="filteredNotifications.length === 0" class="no-notifications">
          {{ notifications.length === 0 ? 'No notifications' : 'No notifications match the current filter' }}
        </div>
      </div>
      
      <div class="notifications-footer" *ngIf="notifications.length > 0">
        <button class="close-btn" (click)="toggleNotificationsPanel()">Close</button>
      </div>
    </div>
    
    <!-- Overlay to close notifications panel when clicking outside -->
    <div 
      *ngIf="showNotifications" 
      class="notifications-overlay"
      (click)="toggleNotificationsPanel()">
    </div>
  `,
  styles: [`
    .notifications-icon {
      position: fixed;
      top: 10px;
      right: 20px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1001;
      background-color: #f8f9fa;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      transition: background-color 0.2s;
    }
    
    .notifications-icon:hover {
      background-color: #e9ecef;
    }
    
    .notifications-icon svg {
      color: #495057;
    }
    
    .notifications-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #dc3545;
      color: white;
      font-size: 11px;
      font-weight: bold;
      min-width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .notifications-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.3);
      z-index: 999;
    }
    
    .notifications-container {
      position: fixed;
      top: 70px;
      right: 20px;
      width: 350px;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      overflow: hidden;
      display: none;
    }
    
    .notifications-container.show {
      display: block;
      animation: slide-in 0.2s ease-out;
    }
    
    @keyframes slide-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    .notifications-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
    
    .clear-btn, .mark-btn {
      background: none;
      border: none;
      font-size: 12px;
      cursor: pointer;
    }
    
    .clear-btn {
      color: #dc3545;
    }
    
    .mark-btn {
      color: #007bff;
    }
    
    .notification-filters {
      display: flex;
      padding: 8px 15px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #eee;
    }
    
    .filter-btn {
      background: none;
      border: none;
      margin-right: 10px;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      cursor: pointer;
      color: #666;
    }
    
    .filter-btn.active {
      background-color: #007bff;
      color: white;
    }
    
    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .notification-item {
      padding: 15px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
      position: relative;
    }
    
    .notification-item.unread {
      background-color: #f0f7ff;
    }
    
    .notification-item:hover {
      background-color: #f8f9fa;
    }
    
    .notification-title {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .notification-message {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .notification-details {
      font-size: 13px;
      color: #777;
      margin-bottom: 5px;
      font-style: italic;
    }
    
    .notification-status {
      display: inline-block;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 3px;
      color: white;
      margin-bottom: 5px;
    }
    
    .status-live {
      background-color: #28a745;
    }
    
    .status-replay {
      background-color: #6c757d;
    }
    
    .status-upcoming {
      background-color: #007bff;
    }
    
    .notification-time {
      font-size: 12px;
      color: #999;
    }
    
    .notification-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 10px;
    }
    
    .action-btn {
      background: none;
      border: none;
      font-size: 12px;
      cursor: pointer;
      padding: 3px 6px;
      border-radius: 3px;
    }
    
    .mark-read-btn {
      color: #007bff;
    }
    
    .mark-read-btn:hover {
      background-color: #e6f2ff;
    }
    
    .delete-btn {
      color: #dc3545;
    }
    
    .delete-btn:hover {
      background-color: #ffebee;
    }
    
    .no-notifications {
      padding: 15px;
      text-align: center;
      color: #6c757d;
    }
    
    .notifications-footer {
      padding: 10px 15px;
      display: flex;
      justify-content: flex-end;
      background-color: #f8f9fa;
      border-top: 1px solid #eee;
    }
    
    .close-btn {
      background: none;
      border: 1px solid #dee2e6;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      background-color: white;
    }
    
    .close-btn:hover {
      background-color: #e9ecef;
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  activeFilter = 'all';
  private subscriptions = new Subscription();
  
  constructor(private notificationService: NotificationService) {}
  
  ngOnInit(): void {
    // Subscribe to notifications
    this.subscriptions.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
        this.applyCurrentFilter();
        this.countUnread();
      })
    );
    
    // Load any existing notifications
    this.applyCurrentFilter();
    this.countUnread();
    
    // Listen for clicks outside to close
    this.subscriptions.add(
      this.addClickOutsideListener()
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  toggleNotificationsPanel(): void {
    this.showNotifications = !this.showNotifications;
  }
  
  clearNotifications(): void {
    this.notificationService.clearNotifications();
    this.showNotifications = false;
  }
  
  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }
  
  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
  
  removeNotification(notificationId: string): void {
    this.notificationService.removeNotification(notificationId);
  }
  
  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyCurrentFilter();
  }
  
  private applyCurrentFilter(): void {
    switch (this.activeFilter) {
      case 'live':
        this.filteredNotifications = this.notifications.filter(
          n => n.status?.toLowerCase() === 'live'
        );
        break;
      case 'playlist':
        this.filteredNotifications = this.notifications.filter(
          n => n.title?.includes('Playlist')
        );
        break;
      case 'all':
      default:
        this.filteredNotifications = [...this.notifications];
        break;
    }
  }
  
  private countUnread(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }
  
  private addClickOutsideListener(): Subscription {
    return new Subscription(); // This is a placeholder since we're using an overlay div instead
  }
}