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
            ? t('Loading content ...')
            : undefined
        "
        :error-text="errorText"
      />
      <div v-if="successText" class="text-center h3">{{ successText }}</div>
    </template>
    <template #footer>
      <button class="btn m-1" @click="closePopup">
        {{ t("Close") }}
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
        {{ t("Yes") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script setup lang="ts">
import { state } from "../../../../stores/ParamSdkStore";
import ClassicLoading from "../../../form/ClassicLoading.vue";
import ClassicModal from "../../../misc/modal/ClassicModal.vue";
import { CHECK_TOKEN_KEY } from "../../../composable/keys";
import { VueRecaptcha } from "vue-recaptcha";
import { computed, inject, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  idModal: { default: undefined, type: String },
  titleModal: { default: undefined, type: String },
  disableValidate: { default: false, type: Boolean },
  errorText: { default: undefined, type: String },
  successText: { default: undefined, type: String },
})

//Emits
const emit = defineEmits(["close", "validate"]);

//Data 
const sendError = ref(false);
const isVerify = ref(false);
const isInTreatment = ref(false);
const captchRef = useTemplateRef('invisibleRecaptcha');


//Composables
const { t } = useI18n();
// checkToken is not defined in the SDK: it is resolved at runtime from the
// consuming app's globally provided implementation (app.provide()), and
// defaults to always-verified when the app hasn't provided one.
const checkToken = inject(CHECK_TOKEN_KEY, async () => true);

//Computed
const errorRecaptchaText = computed(() =>{
  if (isCaptchaTest.value) {
    return t("Recaptcha not active");
  }
  return sendError.value ? t("Recaptcha error") : "";
});
const isCaptchaTest = computed(() => state.generalParameters.isCaptchaTest as boolean);


//Methods
async function handleSuccess(token: string) {
  isVerify.value = await checkToken(token);
  sendAction();
}
function handleError() {
  isVerify.value = false;
  sendError.value = true;
}
async function submit(): Promise<void> {
  isInTreatment.value = true;
  if (!isVerify.value && !isCaptchaTest.value) {
    (captchRef?.value as InstanceType<typeof VueRecaptcha>).execute();
  }
  sendAction();
}
function closePopup(): void {
  emit("close");
}
function sendAction(): void {
  emit("validate");
}
</script>
