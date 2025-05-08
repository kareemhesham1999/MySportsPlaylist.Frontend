import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { MatchListComponent } from './components/matches/match-list/match-list.component';
import { MatchDetailComponent } from './components/match-detail/match-detail.component';
import { PlaylistComponent } from './components/playlist/playlist/playlist.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/matches', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'matches', component: MatchListComponent },
  { path: 'matches/:id', component: MatchDetailComponent },
  { path: 'playlist', component: PlaylistComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/matches' }
];
