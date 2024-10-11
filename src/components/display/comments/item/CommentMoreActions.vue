<template>
  <div v-if="isAtLeastOneMoreAction">
    <ReportAbuseModal
      v-if="isReportAbuse"
      v-model:comment="commentForVmodel"
      @close="isReportAbuse = false"
    />
    <EditCommentModal
      v-if="isEdit"
      v-model:comment="commentForVmodel"
      :edit-right="editRight"
      @close="isEdit = false"
    />
    <MessageModal
      v-if="confirmModal"
      :validatetext="validateText"
      :canceltext="canceltext"
      :closable="false"
      :title="modalTitle"
      :message="modalMessage"
      :focus="true"
      @cancel="confirmModal = false"
      @validate="actionComment"
      @close="confirmModal = false"
    />
    <button
      :id="'comment-dropdown' + comment.commentId"
      class="btn share-btn saooti-more_vert"
      :title="$t('See more')"
      :data-selenium="'comment-dropdown-' + seleniumFormat(comment.poster.userName)"
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
    />
  </div>
</template>

<script lang="ts">
import selenium from "../../../mixins/selenium";
import { state } from "../../../../stores/ParamSdkStore";
import octopusApi from "@saooti/octopus-api";
import crudApi from "@/api/classicCrud";
import CommentMoreActionsAdmin from "@/components/display/comments/item/CommentMoreActionsAdmin.vue";
import { useAuthStore } from "@/stores/AuthStore";
import { CommentPodcast } from "@/stores/class/general/comment";
import { Podcast } from "@/stores/class/general/podcast";
import { useCommentStore } from "../../../../stores/CommentStore";
import { mapActions, mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import { CommentsConfig } from "@/stores/class/config/commentsConfig";
const ClassicPopover = defineAsyncComponent(
  () => import("../../../misc/ClassicPopover.vue"),
);
const ReportAbuseModal = defineAsyncComponent(
  () => import("../modal/ReportAbuseModal.vue"),
);
const EditCommentModal = defineAsyncComponent(
  () => import("../modal/EditCommentModal.vue"),
);
const MessageModal = defineAsyncComponent(
  () => import("../../../misc/modal/MessageModal.vue"),
);
export default defineComponent({
  name: "CommentMoreActions",

  components: {
    ClassicPopover,
    ReportAbuseModal,
    CommentMoreActionsAdmin,
    EditCommentModal,
    MessageModal,
  },

  props: {
    comment: { default: () => ({}), type: Object as () => CommentPodcast },
    podcast: { default: undefined, type: Object as () => Podcast },
    config: { default: undefined, type: Object as () => CommentsConfig },
    editRight: { default: false, type: Boolean },
  },

  emits: ["update:comment", "deleteComment"],
  mixins: [selenium],
  data() {
    return {
      isEdit: false as boolean,
      isReportAbuse: false as boolean,
      actionName: undefined as string | undefined,
      actionsAdmin: undefined as string | undefined,
      confirmModal: false as boolean,
      actionInProgress: false as boolean,
      isError: false as boolean,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authProfile"]),
    ...mapState(useCommentStore, ["commentUser"]),
    commentForVmodel: {
      get(): CommentPodcast {
        return this.comment;
      },
      set(value: CommentPodcast) {
        this.$emit("update:comment", value);
      },
    },
    isMyComment() {
      const uuid = this.authProfile?.userId ?? this.commentUser?.uuidHash;
      return uuid === this.comment?.poster.uuid;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
    isAtLeastOneMoreAction() {
      return this.moreActions.some((el) => {
        return el.condition;
      });
    },
    moreActions() {
      return [
        {
          title: this.$t("Report abuse"),
          actionClick: () => {
            this.isReportAbuse = true;
          },
          condition: this.getCanReportAbuse(this.config, this.authenticated),
        },
        {
          title: this.$t("Managing reported abuses"),
          actionClick: () => {
            this.actionsAdmin = "abuse";
          },
          condition: this.editRight && this.comment.abuse,
        },
        {
          title: this.$t("Edit comment"),
          actionClick: () => {
            this.isEdit = true;
          },
          condition: this.editRight || this.isMyComment,
        },
        {
          title: this.$t("Comment information"),
          actionClick: () => {
            this.actionsAdmin = "info";
          },
          condition: this.editRight && !this.podcast,
        },
        {
          title: this.$t("Validate"),
          actionClick: () => {
            this.actionName = "validate";
            this.isError = false;
            this.confirmModal = true;
          },
          condition:
            this.editRight &&
            ("PENDING" === this.comment.state ||
              "NOT_VALID" === this.comment.state),
        },
        {
          title: this.$t("Invalidate"),
          actionClick: () => {
            this.actionName = "invalidate";
            this.isError = false;
            this.confirmModal = true;
          },
          condition:
            this.editRight &&
            ("PENDING" === this.comment.state ||
              "VALIDATED" === this.comment.state),
        },
        {
          title: this.$t("Delete comment"),
          actionClick: () => {
            this.actionName = "delete";
            this.isError = false;
            this.confirmModal = true;
          },
          condition: this.editRight || this.isMyComment,
        },
      ];
    },
    validateText(): string | undefined {
      if (this.isError) {
        return this.$t("Close");
      }
      return this.actionInProgress ? undefined : this.$t("Yes");
    },
    canceltext(): string | undefined {
      return this.isError ? undefined : this.$t("No");
    },
    modalMessage(): string {
      if (this.actionInProgress) {
        return this.$t("Saving");
      }
      if (this.isError) {
        return this.$t("An error occurred");
      }
      const name = { name: this.comment.poster.userName };
      switch (this.actionName) {
        case "delete":
          return this.$t("Confirm comment deletion text", name);
        case "validate":
          return this.$t("Confirm comment valid text", name);
        case "invalidate":
          return this.$t("Confirm comment invalid text", name);
        default:
          return "";
      }
    },
    modalTitle(): string {
      if ("delete" === this.actionName) {
        return this.$t("Delete comment");
      }
      return this.$t("Update comment");
    },
  },
  methods: {
    ...mapActions(useCommentStore, ["getCanReportAbuse"]),
    async actionComment() {
      if (!this.comment) {
        return;
      }
      this.actionInProgress = true;
      this.isError = false;
      try {
        if ("delete" === this.actionName) {
          if (this.editRight) {
            await crudApi.deleteData(2, "comment/" + this.comment.commentId);
          } else {
            await octopusApi.deleteData(
              2,
              "comment/" + this.comment.commentId,
              { uuid: this.commentUser?.uuid },
            );
          }
          this.$emit("deleteComment");
        } else {
          var commentUpdated = await crudApi.updateData(2, "comment/", {
            commentId: this.comment.commentId,
            content: this.comment.content,
            name: this.comment.poster.userName,
            state: "validate" === this.actionName ? "VALIDATED" : "NOT_VALID",
          });
          this.$emit("update:comment", commentUpdated);
        }
        this.confirmModal = false;
      } catch {
        this.isError = true;
      }
      this.actionInProgress = false;
    },
  },
});
</script>
