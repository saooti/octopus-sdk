<template>
  <RecaptchaModal
    id-modal="report-abuse-modal"
    :title-modal="t('Report abuse')"
    :disable-validate="errorName || abuseDescriptionError"
    :error-text="errorSendAbuse"
    :success-text="successText"
    @close="emit('close')"
    @validate="reportAbuse"
  >
    <template #form>
      <ClassicInputText
        v-if="!commentStore.commentUser?.name"
        v-model:text-init="name"
        v-model:error-variable="errorName"
        input-id="comment-user-name"
        focus
        :label="t('Let\'s get acquainted :')"
        :max-length="Constants.MAX_COMMENT_NAME"
        :placeholder="t('Your name')"
        autocomplete-type="name"
      />
      <ClassicInputText
        v-model:text-init="abuseDescription"
        v-model:error-variable="abuseDescriptionError"
        :is-textarea="true"
        input-id="abuse-description"
        :label="t('Describe the reason for the report')"
        :max-length="Constants.MAX_COMMENT"
        :focus="true"
      />
    </template>
  </RecaptchaModal>
</template>

<script setup lang="ts">
import Constants from "../../../../../public/config";
import ClassicInputText from "../../../form/ClassicInputText.vue";
import RecaptchaModal from "./RecaptchaModal.vue";
import { Ref, ref } from "vue";
import { useCommentStore } from "../../../../stores/CommentStore";
import classicApi from "../../../../api/classicApi";
import {
  CommentAbuseInfo,
  CommentPodcast,
} from "@/stores/class/general/comment";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  comment: { default: undefined, type: Object as () => CommentPodcast },
})

//Emits
const emit = defineEmits(["close", "update:comment"]);

//Data 
const errorName = ref(false);
const name: Ref<string | undefined> = ref(undefined);
const abuseDescription: Ref<string | undefined> = ref(undefined);
const abuseDescriptionError = ref(true);
const errorSendAbuse: Ref<string | undefined> = ref(undefined);
const successText: Ref<string | undefined> = ref(undefined);


//Composables
const { t } = useI18n();
const commentStore = useCommentStore();

//Methods
async function reportAbuse(): Promise<void> {
  if (!commentStore.commentUser?.name) {
    commentStore.setCommentUser(name.value ?? "");
  }
  try {
    const abuseObject = {
      commentId: props.comment?.commentId,
      description: abuseDescription.value,
      uuid: commentStore.commentUser?.uuid,
    };
    const commentAbuseInfo = await classicApi.postData<CommentAbuseInfo>({
      api: 2,
      path: "abuse/",
      dataToSend: abuseObject,
    });
    emit("update:comment", {
      ...props.comment,
      ...{ abuse: commentAbuseInfo.abuseCount },
    });
    successText.value = t("Thank you for reporting abuse");
  } catch {
    errorSendAbuse.value = t(
      "Error occurs while post your comment...",
    );
  }
}
</script>
