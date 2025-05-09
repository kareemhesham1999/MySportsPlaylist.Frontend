export enum MatchStatus {
  Live = 'Live',
  Replay = 'Replay'
}

export interface Match {
  id: number;
  title: string;
  competition: string;
  date: string;
  status: MatchStatus;
  thumbnailUrl?: string;
  streamUrl?: string;
}