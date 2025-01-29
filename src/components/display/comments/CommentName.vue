<template>
  <div 
    class="d-flex align-items-center mb-2">
    <component
      :is="canEditName ? 'button' : 'div'"
      v-if="!isEditing"
      class="h6 fw-bold"
      :class="canEditName ? 'btn btn-transparent p-1' : ''"
      @click="startEditingName"
      >{{ commentUser.name }}</component
    >
    <template v-else>
      <ClassicInputText
        v-model:text-init="temporaryName"
        v-model:error-variable="errorName"
        input-id="comment-name-input"
        :label="$t('Your name')"
        :max-length="maxName"
        class="me-3"
      />
      <button class="btn m-1" @click="isEditing = false">
        {{ $t("Cancel") }}
      </button>
      <button
        class="btn btn-primary m-1"
        :disabled="errorName"
        @click="validEdit"
      >
        {{ $t("Yes") }}
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import ClassicInputText from "../../form/ClassicInputText.vue";
import Constants from "../../../../public/config";
import { useAuthStore } from "../../../stores/AuthStore";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { useCommentStore } from "../../../stores/CommentStore";
export default defineComponent({
  name: "CommentName",
  components:{
    ClassicInputText
  },
  emits: [],
  data() {
    return {
      isEditing: false as boolean,
      temporaryName: "" as string,
      errorName: true as boolean,
      maxName: Constants.MAX_COMMENT_NAME as number,
    };
  },

  computed: {
    ...mapState(useCommentStore, ["commentUser"]),
    ...mapState(useAuthStore, ["authProfile"]),
    canEditName(): boolean {
      return undefined !== this.authProfile;
    },
  },
  methods: {
    ...mapActions(useCommentStore, ["setCommentUser"]),
    startEditingName(): void {
      if (!this.canEditName) {
        return;
      }
      this.temporaryName = this.commentUser?.name ?? "";
      this.isEditing = true;
    },
    validEdit(): void {
      this.setCommentUser(this.temporaryName);
      this.isEditing = false;
    },
  },
});
</script>
