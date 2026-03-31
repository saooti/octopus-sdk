<template>
  <div 
    class="d-flex align-items-center mb-2">
    <component
      :is="canEditName ? 'button' : 'div'"
      v-if="!isEditing"
      class="h6 fw-bold"
      :class="canEditName ? 'btn btn-transparent p-1' : ''"
      @click="startEditingName"
      >{{ commentStore.commentUser?.name }}</component
    >
    <template v-else>
      <ClassicInputText
        v-model:text-init="temporaryName"
        v-model:error-variable="errorName"
        input-id="comment-name-input"
        focus
        :label="t('Your name')"
        :max-length="Constants.MAX_COMMENT_NAME"
        autocomplete-type="name"
        class="me-3"
      />
      <button class="btn m-1" @click="isEditing = false">
        {{ t("Cancel") }}
      </button>
      <button
        class="btn btn-primary m-1"
        :disabled="errorName"
        @click="validEdit"
      >
        {{ t("Yes") }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import ClassicInputText from "../../form/ClassicInputText.vue";
import Constants from "../../../../public/config";
import { useAuthStore } from "../../../stores/AuthStore";
import { computed, ref } from "vue";
import { useCommentStore } from "../../../stores/CommentStore";
import { useI18n } from "vue-i18n";

//Data 
const isEditing = ref(false);
const temporaryName = ref("");
const errorName = ref(true);

//Composables
const { t } = useI18n();
const commentStore = useCommentStore();
const authStore = useAuthStore();


//Computed
const canEditName = computed(() => undefined !== authStore.authProfile);

//Methods
function startEditingName(): void {
  if (!canEditName.value) {
    return;
  }
  temporaryName.value = commentStore.commentUser?.name ?? "";
  isEditing.value = true;
}
function validEdit(): void {
  commentStore.setCommentUser(temporaryName.value);
  isEditing.value = false;
}
</script>
