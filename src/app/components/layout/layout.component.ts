import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { NotificationsComponent } from './notifications.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NotificationsComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <app-notifications></app-notifications>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .main-content {
      flex: 1;
      padding-bottom: 40px;
    }
  `]
})
export class LayoutComponent {}