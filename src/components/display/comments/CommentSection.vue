<template>
  <section v-show="displayCommentSection" class="module-box">
    <div class="d-flex align-items-center">
      <component 
        :is="inStudio? 'div':'h3'" 
        :class="inStudio? 'm-1 fw-bold':'mb-0 me-2'">{{ t("Podcast's comments") }}</component>
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
      :class="inStudio? 'mt-2':'mt-5'"
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
import { computed, defineAsyncComponent, onBeforeMount, ref, Ref, watch } from "vue";
import { useCommentStore } from "../../../stores/CommentStore";
import { useAuthStore } from "../../../stores/AuthStore";
import {
  CommentMessage,
  CommentsConfig,
} from "@/stores/class/config/commentsConfig";
import { CommentPodcast } from "@/stores/class/general/comment";
import { useI18n } from "vue-i18n";
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
const eventActive = computed(() =>  undefined !== props.podcast?.conferenceId);


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
  if (!commentStore.commentInitialized) {
    await commentStore.initialize();
  }
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
