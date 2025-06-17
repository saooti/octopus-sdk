<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex align-items-center h6 mb-2">
      <button
        :id="'popover-comment' + comment.commentId"
        :class="isValidComment ? 'c-hand-auto' : 'text-danger'"
        class="btn-transparent me-2"
        >{{ username }}</button>
      <ClassicPopover
        :disable="isValidComment"
        :target="'popover-comment' + comment.commentId"
        :content="t('Comment waiting')"
      />
      <time :datetime="comment.date" class="me-2">
        {{ date }}
      </time>
      <div
        v-if="comment.abuse && editRight"
        class="d-flex align-items-center text-danger me-2"
      >
        <AlertIcon :size="16" class="me-1" />
        {{ t("abuse denounced", { nb: comment.abuse }) }}
      </div>
      <span v-if="editRight" :class="'status-' + comment.state" />
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <pre v-html="urlify(contentDisplay)" />
    <!-- eslint-enable -->
    <a
      v-if="commentTooLong"
      class="c-hand font-italic"
      @click="displayPreview = !displayPreview"
      >{{ readMore }}
    </a>
  </div>
</template>

<script setup lang="ts">
import AlertIcon from "vue-material-design-icons/Alert.vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import displayHelper from "../../../../helper/displayHelper";
import { CommentPodcast } from "@/stores/class/general/comment";
import ClassicPopover from "../../../misc/ClassicPopover.vue";
import { computed, onMounted, onUnmounted, Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  comment: { default: () => ({}), type: Object as () => CommentPodcast },
  editRight: { default: false, type: Boolean },
})

//Data 
const displayPreview = ref(true);
const date = ref("");
const dateInterval: Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);

 //Composables
const { t } = useI18n();

//Computed
const commentTooLong = computed(() => props.comment.content.length > 300);
const username = computed(() => props.comment.poster.userName);
const isValidComment = computed(() => "VALIDATED" === props.comment.state);
const readMore = computed(() => displayPreview.value ? t("Read more") : t("Read less"));
const contentDisplay = computed(() => {
  if (!displayPreview.value || !commentTooLong.value) {
    return props.comment.content;
  }
  return props.comment.content.substring(0, 300) + "...";
});

onMounted(()=>{
  defineDateFromNow();
  dateInterval.value = setInterval(() => {
    defineDateFromNow();
  }, 60000);
})
 
onUnmounted(()=>clearInterval(dateInterval.value as unknown as number))

//Methods
function urlify(text:string|undefined){
  return displayHelper.urlify(text);
}
function defineDateFromNow() {
  if (!props.comment.date) {
    date.value = "";
  }
  date.value = dayjs(props.comment.date).fromNow();
}
</script>
<style lang="scss">
@use "../../../../style/comments";
</style>
