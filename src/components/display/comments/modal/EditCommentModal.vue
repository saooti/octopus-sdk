<template>
  <ClassicModal
    id-modal="edit-comment-modal"
    :title-modal="t('Edit comment')"
    @close="closePopup"
  >
    <template #body>
      <ClassicLoading
        :loading-text="inProcessing ? t('Send in progress') : undefined"
        :error-text="errorUpdate ? t(`An error occurred`) : undefined"
      />
      <template v-if="!inProcessing && !errorUpdate">
        <ClassicInputText
          v-model:text-init="commentText"
          v-model:error-variable="errorCommentText"
          input-id="comment-textarea"
          :label="t('Comment')"
          :max-length="Constants.MAX_COMMENT"
          :error-text="t('Please provide a comment')"
          :is-textarea="true"
          :is-emoji-picker="true"
          popover-relative-class="octopus-modal"
          :focus="true"
        />
        <ClassicSelect
          v-if="editRight"
          v-model:text-init="commentState"
          id-select="comment-state-select"
          :label="t('Status')"
          :display-label="true"
          :options="[
            { title: t('pending'), value: 'PENDING' },
            { title: t('Validated'), value: 'VALIDATED' },
            { title: t('Invalid'), value: 'NOT_VALID' },
          ]"
        />
      </template>
    </template>
    <template #footer>
      <button class="btn m-1" @click="closePopup">
        {{ t("No") }}
      </button>
      <button
        class="btn btn-primary m-1"
        :disabled="errorCommentText"
        @click="onEditComment"
      >
        {{ t("Yes") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script setup lang="ts">
import classicApi from "../../../../api/classicApi";
import Constants from "../../../../../public/config";
import { defineAsyncComponent, onBeforeMount, Ref, ref } from "vue";
import { CommentPodcast } from "@/stores/class/general/comment";
import { useI18n } from "vue-i18n";
const ClassicModal = defineAsyncComponent(
  () => import("../../../misc/modal/ClassicModal.vue"),
);
const ClassicLoading = defineAsyncComponent(
  () => import("../../../form/ClassicLoading.vue"),
);
const ClassicInputText = defineAsyncComponent(
  () => import("../../../form/ClassicInputText.vue"),
);
const ClassicSelect = defineAsyncComponent(
  () => import("../../../form/ClassicSelect.vue"),
);

//Props 
const props = defineProps({
  comment: {
    default: undefined,
    type: Object as () => CommentPodcast,
  },
  editRight: { default: false, type: Boolean },
})
 
//Emits
const emit = defineEmits(["close", "update:comment"]);


//Data 
const commentText: Ref<string | undefined> = ref(undefined);
const errorCommentText = ref(true);
const commentState = ref("PENDING");
const errorUpdate = ref(false);
const inProcessing = ref(false);

//Composables
const { t } = useI18n();
  
onBeforeMount(()=>initComment())


//Methods
function initComment() {
  if (!props.comment) {
    return;
  }
  commentText.value = props.comment.content;
  commentState.value = props.comment.state;
}
async function onEditComment() {
  if (!props.comment) {
    return;
  }
  inProcessing.value = true;
  try {
    const commentUpdated = await classicApi.putData({
      api: 2,
      path: "comment/",
      dataToSend: {
        commentId: props.comment.commentId,
        content: commentText.value,
        state: commentState.value,
      },
      isNotAuth: !props.editRight,
    });
    emit("update:comment", commentUpdated);
    closePopup();
  } catch {
    errorUpdate.value = true;
  }
  inProcessing.value = false;
}
function closePopup() {
  emit("close");
}
</script>
