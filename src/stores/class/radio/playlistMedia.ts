import { Media } from "../general/media";

export interface PlaylistMedia {
	playlistId: number;
	color: string;
	description: string;
	name: string;
	organisationId:string;
	medias: Array<Media>
}