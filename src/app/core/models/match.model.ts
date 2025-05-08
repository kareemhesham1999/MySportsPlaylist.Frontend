export enum MatchStatus {
  Live = 0,
  Replay = 1
}

export interface Match {
  id: number;
  title: string;
  competition: string;
  description?: string;
  teams?: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  status: MatchStatus;
  isLive: boolean;
  thumbnailUrl?: string;
  videoUrl?: string;
  streamUrl?: string;
}