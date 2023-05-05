export interface Media {
  mediaId: number;
  organisationId?: string;
  title: string;
  year?: string;
  type?: string;
  artiste?: string;
  album?: string;
  creation?: string;
  duration?: number;
  contentType?: string;
  filePath?: string;
  audioUrl?: string;
  cueIn?: number;
  cueOut?: number;
  bpm?: number;
}

export function emptyMediaData(): Media{
  return {
    mediaId: 0,
    album: '',
    artiste: '',
    title: '',
    type: '',
    year: '',
  }
}
