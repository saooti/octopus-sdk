<template>
  <div class="d-flex flex-column">
    <div
      v-if="isNotAnAnswerList && 0 !== totalCount"
      class="d-flex align-items-center mb-2"
    >
      <div class="text-secondary me-3">
        {{ t("Number comments", { nb: totalCount }) }}
      </div>
      <button
        id="sort-by-comments"
        class="btn btn-transparent d-flex align-items-center"
      >
        <SortVariantIcon :size="30" />
        <p class="ms-1">{{ t("Sort by") }}</p>
      </button>
      <ClassicPopover target="sort-by-comments" :only-click="true">
        <button
          v-for="sortOption in sortChoice"
          :key="sortOption.value"
          class="me-3 octopus-dropdown-item"
          :disabled="sortOption.value === sortType"
          @mousedown="changeSort(sortOption.value)"
          @keydown.enter="changeSort(sortOption.value)"
        >
          {{ sortOption.title }}
        </button>
      </ClassicPopover>
    </div>
    <div v-if="!loading && !error && 0 === totalCount" class="text-center">
      {{ t("No comments") }}
    </div>
    <div
      ref="scrollComponent"
      :class="isNotAnAnswerList ? 'scrolling-comments' : ''"
    >
      <CommentItem
        v-for="(c, indexCom) in comments"
        :id="'comItem' + c.commentId"
        :key="c.commentId"
        v-model:comment="comments[indexCom]"
        :podcast="podcast"
        :is-flat-list="isFlatList"
        :config="config"
        :organisation-id="organisationId"
        @delete-comment="deleteComment(c.commentId)"
      />
      <ClassicLoading
        :loading-text="loading ? t('Loading content ...') : undefined"
        :error-text="error ? t(`Comments loading error`) : undefined"
      />
      <button
        v-if="!isNotAnAnswerList && dfirst + dsize < totalCount"
        class="btn share-btn mx-2"
        :title="t('See more')"
      >
        <PlusIcon />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import SortVariantIcon from "vue-material-design-icons/SortVariant.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import {useErrorHandler} from "../../composable/useErrorHandler";
import classicApi from "../../../api/classicApi";
import { computed, defineAsyncComponent, onMounted, onUnmounted, Ref, ref, useTemplateRef, watch } from "vue";
import { AxiosError } from "axios";
import { CommentPodcast } from "@/stores/class/general/comment";
import { Podcast } from "@/stores/class/general/podcast";
import {
  CommentMessage,
  CommentsConfig,
} from "@/stores/class/config/commentsConfig";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";
/* eslint-disable */
const CommentItem: any = defineAsyncComponent(() => import('./item/CommentItem.vue'));
/* eslint-enable */
const ClassicPopover = defineAsyncComponent(
  () => import("../../misc/ClassicPopover.vue"),
);

//Props 
const props = defineProps({
  size: { default: 10, type: Number },
  podcast: { default: undefined, type: Object as () => Podcast },
  reload: { default: false, type: Boolean },
  answerToComment: { default: undefined, type: Number },
  isFlatList: { default: false, type: Boolean },
  stateFilter: { default: "", type: String },
  organisationId: { default: undefined, type: String },
  nbComments: { default: 0, type: Number },
  config: { default: undefined, type: Object as () => CommentsConfig },
  eventToHandle: { default: undefined, type: Object as () => CommentMessage },
})

//Emits
const emit = defineEmits(["update:nbComments", "commentDeleted"]);

//Data 
const loading = ref(false);
const error = ref(false);
const dfirst = ref(0);
const dsize = ref(props.size);
const totalCount = ref(0);
const sortType = ref("DATE_DESC");
const comments: Ref<Array<CommentPodcast>> = ref([]);
const scrollableSection: Ref<HTMLElement | undefined> = ref(undefined);
const scrollComponentRef = useTemplateRef('scrollComponent');

//Composables
const { t } = useI18n();
const {handle403} = useErrorHandler();

//Computed
const changed = computed(() => `${props.size}|${props.reload}|${dsize.value}|${props.stateFilter}|${props.podcast?.podcastId}|${props.organisationId}`);
const isNotAnAnswerList = computed(() =>  undefined === props.answerToComment);
const sortChoice = computed(() =>{
  return [
    { title: t("The most recent"), value: "DATE_DESC" },
    { title: t("Top comments"), value: "LIKE_DESC" },
  ];
});

//Watch
watch(totalCount, () => {emit("update:nbComments", totalCount.value)});
watch(changed, () => {fetchContent(true);});
watch(()=>props.eventToHandle, async () => {
  if (!props.eventToHandle) {
    return;
  }
  if (props.answerToComment === props.eventToHandle.comment.answerTo) {
    switch (props.eventToHandle.type) {
      case "CREATE":
        createComment(props.eventToHandle.comment);
        break;
      case "UPDATE":
        updateComment(props.eventToHandle.comment);
        break;
      case "DELETE":
        deleteComment(props.eventToHandle.comment.commentId);
        break;
      default:
        break;
    }
    return;
  }
  if (undefined !== props.eventToHandle.comment.answerTo) {
    const comItem = scrollComponentRef?.value?.querySelector('#comItem' + props.eventToHandle.comment.answerTo) as InstanceType<typeof CommentItem>;
    comItem?.receiveEvent(props.eventToHandle);
  }
}, {deep: true});


onMounted(()=>{
  fetchContent(true);
  if (isNotAnAnswerList.value) {
    scrollableSection.value = scrollComponentRef?.value as HTMLElement;
    scrollableSection.value.addEventListener("scroll", handleScroll);
  }
})

onUnmounted(()=>{
  if (isNotAnAnswerList.value) {
    scrollableSection.value?.removeEventListener("scroll", handleScroll);
  }
})


//Methods
function changeSort(sortTypeUpdate: string) {
  sortType.value = sortTypeUpdate;
  fetchContent(true);
}
function handleScroll() {
  if (
    scrollableSection.value &&
    totalCount.value > comments.value.length &&
    scrollableSection.value.scrollTop +
      scrollableSection.value.clientHeight >=
      scrollableSection.value.scrollHeight
  ) {
    fetchContent(false);
  }
}
function findCommentInCommentsLoaded(commentId: number) {
  return comments.value.findIndex(
    (element: CommentPodcast) => element.commentId === commentId,
  );
}
function createComment(comment: CommentPodcast) {
  comments.value.unshift(comment);
  totalCount.value += 1;
}
function updateComment(comment: CommentPodcast) {
  const commentIndex = findCommentInCommentsLoaded(comment.commentId);
  if (-1 !== commentIndex) {
    comments.value.splice(commentIndex, 1, comment);
  }
}
function deleteComment(commentIdToDelete: number) {
  const commentIndex = findCommentInCommentsLoaded(commentIdToDelete);
  if (-1 !== commentIndex) {
    comments.value.splice(commentIndex, 1);
    totalCount.value -= 1;
    emit("commentDeleted", commentIdToDelete);
  }
}
async function fetchContent(reset: boolean): Promise<void> {
  if (loading.value) {
    return;
  }
  loading.value = true;
  if (reset) {
    dfirst.value = 0;
    comments.value.length = 0;
  }
  const param = {
    first: dfirst.value,
    size: dsize.value,
    podcastId: props.podcast?.podcastId,
    sort: sortType.value,
    answerTo: props.answerToComment,
    hideAnswers: !props.isFlatList,
    state: props.stateFilter.length ? props.stateFilter : undefined,
    organisationId: props.organisationId,
  };
  try {
    const data = await classicApi.fetchData<
      ListClassicReturn<CommentPodcast>
    >({
      api: 2,
      path: "comment/list",
      parameters: param,
    });
    if (reset) {
      comments.value.length = 0;
    }
    comments.value.push(...data.result);
    totalCount.value = data.count;
    dfirst.value += dsize.value;
    loading.value = false;
  } catch (errorWs) {
    handle403(errorWs as AxiosError);
    error.value = true;
  }
}
</script>
<style lang="scss">
.octopus-app {
  .scrolling-comments {
    max-height: 715px;
    overflow-y: auto;
  }
}
</style>
