export interface CrudPlanningLive {
  isLive: boolean;
  dateValid: boolean;
  canalId: number;
  liveId: number;
}

export interface TimeRangeAvailable {
  start: Date;
  end: Date;
}

export interface PlanningLive {
  canalId: number;
  liveId: number;
  startDate: Date;
  endDate: Date;
  podcastId: number;
  podcastData: {
    title: string;
    artist: string;
    duration: number;
    conferenceId: number;
  };
}

export function emptyCrudPlanningLive(): CrudPlanningLive {
  return {
    isLive: false,
    dateValid: false,
    canalId: 0,
    liveId: 0,
  };
}
