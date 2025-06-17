<template>
  <RecaptchaModal
    id-modal="check-identity-modal"
    :title-modal="titleModal"
    :disable-validate="errorName"
    @close="emit('close')"
    @validate="updateName"
  >
    <template #form>
      <ClassicInputText
        v-model:text-init="name"
        v-model:error-variable="errorName"
        input-id="adserver-tag"
        :label="t('Let\'s get acquainted :')"
        :max-length="Constants.MAX_COMMENT_NAME"
        :placeholder="t('Your name')"
        autocomplete-type="name"
      />
    </template>
  </RecaptchaModal>
</template>

<script setup lang="ts">
import Constants from "../../../../../public/config";
import ClassicInputText from "../../../form/ClassicInputText.vue";
import RecaptchaModal from "./RecaptchaModal.vue";
import { computed, Ref, ref } from "vue";
import { useCommentStore } from "../../../../stores/CommentStore";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  title: { default: undefined, type: String },
})

//Emits
const emit = defineEmits(["close", "validate"]);

//Data 
const errorName = ref(true);
const name: Ref<string | undefined> = ref(undefined);

//Composables
const { t } = useI18n();
const commentStore = useCommentStore();


//Computed
const titleModal = computed(() => props.title ?? t("Welcome, thanks for your comment"));

//Methods
function updateName(): void {
  commentStore.setCommentUser(name.value ?? "");
  emit("validate");
}
</script>
