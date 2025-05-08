import { Match } from './match.model';

export interface Playlist {
  id: number;
  userId: number;
  matches: Match[];
}