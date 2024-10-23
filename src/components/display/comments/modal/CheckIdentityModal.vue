<template>
  <RecaptchaModal
    id-modal="check-identity-modal"
    :title-modal="titleModal"
    :disable-validate="errorName"
    @close="$emit('close')"
    @validate="updateName"
  >
    <template #form>
      <ClassicInputText
        v-model:text-init="name"
        v-model:error-variable="errorName"
        input-id="adserver-tag"
        :label="$t('Let\'s get acquainted :')"
        :max-length="maxName"
        :placeholder="$t('Your name')"
      />
    </template>
  </RecaptchaModal>
</template>

<script lang="ts">
import Constants from "../../../../../public/config";
import ClassicInputText from "../../../form/ClassicInputText.vue";
import RecaptchaModal from "./RecaptchaModal.vue";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import { useCommentStore } from "../../../../stores/CommentStore";
export default defineComponent({
  name: "CheckIdentityModal",
  components: {
    RecaptchaModal,
    ClassicInputText,
  },
  props: {
    title: { default: undefined, type: String },
  },

  emits: ["close", "validate"],

  data() {
    return {
      name: undefined as string | undefined,
      errorName: true as boolean,
      maxName: Constants.MAX_COMMENT_NAME as number,
    };
  },
  computed: {
    titleModal(): string {
      return this.title ?? this.$t("Welcome, thanks for your comment");
    },
  },
  methods: {
    ...mapActions(useCommentStore, ["setCommentUser"]),
    updateName(): void {
      this.setCommentUser(this.name ?? "");
      this.$emit("validate");
    },
  },
});
</script>
