import { Media } from "./media";
import { Podcast } from "./podcast";

export interface Player{
    status: string; //STOPPED, LOADING, PLAYING, PAUSED
    podcast: Podcast|undefined;
    volume?: number; //From 0 to 1
    elapsed?: number; //From 0 to 1
    total?: number;
    media: Media|undefined;
    live: Podcast|undefined;
    stop?: boolean;
    seekTime?: number;
    transcript?:{actual: number, actualText:string, value : Array<{endTime: number, startTime:number, text: string}>};
  }