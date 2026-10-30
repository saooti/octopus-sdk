<template>
    <section v-show="displayCommentSection" class="module-box">
        <div class="d-flex align-items-center">
            <div
                v-if="eventActive"
                class="status-indicator me-2 d-flex align-items-center justify-content-center"
                :class="statusIndicator.class"
                :title="statusIndicator.title"
            >
                <component
                    :is="statusIndicator.icon"
                    :size="20"
                    aria-hidden="true"
                />
            </div>
            <component 
                :is="inStudio? 'div':'h3'" 
                :class="inStudio? 'm-1 fw-bold':'mb-0 me-2'"
                class="d-flex"
            >
                {{ t("Podcast's comments") }}
            </component>
            <button
                :title="t('Refresh')"
                class="btn btn-transparent"
                @click="reload = !reload"
            >
                <RefreshIcon />
            </button>
        </div>
        <CommentInput
            v-if="canPostComment"
            :podcast="podcast"
            @new-comment="newComment"
        />
        <CommentList
            v-model:nb-comments="nbComments"
            :class="inStudio? 'mt-2':'mt-3'"
            :podcast="podcast"
            :is-flat-list="inStudio"
            :reload="reload"
            :config="configPodcast"
            :event-to-handle="eventToHandle"
            :state-filter="stateFilter"
        />
    </section>
</template>

<script setup lang="ts">
import RefreshIcon from "vue-material-design-icons/Refresh.vue";
import { Podcast } from "@/stores/class/general/podcast";
import { type Component, computed, defineAsyncComponent, onBeforeMount, ref, Ref, watch } from "vue";
import { useCommentStore, WssStatus } from "../../../stores/CommentStore";
import { useAuthStore } from "../../../stores/AuthStore";
import {
    CommentMessage,
    CommentsConfig,
} from "@/stores/class/config/commentsConfig";
import { CommentPodcast } from "@/stores/class/general/comment";
import { useI18n } from "vue-i18n";

import ConnectedIcon from "vue-material-design-icons/Check.vue";
import DisconnectedIcon from "vue-material-design-icons/Close.vue";
import ConnectingIcon from "vue-material-design-icons/DotsHorizontal.vue";

const CommentList = defineAsyncComponent(() => import("./CommentList.vue"));
const CommentInput = defineAsyncComponent(() => import("./CommentInput.vue"));

//Props 
const props = defineProps({
    podcast: { default: undefined, type: Object as () => Podcast },
    inStudio: { default: false, type: Boolean },
    stateFilter: { default: "", type: String },
})

//Emits
const emit = defineEmits(["commentReceived"]);

//Data 
const reload = ref(false);
const configPodcast: Ref<CommentsConfig | undefined> = ref(undefined);
const nbComments = ref(0);
const eventToHandle: Ref<CommentMessage | undefined> = ref(undefined);
const wasConnected = ref(false);

//Composables
const { t } = useI18n();
const commentStore = useCommentStore();
const authStore = useAuthStore();


//Computed
const displayCommentSection = computed(() => canPostComment.value || nbComments.value > 0);
const canPostComment = computed(() => {
    return commentStore.getCanPostComment(
        configPodcast.value,
        props.podcast,
        undefined !== authStore.authOrgaId,
    );
});
const eventActive = computed((): boolean => undefined !== props.podcast?.conferenceId);

interface StatusIndicator {
    title: string;
    class: string;
    icon: Component|null;
}

const statusIndicator = computed((): StatusIndicator => {
    switch(commentStore.commentConnectionStatus) {
    case WssStatus.CONNECTED:
        return {
            class: 'status-indicator-connected',
            title: t('CommentSection - Status Indicator - Connected'),
            icon: ConnectedIcon
        };
    case WssStatus.DISCONNECTED:
        return {
            class: 'status-indicator-disconnected',
            title: t('CommentSection - Status Indicator - Disconnected'),
            icon: DisconnectedIcon
        };
    case WssStatus.CONNECTING:
        return {
            class: 'status-indicator-connecting',
            title: t('CommentSection - Status Indicator - Connecting'),
            icon: ConnectingIcon
        };
    default:
        return {
            class: 'status-indicator-inactive',
            title: t('CommentSection - Status Indicator - Inactive'),
            icon: null
        };
    }
});

//Watch
watch(()=>commentStore.commentEventToHandle, async () => {
    if (
        !commentStore.commentEventToHandle.length ||
        commentStore.commentPodcastId !== props.podcast?.podcastId
    ){
        return;
    }
    eventToHandle.value = commentStore.commentEventToHandle[0];
    commentStore.commentEventHandled();
    emit('commentReceived');
}, {deep: true});
// Reload comments after a reconnection, as events sent while disconnected are lost
watch(()=>commentStore.commentConnectionStatus, (status) => {
    if (WssStatus.CONNECTED !== status) {
        return;
    }
    if (wasConnected.value) {
        reload.value = !reload.value;
    }
    wasConnected.value = true;
});


onBeforeMount(()=>fetchPodcastCommentsConfig())


//Methods
async function fetchPodcastCommentsConfig() {
    if (!props.podcast?.podcastId) {
        return;
    }
    configPodcast.value = await commentStore.getCommentsConfig(props.podcast);
    if (!eventActive.value) {
        return;
    }
    initLiveComments();
}
async function initLiveComments(): Promise<void> {
    if (!props.podcast?.podcastId || !props.podcast?.organisation.id) {
        return;
    }
    await commentStore.initialize();
    await commentStore.initComments(
        props.podcast.podcastId,
        props.podcast.organisation.id,
    );
}
function newComment(comment: CommentPodcast) {
    if (eventActive.value) {
        return;
    }
    eventToHandle.value = { type: "CREATE", comment: comment };
}
</script>

<style scoped lang="scss">
.status-indicator {
  --size: 24px;
  width: var(--size);
  height: var(--size);
  border-radius: 100%;

  &.status-indicator-connected {
    background-color: rgb(140, 255, 160);
  }
  &.status-indicator-connecting {
    background-color: rgb(255, 255, 140);
  }
  &.status-indicator-disconnected {
    background-color: rgb(255, 120, 120);
  }
  &.status-indicator-inactive {
    background-color: rgb(200, 200, 200);
  }
}
</style>
