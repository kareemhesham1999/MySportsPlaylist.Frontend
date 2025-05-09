import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastNotification } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="visible">
      <div 
        class="toast" 
        [@toastAnimation]="visible ? 'visible' : 'hidden'"
        [ngClass]="getStatusClass(currentToast?.status)"
      >
        <div class="toast-header">
          <strong>{{ currentToast?.title }}</strong>
          <button class="close-btn" (click)="hideToast()">×</button>
        </div>
        <div class="toast-body">
          <p class="toast-message">{{ currentToast?.message }}</p>
          <p *ngIf="currentToast?.details" class="toast-details">{{ currentToast?.details }}</p>
          <span *ngIf="currentToast?.status" class="toast-status">{{ currentToast?.status }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1100;
      pointer-events: none;
    }
    
    .toast {
      width: 350px;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      margin-bottom: 10px;
      pointer-events: auto;
    }
    
    .toast-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
    
    .toast-header strong {
      font-size: 16px;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
      color: #6c757d;
    }
    
    .toast-body {
      padding: 12px 15px;
      position: relative;
    }
    
    .toast-message {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
    
    .toast-details {
      margin: 0;
      font-size: 13px;
      font-style: italic;
      color: #6c757d;
    }
    
    .toast-status {
      position: absolute;
      bottom: 12px;
      right: 15px;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 3px;
      color: white;
      background-color: #6c757d;
    }
    
    .status-live .toast-status {
      background-color: #28a745;
    }
    
    .status-upcoming .toast-status {
      background-color: #007bff;
    }
    
    .status-replay .toast-status {
      background-color: #6c757d;
    }
    
    /* Status border colors */
    .status-live {
      border-left: 4px solid #28a745;
    }
    
    .status-upcoming {
      border-left: 4px solid #007bff;
    }
    
    .status-replay {
      border-left: 4px solid #6c757d;
    }
  `],
  animations: [
    trigger('toastAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateX(100%)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('hidden => visible', [
        animate('300ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  visible = false;
  currentToast: ToastNotification | null = null;
  private subscription = new Subscription();
  
  constructor(private notificationService: NotificationService) {}
  
  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.toast$.subscribe(toast => {
        if (toast.visible) {
          this.showToast(toast);
        } else {
          this.hideToast();
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  showToast(toast: ToastNotification): void {
    this.currentToast = toast;
    this.visible = true;
  }
  
  hideToast(): void {
    this.visible = false;
  }
  
  getStatusClass(status?: string): string {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  }
}