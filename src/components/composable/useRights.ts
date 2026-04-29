import { useAuthStore } from "../../stores/AuthStore";
import type { Emission } from "../../stores/class/general/emission";
import type { Podcast } from "../../stores/class/general/podcast";

type Role =
    'ADMIN'|'ORGANISATION'|
    'PRODUCTION'|'RESTRICTED_PRODUCTION'|'PODCAST_CRUD'|'PODCAST_VALIDATION'|
    'PLAYLISTS'|'RESTRICTED_ANIMATION';

export enum EditRight {
    None,          // User cannot edit
    Restricted,    // User cannot edit because element is used elsewhere
    Full           // User can edit
}

/**
 * Composable to manage rights.
 * Based on AuthStore, but converts roles to easily usable tests for various
 * actions.
 */
export const useRights = () => {
    const authStore = useAuthStore();

    function roleContainsAny(...roles: Role[]): boolean {
	    return (authStore.authRole as Role[]).findIndex((r: Role) => roles.includes(r)) > -1;
    }

    // Creation is limited by roles
    function canCreateEmission(): boolean {
	    return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION');
    }

    function canEditEmission(emission: Emission): boolean {
        if (
            // Can edit new emissions
            (!emission.emissionId && canCreateEmission()) ||
            // Can edit when with sufficient rights
		    roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')
        ) {
            return true;
        }

	    // Can only edit if has created the emission
	    return (roleContainsAny('RESTRICTED_PRODUCTION') && emission.createdByUserId === authStore.authProfile?.userId);
    }

    function canDeleteEmission(): boolean {
	    // In case of restricted production, it will only delete podcasts
	    // created by user, and delete the emission only if empty afterwards
	    return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION');
    }

    function canEditCommentsConfigEmission(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION');
    }

    function canCreatePodcast(): boolean {
        // All roles that can create podcasts
        return roleContainsAny(
            'ADMIN',
            'ORGANISATION',
            'PRODUCTION',
            'PODCAST_CRUD',
            'RESTRICTED_PRODUCTION',
            'RESTRICTED_ANIMATION'
        );
    }

    function canDuplicatePodcast(): boolean {
        // Same as creation but notably without PODCAST_CRUD and
        // RESTRICTED_ANIMATION
        return roleContainsAny(
            'ADMIN',
            'ORGANISATION',
            'PRODUCTION',
            'RESTRICTED_PRODUCTION',
        );
    }

    function canEditPodcast(podcast: Podcast): boolean {
        // Full rights users can edit any podcast
        if (roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')) {
            return true;
        }

        // RESTRICTED users can only edit their own podcasts
        if (roleContainsAny('RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION')) {
            return podcast.createdByUserId === authStore.authProfile?.userId;
        }

        // PODCAST_CRUD can only edit their own non-valid podcasts
        if (roleContainsAny('PODCAST_CRUD')) {
            return podcast.valid === false &&
                   podcast.publisher?.userId === authStore.authProfile?.userId;
        }

        return false;
    }

    function canDeletePodcast(podcast: Podcast): boolean {
        // Same permissions as editing
        return canEditPodcast(podcast);
    }

    function canValidatePodcast(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'PODCAST_VALIDATION');
    }

    function canEditCommentsConfigPodcast(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION');
    }

    function canCreatePlaylist(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PLAYLISTS');
    }

    function canEditPlaylist(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PLAYLISTS');
    }

    function canDeletePlaylist(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PLAYLISTS');
    }

    function canCreateParticipant(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION');
    }

    async function getParticipantEditRight(participantId: number|undefined): Promise<EditRight> {
        // New participants can be edited, and also with sufficient rights
	    if(!participantId || roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION')) {
	        return EditRight.Full;
	    } else {
	        return EditRight.None;
	    }
    }

    async function canEditParticipant(participantId: number|undefined): Promise<boolean> {
        const editRight = await getParticipantEditRight(participantId);
        return editRight === EditRight.Full;
    }


    async function canDeleteParticipant(participantId: number|undefined): Promise<boolean> {
        const editRight = await getParticipantEditRight(participantId);
        return editRight === EditRight.Full;
    }

    function canEditCodeInsertPlayer(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION');
    }

    function canEditTranscript(podcast: Podcast): boolean {
        if(roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')) {
            return true;
        }

        if (roleContainsAny('RESTRICTED_PRODUCTION', 'PODCAST_CRUD')) {
            return podcast.createdByUserId === authStore.authProfile?.userId;
        }

        return false;
    }

    function canEditTranscriptVisibility(podcast: Podcast): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION');
    }

    function canEditTranslation(podcast: Podcast): boolean {
        return canEditTranscript(podcast);
    }

    function canSeeHistory(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION');
    }

    function isRestrictedProduction(): boolean {
        return roleContainsAny('RESTRICTED_PRODUCTION') && !roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION');
    }

    return {
        // Emissions
        canCreateEmission,
        canEditEmission,
        canDeleteEmission,
        canEditCommentsConfigEmission,

        // Podcasts
        canCreatePodcast,
        canDuplicatePodcast,
        canEditPodcast,
        canDeletePodcast,
        canValidatePodcast,
        canEditCommentsConfigPodcast,

        // Playlists
        canCreatePlaylist,
        canEditPlaylist,
        canDeletePlaylist,

        // Participants
        canCreateParticipant,
        getParticipantEditRight,
        canEditParticipant,
        canDeleteParticipant,

        // Other
        canEditCodeInsertPlayer,
        canEditTranscript,
        canEditTranslation,
        canEditTranscriptVisibility,
        canSeeHistory,
        isRestrictedProduction
    }
}
