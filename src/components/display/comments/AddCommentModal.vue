<template>
  <ClassicModal
    id-modal="add-comment-modal"
    :title-modal="$t('Welcome, thanks for your comment')"
    :closable="false"
    @close="closePopup"
  >
    <template #body>
      <template v-if="!sending">
        <div>{{ $t("Let's get acquainted :") }}</div>
        <input
          v-model="name"
          class="form-input"
          type="text"
          :placeholder="$t('Your name')"
          :class="{ 'border border-danger': 0 === countName || !validName }"
        />
        <p
          class="d-flex justify-content-end h6"
          :class="{ 'text-danger': !validName }"
        >
          {{ countName + " / " + maxName }}
        </p>
        <div v-if="'' !== errorText" class="mt-1 text-danger">
          {{ errorText }}
        </div>
      </template>
      <template v-else>
        <div>{{ $t("Send in progress") }}</div>
      </template>
    </template>
    <template #footer>
      <button class="btn m-1" @click="closePopup">
        {{ $t("Close") }}
      </button>
      <vue-recaptcha
        v-if="!isVerify"
        ref="invisibleRecaptcha"
        :load-recaptcha-script="true"
        size="invisible"
        sitekey="6LfyP_4ZAAAAAPODj8nov2LvosIwcX0GYeBSungh"
        @verify="handleSuccess"
        @expired="handleError"
      />
      <button
        v-if="!sending"
        class="btn btn-primary m-1"
        :disabled="0 === countName || !validName"
        @click="submit"
      >
        {{ $t("Validate") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import Constants from "../../../../public/config";
import { state } from "../../../stores/ParamSdkStore";
import ClassicModal from "../../misc/modal/ClassicModal.vue";
import api from "@/api/initialize";
import { useAuthStore } from "@/stores/AuthStore";
import { mapState } from "pinia";
import { VueRecaptcha } from "vue-recaptcha";
import { defineComponent } from "vue";
export default defineComponent({
  name: "AddCommentModal",
  components: {
    VueRecaptcha,
    ClassicModal,
  },

  props: {},
  emits: ["close", "validate"],

  data() {
    return {
      name: "" as string,
      sending: false as boolean,
      sendError: false as boolean,
      isVerify: false as boolean,
      maxName: Constants.MAX_COMMENT_NAME as number,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authProfile"]),
    errorText(): string {
      if (this.isCaptchaTest) {
        return this.$t("Recaptcha not active");
      }
      return this.sendError ? this.$t("Recaptcha error") : "";
    },
    validName(): boolean {
      return this.countName <= this.maxName;
    },
    countName(): number {
      return this.name.length;
    },
    isCaptchaTest(): boolean {
      return state.generalParameters.isCaptchaTest as boolean;
    },
  },

  created() {
    this.initAuthenticatedName();
  },
  methods: {
    initAuthenticatedName(): void {
      if (!this.authProfile?.userId) {
        return;
      }
      this.name = `${this.authProfile?.firstname || ""} ${
        this.authProfile?.lastname || ""
      }`.trim();
      this.isVerify = true;
    },
    async handleSuccess(token: string) {
      this.isVerify = await api.checkToken(token);
      this.sendComment();
    },
    handleError() {
      this.isVerify = false;
      this.sendError = true;
    },
    async submit(): Promise<void> {
      if (!this.isVerify && !this.isCaptchaTest) {
        return (
          this.$refs.invisibleRecaptcha as InstanceType<typeof VueRecaptcha>
        ).execute();
      }
      this.sendComment();
    },
    closePopup(): void {
      this.$emit("close");
    },
    sendComment(): void {
      this.sending = true;
      this.$emit("validate", this.name);
    },
  },
});
</script>
