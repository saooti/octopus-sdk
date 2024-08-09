<template>
  <div class="d-flex align-items-center mb-2">
    <component
      :is="canEditName ? 'button' : 'div'"
      v-if="!isEditing"
      class="h6 fw-bold"
      :class="canEditName ? 'btn btn-transparent p-1' : ''"
      @click="startEditingName"
      >{{ commentUser.name }}</component
    >
    <template v-else>
      <div class="d-flex flex-column">
        <input
          v-model="temporaryName"
          class="h6"
          type="text"
          :class="{ 'border border-danger': nameNotValid }"
        />
        <p
          class="d-flex justify-content-end h6 mb-0"
          :class="{ 'text-danger': !validName }"
        >
          {{ countName + " / " + maxName }}
        </p>
      </div>
      <button class="btn m-1" @click="isEditing = false">
        {{ $t("Cancel") }}
      </button>
      <button
        class="btn btn-primary m-1"
        :disabled="nameNotValid"
        @click="validEdit"
      >
        {{ $t("Yes") }}
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import Constants from "../../../../public/config";
import { useAuthStore } from "@/stores/AuthStore";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { useCommentStore } from "@/stores/CommentStore";
export default defineComponent({
  name: "CommentName",
  emits: [],
  data() {
    return {
      isEditing: false as boolean,
      temporaryName: "" as string,
      maxName: Constants.MAX_COMMENT_NAME as number,
    };
  },

  computed: {
    ...mapState(useCommentStore, ["commentUser"]),
    ...mapState(useAuthStore, ["authProfile"]),
    canEditName(): boolean {
      return undefined !== this.authProfile;
    },
    nameNotValid(): boolean {
      return 0 === this.countName || !this.validName;
    },
    validName(): boolean {
      return this.countName <= this.maxName;
    },
    countName(): number {
      return this.temporaryName.length;
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
