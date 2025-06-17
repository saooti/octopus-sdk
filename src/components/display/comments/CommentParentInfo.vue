<template>
  <div class="mt-2">
    <ClassicLoading
      :loading-text="loading ? t('Loading content ...') : undefined"
    />
    <CommentBasicView
      v-if="!loading && comment"
      :comment="comment"
      :edit-right="editRight"
    />
  </div>
</template>

<script setup lang="ts">
import classicApi from "../../../api/classicApi";
import CommentBasicView from "./item/CommentBasicView.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { CommentPodcast } from "@/stores/class/general/comment";
import { onBeforeMount, Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  commentId: { default: undefined, type: Number },
  editRight: { default: false, type: Boolean },
})

//Data 
const loading = ref(true);
const comment: Ref<CommentPodcast | undefined> = ref(undefined);

//Composables
const { t } = useI18n();
  

onBeforeMount(()=>fetchComment())

//Methods
async function fetchComment(): Promise<void> {
  if (props.commentId) {
    comment.value = await classicApi.fetchData<CommentPodcast>({
      api: 2,
      path: `comment/${props.commentId}`,
    });
  }
  loading.value = false;
}
</script>
