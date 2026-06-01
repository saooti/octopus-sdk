<template>
    <ClassicAlert
        v-if="!hasAccess && text"
        type="info"
    >
        <template #icon>
            <LockIcon
                aria-hidden="true"
                fill-color="var(--octopus-primary)"
            />
        </template>
        {{ message }}
    </ClassicAlert>
</template>

<script setup lang="ts">
import { Mix } from '../../stores/class/radio/mix';
import { PlaylistMedia } from '../../stores/class/radio/playlistMedia';
import { Podcast } from '../../stores/class/general/podcast';
import { Cartouchier } from '../../stores/class/cartouchier/cartouchier';
import { Media } from "../../stores/class/general/media";
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LockIcon from 'vue-material-design-icons/Lock.vue';
import { ActionRight, useRights } from '../composable/useRights';
import ClassicAlert from '../misc/ClassicAlert.vue';

const rights = useRights();
const { t, te } = useI18n();

type Action = 'create'|'edit'|'delete'|'any';

interface PropsBase {
    /** Type of action to check */
    action: Action;
    /** Display reason as text instead of only tooltip */
    text?: boolean;
}

type NeverEntities = {
    podcast?: never;
    cartouchier?: never;
    mix?: never;
    playlistMedia?: never;
    media?: never;
};

interface PropsPodcast extends PropsBase, Omit<NeverEntities, 'podcast'> {
    podcast: Podcast|boolean;
}
interface PropsCartouchier extends PropsBase, Omit<NeverEntities, 'cartouchier'> {
    cartouchier: Cartouchier|boolean;
}
interface PropsMix extends PropsBase, Omit<NeverEntities, 'mix'> {
    mix: Mix|boolean;
}
interface PropsPlaylistMedia extends PropsBase, Omit<NeverEntities, 'playlistMedia'> {
    playlistMedia: PlaylistMedia|boolean;
}
interface PropsMedia extends PropsBase, Omit<NeverEntities, 'media'> {
    media: Media|boolean;
}

const props = defineProps<PropsPodcast|PropsCartouchier|PropsMix|PropsPlaylistMedia|PropsMedia>();

type Rights = ReturnType<typeof useRights>;
type ActionSegment = 'Create'|'Edit'|'Delete';
type EntitySegment = 'Podcast'|'Cartouchier'|'Mix'|'PlaylistMedia'|'Media';
type RightMethodKey = `get${ActionSegment}${EntitySegment}Right` & keyof Rights;
type RightEntity = Podcast|Cartouchier|Mix|PlaylistMedia|Media|boolean|undefined;

const actionSegmentMap: Record<Exclude<Action, 'any'>, ActionSegment> = {
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
};

const entity = computed((): [EntitySegment, RightEntity]|null => {
    let arg: RightEntity;
    let entitySegment: EntitySegment|undefined;

    if ('podcast' in props && props.podcast) {
        entitySegment = 'Podcast';
        arg = props.podcast;
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
    } else {
        return null;
    }

    return [entitySegment, arg];
});

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

    case ActionRight.DeniedNoRight:
        return 'insufficient rights';

    default:
        return 'Cannot process rights';
    }

    if (te(key)) {
        return t(key);
    } else {
        return t(genericKey);
    }
});
</script>
