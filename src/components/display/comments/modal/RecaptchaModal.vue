<template>
  <ClassicModal
    :id-modal="idModal"
    :title-modal="titleModal"
    :closable="false"
    @close="closePopup"
  >
    <template #body>
      <div class="text-center text-danger">{{ errorRecaptchaText }}</div>
      <slot v-if="!isInTreatment" name="form" />
      <ClassicLoading
        v-else
        :loading-text="
          isInTreatment && !errorText && !successText
            ? $t('Loading content ...')
            : undefined
        "
        :error-text="errorText"
      />
      <div v-if="successText" class="text-center h3">{{ successText }}</div>
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
        v-if="!errorText && !successText"
        class="btn btn-primary m-1"
        :disabled="disableValidate || isInTreatment"
        @click="submit"
      >
        {{ $t("Yes") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import { state } from "../../../../stores/ParamSdkStore";
import ClassicLoading from "../../../form/ClassicLoading.vue";
import ClassicModal from "../../../misc/modal/ClassicModal.vue";
import api from "@/api/initialize";
import { VueRecaptcha } from "vue-recaptcha";
import { defineComponent } from "vue";
export default defineComponent({
  name: "RecaptchaModal",
  components: {
    VueRecaptcha,
    ClassicModal,
    ClassicLoading,
  },
  props: {
    idModal: { default: undefined, type: String },
    titleModal: { default: undefined, type: String },
    disableValidate: { default: false, type: Boolean },
    errorText: { default: undefined, type: String },
    successText: { default: undefined, type: String },
  },

  emits: ["close", "validate"],

  data() {
    return {
      sendError: false as boolean,
      isVerify: false as boolean,
      isInTreatment: false as boolean,
    };
  },
  computed: {
    errorRecaptchaText(): string {
      if (this.isCaptchaTest) {
        return this.$t("Recaptcha not active");
      }
      return this.sendError ? this.$t("Recaptcha error") : "";
    },
    isCaptchaTest(): boolean {
      return state.generalParameters.isCaptchaTest as boolean;
    },
  },
  methods: {
    async handleSuccess(token: string) {
      this.isVerify = await api.checkToken(token);
      this.sendAction();
    },
    handleError() {
      this.isVerify = false;
      this.sendError = true;
    },
    async submit(): Promise<void> {
      this.isInTreatment = true;
      if (!this.isVerify && !this.isCaptchaTest) {
        return (
          this.$refs.invisibleRecaptcha as InstanceType<typeof VueRecaptcha>
        ).execute();
      }
      this.sendAction();
    },
    closePopup(): void {
      this.$emit("close");
    },
    sendAction(): void {
      this.$emit("validate");
    },
  },
});
</script>
