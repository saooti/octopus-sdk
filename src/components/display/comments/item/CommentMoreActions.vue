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
      class="btn share-btn"
      :title="t('See more')"
      :data-selenium="
        'comment-dropdown-' + seleniumFormat(comment.poster.userName)
      "
    >
      <DotsVerticalIcon />
    </button>
    <ClassicPopover
      :target="'comment-dropdown' + comment.commentId"
      :only-click="true"
      :left-pos="true"
    >
      <template v-for="action in moreActions" :key="action">
        <button
          v-if="action.condition"
          class="octopus-dropdown-item c-hand"
          @mousedown="action.actionClick"
          @keydown.enter="action.actionClick"
        >
          {{ action.title }}
        </button>
      </template>
    </ClassicPopover>
    <CommentMoreActionsAdmin
      v-if="editRight"
      v-model:comment="commentForVmodel"
      v-model:actions-admin="actionsAdmin"
    />
  </div>
</template>

<script setup lang="ts">
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import {useSelenium} from "../../../composable/useSelenium";
import classicApi from "../../../../api/classicApi";
import CommentMoreActionsAdmin from "@/components/display/comments/item/CommentMoreActionsAdmin.vue";
import { useAuthStore } from "../../../../stores/AuthStore";
import { CommentPodcast } from "@/stores/class/general/comment";
import { Podcast } from "@/stores/class/general/podcast";
import { useCommentStore } from "../../../../stores/CommentStore";
import { defineAsyncComponent, ref, Ref, computed } from "vue";
import { CommentsConfig } from "@/stores/class/config/commentsConfig";
import { useI18n } from "vue-i18n";
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

//Props 
const props = defineProps({
  comment: { default: () => ({}), type: Object as () => CommentPodcast },
  podcast: { default: undefined, type: Object as () => Podcast },
  config: { default: undefined, type: Object as () => CommentsConfig },
  editRight: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["update:comment", "deleteComment"]);

//Data 
const isEdit = ref(false);
const isReportAbuse = ref(false);
const actionName: Ref<string | undefined> = ref(undefined);
const actionsAdmin: Ref<string | undefined> = ref(undefined);
const confirmModal = ref(false);
const actionInProgress = ref(false);
const isError = ref(false);

//Composables
const { t } = useI18n();
const { seleniumFormat } = useSelenium();
const authStore = useAuthStore();
const commentStore = useCommentStore();

//Computed
const commentForVmodel = computed({
  get(): CommentPodcast {
    return props.comment;
  },
  set(value: CommentPodcast) {
    emit("update:comment", value);
  },
});
const isMyComment = computed(() => {
  const uuid = authStore.authProfile?.userId ?? commentStore.commentUser?.uuidHash;
  return uuid === props.comment?.poster.uuid;
});
const isAtLeastOneMoreAction = computed(() => {
  return moreActions.value.some((el) => {
    return el.condition;
  });
});
const moreActions = computed(() => {
  return [
    {
      title: t("Report abuse"),
      actionClick: () => {
        isReportAbuse.value = true;
      },
      condition:
        commentStore.getCanReportAbuse(
          props.config,
          undefined !== authStore.authOrgaId,
        ) && !isMyComment.value,
    },
    {
      title: t("Managing reported abuses"),
      actionClick: () => {
        actionsAdmin.value = "abuse";
      },
      condition: props.editRight && props.comment.abuse,
    },
    {
      title: t("Edit comment"),
      actionClick: () => {
        isEdit.value = true;
      },
      condition: props.editRight || isMyComment.value,
    },
    {
      title: t("Comment information"),
      actionClick: () => {
        actionsAdmin.value = "info";
      },
      condition: props.editRight && !props.podcast,
    },
    {
      title: t("Validate"),
      actionClick: () => {
        actionName.value = "validate";
        isError.value = false;
        confirmModal.value = true;
      },
      condition:
        props.editRight &&
        ("PENDING" === props.comment.state ||
          "NOT_VALID" === props.comment.state),
    },
    {
      title: t("Invalidate"),
      actionClick: () => {
        actionName.value = "invalidate";
        isError.value = false;
        confirmModal.value = true;
      },
      condition:
        props.editRight &&
        ("PENDING" === props.comment.state ||
          "VALIDATED" === props.comment.state),
    },
    {
      title: t("Delete comment"),
      actionClick: () => {
        actionName.value = "delete";
        isError.value = false;
        confirmModal.value = true;
      },
      condition: props.editRight || isMyComment.value,
    },
  ];
});
const validateText = computed(() => {
  if (isError.value) {
    return t("Close");
  }
  return actionInProgress.value ? undefined : t("Yes");
});
const canceltext = computed(() => isError.value ? undefined : t("No"));
const modalMessage = computed(() => {
  if (actionInProgress.value) {
    return t("Saving");
  }
  if (isError.value) {
    return t("An error occurred");
  }
  const name = { name: props.comment.poster.userName };
  switch (actionName.value) {
    case "delete":
      return t("Confirm comment deletion text", name);
    case "validate":
      return t("Confirm comment valid text", name);
    case "invalidate":
      return t("Confirm comment invalid text", name);
    default:
      return "";
  }
});
const modalTitle = computed(() => {
  if ("delete" === actionName.value) {
    return t("Delete comment");
  }
  return t("Update comment");
});  
 

//Methods
async function actionComment() {
  if (!props.comment) {
    return;
  }
  actionInProgress.value = true;
  isError.value = false;
  try {
    if ("delete" === actionName.value) {
      await classicApi.deleteData({
        api: 2,
        path: "comment/" + props.comment.commentId,
        parameters: props.editRight
          ? undefined
          : { uuid: commentStore.commentUser?.uuid },
        isNotAuth: !props.editRight,
      });
      emit("deleteComment");
    } else {
      const commentUpdated = await classicApi.putData({
        api: 2,
        path: "comment/",
        dataToSend: {
          commentId: props.comment.commentId,
          content: props.comment.content,
          name: props.comment.poster.userName,
          state: "validate" === actionName.value ? "VALIDATED" : "NOT_VALID",
        },
      });
      emit("update:comment", commentUpdated);
    }
    confirmModal.value = false;
  } catch {
    isError.value = true;
  }
  actionInProgress.value = false;
}
</script>
