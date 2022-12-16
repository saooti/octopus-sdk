import { Player } from '../class/general/player';

export function getDefaultPlayerState(): Player {
  return {
    status: 'STOPPED', //STOPPED, LOADING, PLAYING, PAUSED
    podcast: undefined,
    volume: 1, //From 0 to 1
    elapsed: 0, //From 0 to 1
    total: 0,
    media: undefined,
    live: undefined,
    radio: undefined,
    seekTime:0,
  };
}