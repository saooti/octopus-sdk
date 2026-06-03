import { Mix } from "../../stores/class/radio/mix";
import { useAuthStore } from "../../stores/AuthStore";
import type { Emission } from "../../stores/class/general/emission";
import type { Podcast } from "../../stores/class/general/podcast";
import { PlaylistMedia } from "../../stores/class/radio/playlistMedia";
import { Cartouchier } from "../../stores/class/cartouchier/cartouchier";
import { Media } from "../../stores/class/general/media";
import { Conference } from "../../stores/class/conference/conference";

type Role =
    'ADMIN'|'ORGANISATION'|
    'PRODUCTION'|'RESTRICTED_PRODUCTION'|'PODCAST_CRUD'|'PODCAST_VALIDATION'|
    'PLAYLISTS'|'ANIMATION'|'RESTRICTED_ANIMATION'|'RADIO'|'LIVE';

export enum ActionRight {
    Allowed = 'allowed',         // User can perform the action
    DeniedNoRight = 'no_right',  // User lacks the required role
    DeniedNotOwner = 'not_owner' // User has a restricted role but does not own the resource
}

// Constraint type for the object passed to deriveCanFunctions.
// any[] is intentional: it allows functions with any parameter signature to satisfy
// the constraint while still enforcing that the return type is ActionRight.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SyncRightFns = Record<string, (...args: any[]) => ActionRight>;

// Maps every key of the form `get${A}Right` to `can${A}`, preserving the parameter
// types of the original function but changing the return type to boolean.
// Keys that do not match the naming convention are dropped (mapped to never).
type CanFns<T extends SyncRightFns> = {
    [K in keyof T as K extends `get${infer A}Right` ? `can${A}` : never]:
        T[K] extends (...args: infer P) => ActionRight ? (...args: P) => boolean : never;
};

/**
 * Generates boolean shortcut functions from a set of `getRightXxx` functions.
 *
 * Convention: `get${Action}Right(…args) → ActionRight`
 *         becomes `can${Action}(…args) → boolean`
 *
 * The generated function returns true when the underlying getRightXxx returns
 * ActionRight.Allowed, and false otherwise. This means callers that only need
 * a simple yes/no answer can use canXxx(), while callers that need the specific
 * denial reason (DeniedNoRight vs DeniedNotOwner) can call getRightXxx() directly.
 *
 * Only synchronous functions should be passed here; async rights functions must
 * be wrapped manually.
 */
function deriveCanFunctions<T extends SyncRightFns>(fns: T): CanFns<T> {
    const result = {} as CanFns<T>;
    for (const key of Object.keys(fns) as (keyof T & string)[]) {
        if (key.startsWith('get') && key.endsWith('Right')) {
            const canKey = `can${key.slice(3, -5)}` as keyof CanFns<T>;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result as any)[canKey] = (...args: unknown[]) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (fns as any)[key](...args) === ActionRight.Allowed;
        }
    }
    return result;
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

    // Emission rights
    function getCreateEmissionRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditEmissionRight(emission: Emission): ActionRight {
        if (
            (!emission.emissionId && getCreateEmissionRight() === ActionRight.Allowed) ||
            roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')
        ) {
            return ActionRight.Allowed;
        }
        if (roleContainsAny('RESTRICTED_PRODUCTION')) {
            return emission.createdByUserId === authStore.authProfile?.userId
                ? ActionRight.Allowed
                : ActionRight.DeniedNotOwner;
        }
        return ActionRight.DeniedNoRight;
    }

    function getDeleteEmissionRight(): ActionRight {
        // In case of restricted production, it will only delete podcasts
        // created by user, and delete the emission only if empty afterwards
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditCommentsConfigEmissionRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    // Podcast rights
    function getCreatePodcastRight(): ActionRight {
        return roleContainsAny(
            'ADMIN', 'ORGANISATION', 'PRODUCTION', 'PODCAST_CRUD',
            'RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'
        )
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getDuplicatePodcastRight(): ActionRight {
        // Same as creation but notably without PODCAST_CRUD and RESTRICTED_ANIMATION
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditPodcastRight(podcast: Podcast): ActionRight {
        if (roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')) {
            return ActionRight.Allowed;
        }
        if (roleContainsAny('RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION')) {
            return podcast.createdByUserId === authStore.authProfile?.userId
                ? ActionRight.Allowed
                : ActionRight.DeniedNotOwner;
        }
        if (roleContainsAny('PODCAST_CRUD')) {
            return podcast.valid === false && podcast.publisher?.userId === authStore.authProfile?.userId
                ? ActionRight.Allowed
                : ActionRight.DeniedNotOwner;
        }
        return ActionRight.DeniedNoRight;
    }

    function getDeletePodcastRight(podcast: Podcast): ActionRight {
        return getEditPodcastRight(podcast);
    }

    function getValidatePodcastRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'PODCAST_VALIDATION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditCommentsConfigPodcastRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    // Playlist rights
    function getCreatePlaylistRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PLAYLISTS')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditPlaylistRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PLAYLISTS')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getDeletePlaylistRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PLAYLISTS')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    // Participant rights
    function getCreateParticipantRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    async function getParticipantEditRight(participantId: number|undefined): Promise<ActionRight> {
        // New participants can be edited, and also with sufficient rights
        return (!participantId || roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION'))
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    async function canEditParticipant(participantId: number|undefined): Promise<boolean> {
        return await getParticipantEditRight(participantId) === ActionRight.Allowed;
    }

    async function canDeleteParticipant(participantId: number|undefined): Promise<boolean> {
        return await getParticipantEditRight(participantId) === ActionRight.Allowed;
    }

    // Aggregator rights
    function getCreateAggregatorRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditAggregatorRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getDeleteAggregatorRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    // Cartouchier rights
    function getCreateCartouchierRight(): ActionRight {
        return roleContainsAny(
            'ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION',
            'PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'
        )
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditCartouchierRight(element: Cartouchier): ActionRight {
        if (roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION')) {
            return ActionRight.Allowed;
        }
        if (roleContainsAny('RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION', 'PODCAST_CRUD')) {
            return element.ownerId !== undefined && element.ownerId !== null && element.ownerId === authStore.authProfile?.userId
                ? ActionRight.Allowed
                : ActionRight.DeniedNotOwner;
        }
        return ActionRight.DeniedNoRight;
    }

    function getDeleteCartouchierRight(element: Cartouchier): ActionRight {
        return getEditCartouchierRight(element);
    }

    // PlaylistMedia rights
    function getCreatePlaylistMediaRight(): ActionRight {
        return roleContainsAny(
            'ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION',
            'PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'
        )
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditPlaylistMediaRight(element: PlaylistMedia): ActionRight {
        if (roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION')) {
            return ActionRight.Allowed;
        }
        if (roleContainsAny('RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION', 'PODCAST_CRUD')) {
            return element.ownerId !== undefined && element.ownerId !== null && element.ownerId === authStore.authProfile?.userId
                ? ActionRight.Allowed
                : ActionRight.DeniedNotOwner;
        }
        return ActionRight.DeniedNoRight;
    }

    function getDeletePlaylistMediaRight(element: PlaylistMedia): ActionRight {
        return getEditPlaylistMediaRight(element);
    }

    // Media rights
    function getCreateMediaRight(): ActionRight {
        return roleContainsAny(
            'ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION',
            'PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'
        )
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditMediaRight(element: Media): ActionRight {
        if (roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION')) {
            return ActionRight.Allowed;
        }
        if (roleContainsAny('RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION', 'PODCAST_CRUD')) {
            return element.ownerId !== undefined && element.ownerId !== null && element.ownerId === authStore.authProfile?.userId
                ? ActionRight.Allowed
                : ActionRight.DeniedNotOwner;
        }
        return ActionRight.DeniedNoRight;
    }

    function getDeleteMediaRight(element: Media): ActionRight {
        return getEditMediaRight(element);
    }

    // Mix rights
    function getCreateMixRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'RADIO')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditMixRight(_element: Mix): ActionRight {
        return getCreateMixRight();
    }

    function getDeleteMixRight(element: Mix): ActionRight {
        return getEditMixRight(element);
    }

    // Other action rights
    function getEditCodeInsertPlayerRight(): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditTranscriptRight(podcast: Podcast): ActionRight {
        if (roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')) {
            return ActionRight.Allowed;
        }
        if (roleContainsAny('RESTRICTED_PRODUCTION', 'PODCAST_CRUD')) {
            return podcast.createdByUserId === authStore.authProfile?.userId
                ? ActionRight.Allowed
                : ActionRight.DeniedNotOwner;
        }
        return ActionRight.DeniedNoRight;
    }

    function getEditTranscriptVisibilityRight(_podcast: Podcast): ActionRight {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION')
            ? ActionRight.Allowed
            : ActionRight.DeniedNoRight;
    }

    function getEditTranslationRight(podcast: Podcast): ActionRight {
        return getEditTranscriptRight(podcast);
    }

    // Live
    function getAccessRecordingRight(conference: Conference, isLive: boolean): ActionRight {
        if (isLive) {
            return roleContainsAny('LIVE') ? ActionRight.Allowed : ActionRight.DeniedNoRight;
        } else {
            return roleContainsAny('ANIMATION', 'RESTRICTED_ANIMATION') ? ActionRight.Allowed : ActionRight.DeniedNoRight;
        }
    }

    // View/utility checks — outside the action pattern
    function canSeeHistory(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION');
    }

    function isRestrictedProduction(): boolean {
        return roleContainsAny('RESTRICTED_PRODUCTION') && !roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION');
    }

    const rightFns = {
        // Emissions
        getCreateEmissionRight,
        getEditEmissionRight,
        getDeleteEmissionRight,
        getEditCommentsConfigEmissionRight,
        // Podcasts
        getCreatePodcastRight,
        getDuplicatePodcastRight,
        getEditPodcastRight,
        getDeletePodcastRight,
        getValidatePodcastRight,
        getEditCommentsConfigPodcastRight,
        // Playlists
        getCreatePlaylistRight,
        getEditPlaylistRight,
        getDeletePlaylistRight,
        // Participants (sync only)
        getCreateParticipantRight,
        // Aggregators
        getCreateAggregatorRight,
        getEditAggregatorRight,
        getDeleteAggregatorRight,
        // Cartouchier
        getCreateCartouchierRight,
        getEditCartouchierRight,
        getDeleteCartouchierRight,
        // PlaylistMedia
        getCreatePlaylistMediaRight,
        getEditPlaylistMediaRight,
        getDeletePlaylistMediaRight,
        // Media
        getCreateMediaRight,
        getEditMediaRight,
        getDeleteMediaRight,
        // Mix
        getCreateMixRight,
        getEditMixRight,
        getDeleteMixRight,
        // Other
        getAccessRecordingRight,
        getEditCodeInsertPlayerRight,
        getEditTranscriptRight,
        getEditTranscriptVisibilityRight,
        getEditTranslationRight,
    };

    const canFns = deriveCanFunctions(rightFns);

    function canReadRSSRules(): boolean {
        return roleContainsAny('ADMIN', 'ORGANISATION', 'PRODUCTION');
    }

    function canEditRSSRules(): boolean {
        return canReadRSSRules();
    }

    return {
        ...rightFns,
        ...canFns,
        // Async participant (kept manually — async functions excluded from deriveCanFunctions)
        getParticipantEditRight,
        canEditParticipant,
        canDeleteParticipant,
        // RSS Rules (manual — outside the getRightXxx convention)
        canReadRSSRules,
        canEditRSSRules,
        // View/utility checks
        canSeeHistory,
        isRestrictedProduction,
    };
};
