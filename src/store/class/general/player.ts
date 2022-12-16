import { Media } from "./media";
import { Podcast } from "./podcast";

export interface Radio{
  canalId: number;
  url: string;
  metadata: MediaRadio;
}
export interface MediaRadio{
  artist:string;
  duration:number;
  kind:string;
  mediaId:number;
  mediaType:string|null;
  playlistId:number;
  startDate:string;
  title:string;
  uri:string;
}


export interface Player{
    status: string; //STOPPED, LOADING, PLAYING, PAUSED
    podcast: Podcast|undefined;
    volume?: number; //From 0 to 1
    elapsed?: number; //From 0 to 1
    total?: number;
    media: Media|undefined;
    live: Podcast|undefined;
    radio: Radio|undefined; 
    stop?: boolean;
    seekTime?: number;
    transcript?:{actual: number, actualText:string, value : Array<{endTime: number, startTime:number, text: string}>};
  }