import { Media } from "./media";
import { Podcast } from "./podcast";

export interface Radio{
  canalId: number;
  url: string;
  metadata: MediaRadio;
  isInit: boolean;
  podcast?: Podcast;
}
export interface MediaRadio{
  artist:string;
  /* kind:string; */
  mediaId?:number;
  /* mediaType:string|null; */
  podcastId:number;
  startDate:string;
  title:string;
  /* uri:string; */
  mediaDuration: number,
  playDuration: number,
}

export interface MetadataRadio{
  channelId:number;
  currently:MediaRadio;
  previously:Array<MediaRadio>;
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