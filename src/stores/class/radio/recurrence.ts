export interface TimeValue {
  HH: string;
  mm: string;
  ss: string;
}
export interface Cron {
  cronId?: number;
  cron: string;
  label?: string;
  timezone: string;
}
export interface Tranche {
  recId: number;
  start: number;
  duration: number;
  playlistName?: string;
  playlistId?: number;
  mixId?: number;
}
export interface PlanningOccurrence {
  occurrenceId?: number;
  canalId: number;
  chained: boolean;
  startDate: number;
  endDate?: number;
  podcastId?: number;
  nextOccurrence?: number;
  previousOccurrence?: number;
  recurrenceId?: number;
  podcastData: {
    title: string;
    artist: string;
    duration: number;
    pathAudio: number;
  };
}
export interface Recurrence {
  recurrenceId: number;
  name: string;
  canalId: number;
  validityStart: number;
  validityEnd: number;
  crons: Array<Cron>;
  duration: number;
}
export interface AmbianceRecurrence extends Recurrence {
  armbPlaylistName?: string;
  mediaPlaylistId?: number;
  mixId?: number;
}
export interface PlanningRecurrence extends Recurrence {
  octopusPlaylistName: string;
  octopusPlaylistId: number;
  chained: boolean;
  exclusions: Array<Exclusion>;
}
export interface Exclusion {
  exclusionId: number;
  validityStart: string;
  validityEnd: string;
}

export function emptyCron(): Cron {
  return {
    cron: "0 0 0 ? * MON,TUE,WED,THU,FRI,SAT,SUN *",
    label: "",
    timezone: "Europe/Paris",
  };
}
export function emptyTimeValue(): TimeValue {
  return {
    HH: "00",
    mm: "00",
    ss: "00",
  };
}
