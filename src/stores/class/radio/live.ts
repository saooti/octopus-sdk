import { Occurrence } from "./recurrence";

export interface CrudPlanningLive {
  isLive: boolean;
  dateValid: boolean;
  canalId: number;
  occurrenceId: number;
}

export interface TimeRangeAvailable {
  start: Date;
  end: Date;
}

export interface PlanningLive extends Occurrence {
}

export function emptyCrudPlanningLive(): CrudPlanningLive {
	return {
		isLive: false,
    dateValid: false,
    canalId: 0,
    occurrenceId:0,
	};
}