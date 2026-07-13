/**
 * Definition for background music
 * Only one of armbPlaylistName, mediaPlaylistId, and mixId can be defined.
 */
export interface Ambiance {
    /** Name of known playlists to play */
    armbPlaylistName?: string;
    /** ID of media playlist to play */
    mediaPlaylistId?: number;
    /** ID of mix to play */
    mixId?: number;
    /** Frequency of playing autopromos (in number of songs) */
    autopromoRatio?: number;
    /** ID of the bac/playlist media from which to take autopromos */
    autopromoBacId?: number;
}

export interface Canal {
    /** ID of the canal */
    id: number;
    /** ID of the organisation this canal belongs to */
    organisationId: string;
    name: string;
    /** @deprecated, see #14467, use defaultAmbiance instead */
    defaultPlaylist: string;
    /** Default ambiance when nothing is playing on the canal */
    defaultAmbiance: Ambiance;
    url: string;
    imageUrl: string;
    description: string;
    advertisingTag: null | string;
}
