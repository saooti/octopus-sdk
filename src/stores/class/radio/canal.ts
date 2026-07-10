export interface Ambiance {
    armbPlaylistName?: string;
    mediaPlaylistId?: number;
    mixId?: number;
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
