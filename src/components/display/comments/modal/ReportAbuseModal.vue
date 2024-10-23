<template>
  <RecaptchaModal
    id-modal="report-abuse-modal"
    :title-modal="$t('Report abuse')"
    :disable-validate="errorName || abuseDescriptionError"
    :error-text="errorSendAbuse"
    :success-text="successText"
    @close="$emit('close')"
    @validate="reportAbuse"
  >
    <template #form>
      <ClassicInputText
        v-if="!commentUser?.name"
        v-model:text-init="name"
        v-model:error-variable="errorName"
        input-id="comment-user-name"
        :label="$t('Let\'s get acquainted :')"
        :max-length="maxName"
        :placeholder="$t('Your name')"
      />
      <ClassicInputText
        v-model:text-init="abuseDescription"
        v-model:error-variable="abuseDescriptionError"
        :is-textarea="true"
        input-id="abuse-description"
        :label="$t('Describe the reason for the report')"
        :max-length="maxAbuseDescription"
        :focus="true"
      />
    </template>
  </RecaptchaModal>
</template>

<script lang="ts">
import Constants from "../../../../../public/config";
import ClassicInputText from "../../../form/ClassicInputText.vue";
import RecaptchaModal from "./RecaptchaModal.vue";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { useCommentStore } from "../../../../stores/CommentStore";
import classicApi from "../../../../api/classicApi";
import {
  CommentAbuseInfo,
  CommentPodcast,
} from "@/stores/class/general/comment";
export default defineComponent({
  name: "ReportAbuseModal",
  components: {
    RecaptchaModal,
    ClassicInputText,
  },
  props: {
    comment: { default: undefined, type: Object as () => CommentPodcast },
  },

  emits: ["close", "update:comment"],

  data() {
    return {
      name: undefined as string | undefined,
      errorName: false as boolean,
      maxName: Constants.MAX_COMMENT_NAME as number,
      abuseDescription: undefined as string | undefined,
      abuseDescriptionError: true as boolean,
      maxAbuseDescription: Constants.MAX_COMMENT as number,
      errorSendAbuse: undefined as string | undefined,
      successText: undefined as string | undefined,
    };
  },
  computed: {
    ...mapState(useCommentStore, ["commentUser"]),
  },
  methods: {
    ...mapActions(useCommentStore, ["setCommentUser"]),
    async reportAbuse(): Promise<void> {
      if (!this.commentUser?.name) {
        this.setCommentUser(this.name ?? "");
      }
      try {
        const abuseObject = {
          commentId: this.comment?.commentId,
          description: this.abuseDescription,
          uuid: this.commentUser?.uuid,
        };
        const commentAbuseInfo = await classicApi.postData<CommentAbuseInfo>({
          api: 2,
          path: "abuse/",
          dataToSend: abuseObject,
        });
        this.$emit("update:comment", {
          ...this.comment,
          ...{ abuse: commentAbuseInfo.abuseCount },
        });
        this.successText = this.$t("Thank you for reporting abuse");
      } catch {
        this.errorSendAbuse = this.$t(
          "Error occurs while post your comment...",
        );
      }
    },
  },
});
</script>
