import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'matches',
        loadComponent: () => import('./components/matches/match-list/match-list.component').then(m => m.MatchListComponent)
      },
      {
        path: 'matches/:id',
        loadComponent: () => import('./components/matches/match-detail/match-detail.component').then(m => m.MatchDetailComponent)
      },
      {
        path: 'playlist',
        loadComponent: () => import('./components/playlist/playlist.component').then(m => m.PlaylistComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
