import { Mix } from '../../stores/class/radio/mix';
import { PlaylistMedia } from '../../stores/class/radio/playlistMedia';
import { Podcast } from '../../stores/class/general/podcast';
import { Cartouchier } from '../../stores/class/cartouchier/cartouchier';
import { Media } from "../../stores/class/general/media";
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ActionRight, useRights } from '../composable/useRights';
import { state } from '../../stores/ParamSdkStore';
import { useAuthStore } from '../../stores/AuthStore';
import { storeToRefs } from 'pinia';
import { Emission } from '@/stores/class/general/emission';

type Action = 'create'|'edit'|'delete'|'any';

export interface PropsBase {
    /** Type of action to check */
    action: Action;
}

type NeverEntities = {
    podcast?: never;
    emission?: never;
    cartouchier?: never;
    mix?: never;
    playlistMedia?: never;
    media?: never;
    promoVideoFor?: never;
};

export interface PropsPodcast extends PropsBase, Omit<NeverEntities, 'podcast'> {
    podcast: Podcast|boolean;
}
export interface PropsEmission extends PropsBase, Omit<NeverEntities, 'emission'> {
    emission: Emission|boolean;
}
export interface PropsCartouchier extends PropsBase, Omit<NeverEntities, 'cartouchier'> {
    cartouchier: Cartouchier|boolean;
}
export interface PropsMix extends PropsBase, Omit<NeverEntities, 'mix'> {
    mix: Mix|boolean;
}
export interface PropsPlaylistMedia extends PropsBase, Omit<NeverEntities, 'playlistMedia'> {
    playlistMedia: PlaylistMedia|boolean;
}
export interface PropsMedia extends PropsBase, Omit<NeverEntities, 'media'> {
    media: Media|boolean;
}
export interface PropsPromoVideo extends PropsBase, Omit<NeverEntities, 'promoVideoFor'> {
    promoVideoFor: Podcast;
}

export type RightsProps = PropsPodcast|PropsEmission|PropsCartouchier|PropsMix|PropsPlaylistMedia|PropsMedia;

export const useRightsIndicator = (props: PropsPodcast|PropsEmission|PropsCartouchier|PropsMix|PropsPlaylistMedia|PropsMedia) => {
    const rights = useRights();
    const { t, te } = useI18n();
    const { isAuthenticated } = storeToRefs(useAuthStore());

    type Rights = ReturnType<typeof useRights>;
    type ActionSegment = 'Create'|'Edit'|'Delete';
    type EntitySegment = 'Podcast'|'Emission'|'Cartouchier'|'Mix'|'PlaylistMedia'|'Media'|'PromoVideo';
    type RightMethodKey = `get${ActionSegment}${EntitySegment}Right` & keyof Rights;
    type RightEntity = Podcast|Emission|Cartouchier|Mix|PlaylistMedia|Media|boolean|undefined;

    const actionSegmentMap: Record<Exclude<Action, 'any'>, ActionSegment> = {
        create: 'Create',
        edit: 'Edit',
        delete: 'Delete',
    };

    /**
     * Whether to display the indicator
     * It is not shown on podcastmaker, or for unidentified users
     */
    const displayIndicator = computed((): boolean => {
        return !state.generalParameters.podcastmaker && isAuthenticated.value;
    });

    /**
     * The entity on which rights are checked
     */
    const entity = computed((): [EntitySegment, RightEntity]|null => {
        let arg: RightEntity;
        let entitySegment: EntitySegment|undefined;

        if ('podcast' in props && props.podcast) {
            entitySegment = 'Podcast';
            arg = props.podcast;
        } else if ('emission' in props && props.emission) {
            entitySegment = 'Emission';
            arg = props.emission;
        } else if ('cartouchier' in props && props.cartouchier) {
            entitySegment = 'Cartouchier';
            arg = props.cartouchier;
        } else if ('mix' in props && props.mix) {
            entitySegment = 'Mix';
            arg = props.mix;
        } else if ('playlistMedia' in props && props.playlistMedia) {
            entitySegment = 'PlaylistMedia';
            arg = props.playlistMedia;
        } else if ('media' in props && props.media) {
            entitySegment = 'Media';
            arg = props.media;
        } else if ('promoVideoFor' in props && props.promoVideoFor) {
            entitySegment = 'PromoVideo';
            arg = props.promoVideoFor;
        } else {
            return null;
        }

        return [entitySegment, arg];
    });

    /**
     * The current rights for the given entity
     */
    const actionRight = computed((): ActionRight => {
        const data = entity.value;
        if (!data) {
            return ActionRight.DeniedNoRight;
        }

        const [entitySegment, arg] = data;

        if (props.action === 'any') {
            const checks: ActionSegment[] = typeof arg === 'object' && arg !== null
                ? ['Create', 'Edit', 'Delete']
                : ['Create'];

            let best = ActionRight.DeniedNoRight;
            for (const a of checks) {
                const key = `get${a}${entitySegment}Right` as RightMethodKey;
                const r = callRightMethod(key, arg);
                if (r === ActionRight.Allowed) {
                    return ActionRight.Allowed;
                }
                if (r === ActionRight.DeniedNotOwner) {
                    best = ActionRight.DeniedNotOwner;
                }
            }
            return best;
        }

        if ((props.action === 'edit' || props.action === 'delete') && typeof arg !== 'object') {
            return ActionRight.DeniedNoRight;
        }

        const methodName = `get${actionSegmentMap[props.action]}${entitySegment}Right` as RightMethodKey;
        return callRightMethod(methodName, arg);
    });

    /** Helper for calling the method on useRights */
    function callRightMethod(key: RightMethodKey, arg: unknown): ActionRight {
        return (rights[key] as (arg?: unknown) => ActionRight)(arg);
    }

    const hasAccess = computed((): boolean => {
        return actionRight.value === ActionRight.Allowed;
    });

    const message = computed((): string => {
        const entitySegment = entity.value?.[0];
        let key: string;
        let genericKey: string;
    
        switch (actionRight.value) {
        case ActionRight.Allowed:
            return '';

        case ActionRight.DeniedNotOwner:
            key = `RightsIndicator - ${entitySegment} - Not owner`;
            genericKey = 'Generic - Action disabled - Not owner';
            break;

        case ActionRight.DeniedInsufficientScope:
            key = `RightsIndicator - ${entitySegment} - Insufficient scope`;
            genericKey = 'RightsIndicator - Generic - Insufficient scope';
            break;

        case ActionRight.DeniedNoRight:
            key = `RightsIndicator - ${entitySegment} - Insufficient rights`;
            genericKey = 'RightsIndicator - Generic - Insufficient rights';
            break;

        default:
            return 'Cannot process rights';
        }

        if (te(key)) {
            return t(key);
        } else {
            return t(genericKey);
        }
    });

    return {
        displayIndicator,
        hasAccess,
        message
    }
};
