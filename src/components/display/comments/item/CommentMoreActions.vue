<template>
  <div>
    <ReportAbuseModal
      v-if="isReportAbuse"
      :comment-id="comment.commentId"
      @close="isReportAbuse = false"
    />
    <button
      :id="'comment-dropdown' + comment.commentId"
      class="btn share-btn saooti-more_vert"
      :title="$t('See more')"
    />
    <ClassicPopover
      :target="'comment-dropdown' + comment.commentId"
      popover-class="popover-z-index"
      :only-click="true"
      :left-pos="true"
    >
      <template v-for="action in moreActions" :key="action">
        <a
          v-if="action.condition"
          class="octopus-dropdown-item c-hand"
          @click="action.actionClick"
        >
          {{ action.title }}
        </a>
      </template>
    </ClassicPopover>
    <CommentMoreActionsAdmin
      v-if="editRight"
      v-model:comment="commentForVmodel"
      v-model:actionsAdmin="actionsAdmin"
      @delete-comment="$emit('deleteComment')"
    />
  </div>
</template>

<script lang="ts">
import CommentMoreActionsAdmin from "@/components/display/comments/item/CommentMoreActionsAdmin.vue";
import { CommentPodcast } from "@/stores/class/general/comment";
import { Podcast } from "@/stores/class/general/podcast";
import { useCommentStore } from "@/stores/CommentStore";
import { mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
const ClassicPopover = defineAsyncComponent(
  () => import("../../../misc/ClassicPopover.vue"),
);
const ReportAbuseModal = defineAsyncComponent(
  () => import("../modal/ReportAbuseModal.vue"),
);
export default defineComponent({
  name: "CommentMoreActions",

  components: {
    ClassicPopover,
    ReportAbuseModal,
    CommentMoreActionsAdmin,
  },

  props: {
    comment: { default: () => ({}), type: Object as () => CommentPodcast },
    podcast: { default: undefined, type: Object as () => Podcast },
    editRight: { default: false, type: Boolean },
  },

  emits: ["update:comment", "deleteComment"],

  data() {
    return {
      isReportAbuse: false as boolean,
      actionsAdmin: undefined as string | undefined,
    };
  },
  computed: {
    ...mapState(useCommentStore, ["commentUser"]),
    commentForVmodel: {
      get(): CommentPodcast {
        return this.comment;
      },
      set(value: CommentPodcast) {
        this.$emit("update:comment", value);
      },
    },
    moreActions() {
      const moreActions = [
        {
          title: this.$t("Report abuse"),
          actionClick: () => {
            this.isReportAbuse = true;
          },
          condition: true,
        },
      ];
      if (this.editRight) {
        moreActions.push(
          ...[
            {
              title: this.$t("Edit comment"),
              actionClick: () => {
                this.actionsAdmin = "edit";
              },
              condition: true,
            },
            {
              title: this.$t("Comment information"),
              actionClick: () => {
                this.actionsAdmin = "info";
              },
              condition: !this.podcast,
            },
            {
              title: this.$t("Validate"),
              actionClick: () => {
                this.actionsAdmin = "validate";
              },
              condition:
                "PENDING" === this.comment.state ||
                "NOT_VALID" === this.comment.state,
            },
            {
              title: this.$t("Invalidate"),
              actionClick: () => {
                this.actionsAdmin = "invalidate";
              },
              condition:
                "PENDING" === this.comment.state ||
                "VALIDATED" === this.comment.state,
            },
            {
              title: this.$t("Delete comment"),
              actionClick: () => {
                this.actionsAdmin = "delete";
              },
              condition: true,
            },
          ],
        );
      }
      return moreActions;
    },
  },
});
</script>
