# MySportsPlaylist Frontend

A modern Angular application for watching and managing sports matches with personal playlist functionality. Built with Angular 19 and featuring a clean, responsive design with real-time updates.

## 🚀 Features

### Core Functionality

- **Live Sports Streaming**: Watch live sports matches as they happen
- **Match Replays**: Access extensive library of recorded matches
- **Personal Playlists**: Create and manage custom sports playlists
- **Real-time Updates**: Auto-refreshing match data every 45 seconds
- **Search & Filter**: Advanced search and filtering capabilities
- **User Authentication**: Secure login and registration system

### Technical Features

- **Angular 19**: Latest Angular framework with standalone components
- **Reactive Programming**: RxJS for state management and real-time updates
- **SignalR Integration**: Real-time notifications and updates
- **Responsive Design**: Mobile-first approach with modern CSS
- **Progressive Web App**: Optimized for performance and user experience
- **Type Safety**: Full TypeScript implementation
- **Lazy Loading**: Route-based code splitting for optimal performance

## 🏗️ Architecture

### Project Structure

```text
src/
├── app/
│   ├── components/           # Feature components
│   │   ├── auth/            # Authentication components
│   │   ├── home/            # Landing page
│   │   ├── layout/          # Layout and navigation
│   │   ├── matches/         # Match-related components
│   │   └── playlist/        # Playlist management
│   ├── guards/              # Route guards
│   ├── models/              # TypeScript interfaces
│   ├── services/            # Business logic and API services
│   └── environments/        # Environment configurations
├── assets/                  # Static assets
└── styles.scss              # Global styles
```

### Key Components

#### Navigation & Layout

- **NavbarComponent**: Main navigation with authentication state
- **LayoutComponent**: Application layout wrapper
- **ToastComponent**: Real-time notification system

#### Match Management

- **MatchListComponent**: Browse and filter matches with auto-refresh
- **MatchDetailComponent**: Individual match viewing with video player
- **HomeComponent**: Landing page with feature highlights

#### Playlist System

- **PlaylistComponent**: Personal playlist management
- Integrated playlist actions throughout the application

#### Authentication

- **LoginComponent**: User authentication
- **RegisterComponent**: User registration
- **AuthGuard**: Route protection for authenticated features

### Services Architecture

#### Core Services

- **AuthService**: Authentication, token management, and user state
- **MatchService**: Match data with auto-refresh and real-time updates
- **PlaylistService**: Playlist CRUD operations
- **NotificationService**: SignalR-based real-time notifications

#### Features

- **Auto-refresh**: Configurable interval-based data updates
- **Reactive State**: BehaviorSubject-based state management
- **Error Handling**: Comprehensive error handling and user feedback
- **Token Management**: Automatic token refresh and secure storage

## 🛠️ Technology Stack

### Frontend Framework

- **Angular 19.2.x**: Modern Angular with standalone components
- **TypeScript 5.7.x**: Type-safe development
- **RxJS 7.8.x**: Reactive programming and state management

### UI & Styling

- **SCSS**: Advanced CSS preprocessing
- **Responsive Design**: Mobile-first CSS Grid and Flexbox
- **CSS Animations**: Smooth transitions and loading states

### Real-time Features

- **Microsoft SignalR 8.0.x**: Real-time communication
- **WebSocket**: Live updates and notifications

### Development Tools

- **Angular CLI 19.2.x**: Development and build tooling
- **Karma + Jasmine**: Unit testing framework
- **Angular DevTools**: Development and debugging

## 📦 Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Angular CLI 19.x

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MySportsPlaylist.Frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Configuration

Configure the API endpoint in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7161/api'  // Update with your API URL
};
```

## 🚀 Development

### Development Server

```bash
# Start dev server with hot reload
ng serve
# or
npm start

# The app will be available at http://localhost:4200/
```

### Building

```bash
# Development build
ng build

# Production build
ng build --configuration production

# Build artifacts will be stored in the `dist/` directory
```

### Code Generation

```bash
# Generate a new component
ng generate component component-name

# Generate a new service
ng generate service service-name

# Generate a new guard
ng generate guard guard-name

# See all available schematics
ng generate --help
```

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run tests in CI mode
ng test --watch=false --browsers=ChromeHeadless
```

### End-to-End Testing

```bash
# Run e2e tests (requires e2e framework setup)
ng e2e
```

## 📱 Usage

### For End Users

#### Getting Started

1. **Browse Matches**: Visit the matches page to see available live and replay content
2. **Search & Filter**: Use the search bar and filter buttons to find specific matches
3. **Create Account**: Register for a free account to access playlist features
4. **Build Playlists**: Add your favorite matches to personal playlists
5. **Watch Content**: Click on any match to view with the integrated video player

#### Key Features

- **Auto-refresh**: Match data updates automatically every 45 seconds
- **Real-time Notifications**: Get notified about new matches and updates
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Offline Support**: Basic functionality available without internet connection

### For Developers

#### State Management

The application uses a reactive state management approach:

```typescript
// Services use BehaviorSubjects for state
private matchesSubject = new BehaviorSubject<Match[]>([]);
public matches$ = this.matchesSubject.asObservable();

// Components subscribe to observables
this.matchService.matches$.subscribe(matches => {
  this.matches = matches;
});
```

#### Authentication Flow

```typescript
// Login process
this.authService.login(credentials).subscribe({
  next: (response) => {
    // User automatically redirected and state updated
  },
  error: (error) => {
    // Error handling and user feedback
  }
});
```

#### Real-time Updates

```typescript
// Auto-refresh configuration
private refreshInterval = 45000; // 45 seconds

// Manual refresh
this.matchService.refreshMatches('live');
```

## 🔧 Configuration

### Environment Variables

- `apiUrl`: Backend API endpoint
- `production`: Production mode flag

### Feature Flags

- Auto-refresh interval (configurable in MatchService)
- Toast notification duration (configurable in NotificationService)
- Maximum notifications limit (configurable in NotificationService)

### API Integration

The frontend expects the following API endpoints:

- `GET /api/matches` - Get all matches
- `GET /api/matches/live` - Get live matches
- `GET /api/matches/replay` - Get replay matches
- `GET /api/matches/{id}` - Get specific match
- `GET /api/matches/search?query={query}` - Search matches
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/playlists` - Get user playlist
- `POST /api/playlists/{matchId}` - Add to playlist
- `DELETE /api/playlists/{matchId}` - Remove from playlist

## 🚀 Deployment

### Build for Production

```bash
# Create production build
ng build --configuration production

# The build artifacts will be in the dist/ folder
```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM nginx:alpine
COPY dist/my-sports-playlist-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment-specific Builds

```bash
# Staging environment
ng build --configuration staging

# Production environment
ng build --configuration production
```

## 🤝 Contributing

### Development Guidelines

1. Follow Angular style guide and best practices
2. Use TypeScript strict mode
3. Write unit tests for new features
4. Follow semantic commit conventions
5. Use reactive programming patterns (RxJS)

### Code Style

- Use Angular CLI for consistent code generation
- Follow TypeScript naming conventions
- Use SCSS for styling with BEM methodology
- Implement proper error handling and loading states

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Submit pull request with clear description

## 📄 License

This project is part of a technical assignment for Clubber TV.

## 🆘 Support

### Common Issues

- **CORS Issues**: Ensure backend API has proper CORS configuration
- **Authentication**: Check token expiration and API endpoint configuration
- **Real-time Updates**: Verify SignalR hub connection in browser network tab
- **Build Errors**: Clear node_modules and npm cache, then reinstall

### Performance Optimization

- Lazy loading is implemented for all feature modules
- OnPush change detection strategy used where applicable
- Auto-refresh can be disabled for better performance
- Images are optimized and lazy-loaded

## 📊 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔄 Updates & Maintenance

### Regular Updates

- Angular framework updates
- Security patches for dependencies
- Performance optimizations
- New feature additions

### Monitoring

- Application performance monitoring
- Error tracking and reporting
- User analytics and behavior tracking
- Real-time system health monitoring
