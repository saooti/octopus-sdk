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
        v-model:errorVariable="errorName"
        input-id="comment-user-name"
        :label="$t('Let\'s get acquainted :')"
        :max-length="maxName"
        :placeholder="$t('Your name')"
      />
      <ClassicInputText
        v-model:text-init="abuseDescription"
        v-model:errorVariable="abuseDescriptionError"
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
import { useCommentStore } from "@/stores/CommentStore";
import octopusApi from "@saooti/octopus-api";
export default defineComponent({
  name: "ReportAbuseModal",
  components: {
    RecaptchaModal,
    ClassicInputText,
  },
  props: {
    commentId: { default: undefined, type: Number },
  },

  emits: ["close"],

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
        await octopusApi.postDataPublic(2, "abuse/", {
          commentId: this.commentId,
          description: this.abuseDescription,
          uuid: this.commentUser?.uuid,
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
