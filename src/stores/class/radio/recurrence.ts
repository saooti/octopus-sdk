export interface TimeValue{
	hours: number;
	minutes: number;
	seconds: number;
}
export interface Cron {
	cronId?: number;
	cron: string;
	label?:string;
	timezone: string;
}
export interface Tranche {
	recId: number;
	start: string;
	duration: number;
	playlistName?: string;
	playlistId?: number;
	mixId?: number;
}


export interface Occurrence {
	occurrenceId: number;
	canalId: number;
	startDate: string;
	recurrenceStartDate: string;
	endDate:string;
	podcastId: number;
	recurrenceId:number;
	podcastData:{
    title: string;
    artist: string;
    duration: number;
    pathAudio: number;
		conferenceId: number;
		description: string;
		imageUrl: string;
  };
}

export interface PlanningOccurrence extends Occurrence{
	chained: boolean,
	nextOccurrence?: number,
	previousOccurrence?: number,
}

export interface Recurrence {
	recurrenceId: number;
	name: string;
	canalId: number;
	validityStart: string;
	validityEnd: string;
	crons: Array<Cron>;
	duration:number;
}
export interface AmbianceRecurrence extends Recurrence {
	armbPlaylistName?: string;
	mediaPlaylistId?: number;
	mixId?: number;
}
export interface PlanningRecurrence extends Recurrence{
	octopusPlaylistName: string;
	octopusPlaylistId: number;
	chained: boolean;
	exclusions: Array<Exclusion>
}
export interface Exclusion {
	exclusionId: number;
	validityStart: string;
	validityEnd: string;
}

export function emptyCron(): Cron {
	return {
		cron:"0 0 0 ? * MON,TUE,WED,THU,FRI,SAT,SUN *",
		label:"",
		timezone: "Europe/Paris",
	};
}
export function emptyTimeValue(): TimeValue {
	return {
		hours: 0,
		minutes: 0,
		seconds: 0,
	};
}