export interface Media {
  mediaId: number;
  imageUrl?: string;
  organisationId: string;
  title: string;
  year?: string;
  type?: string;
  artiste?: string;
  album?: string;
  creation?: string;
  duration?: number;
  filePath?: string;
  audioUrl: string;
}