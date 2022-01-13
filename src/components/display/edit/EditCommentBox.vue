<template>
  <div class="d-flex">
    <button
      class="btn admin-button me-1"
      title="edit"
      @click="editComment"
    >
      <span
        class="saooti-edit-bounty"
        :data-selenium="'Edit-Comment-' + seleniumFormat(comment.name)"
      />
    </button>
    <button
      v-if="'Pending' === comment.status || 'Invalid' === comment.status"
      class="btn admin-button me-1"
      title="valid"
      @click="commentModal('Valid')"
    >
      <span
        class="saooti-valid-stud"
        :data-selenium="'Validate-Comment-' + seleniumFormat(comment.name)"
      />
    </button>
    <button
      v-if="'Pending' === comment.status || 'Valid' === comment.status"
      class="btn admin-button me-1"
      title="invalid"
      @click="commentModal('Invalid')"
    >
      <span
        class="saooti-cross"
        :data-selenium="'Invalidate-Comment-' + seleniumFormat(comment.name)"
      />
    </button>
    <button
      v-if="organisation"
      class="btn admin-button me-1"
      :title="$t('See more')"
      @click="seeMore = true"
    >
      <span
        class="saooti-more_vert"
        :data-selenium="'More-Info-Comment-' + seleniumFormat(comment.name)"
      />
    </button>
    <button
      class="btn admin-button me-1"
      title="delete"
      @click="commentModal('Delete')"
    >
      <span
        class="saooti-bin"
        :data-selenium="'Trash-Comment-' + seleniumFormat(comment.name)"
      />
    </button>
    <MessageModal
      v-if="displayModal"
      :validatetext="validateText"
      :canceltext="canceltext"
      :closable="false"
      :title="modalTitle"
      :message="modalMessage"
      @cancel="displayModal = false"
      @validate="deleteComment"
      @close="displayModal = false"
    />
  </div>
</template>

<script lang="ts">
import { selenium } from '../../mixins/functions';
import { CommentPodcast } from '@/store/class/general/comment';
import { defineComponent, defineAsyncComponent } from 'vue';
const MessageModal = defineAsyncComponent(
  () => import('@/components/misc/modal/MessageModal.vue')
);
export default defineComponent({
  components: {
    MessageModal,
  },
  mixins: [selenium],

  props: {
    comment: { default: () => ({}), type: Object as () => CommentPodcast },
    organisation: { default: undefined, type: String },
  },
  emits: ['editComment', 'updateComment', 'deleteComment'],

  data() {
    return {
      displayModal: false as boolean,
      isDeleting: false as boolean,
      type: 'update' as string,
      seeMore: false as boolean,
    };
  },

  computed: {
    validateText(): string | undefined {
      if ('Error' === this.type || 'Error403' === this.type)
        return this.$t('Close').toString();
      if (this.isDeleting) return undefined;
      return this.$t('Yes').toString();
    },
    canceltext(): string | undefined {
      if ('Error' === this.type || 'Error403' === this.type) return undefined;
      return this.$t('No').toString();
    },
    modalMessage(): string {
      switch (this.type) {
        case 'Delete':
          if (this.isDeleting)
            return this.$t('Deleting in progress ...').toString();
          return this.$t('Confirm comment deletion text', {
            name: this.comment.name,
          }).toString();
        case 'Error':
          return this.$t('Error occurs while updating your comment').toString();
        case 'Error403':
          return this.$t('403 error forbidden').toString();
        default:
          return '';
      }
    },
    modalTitle(): string {
      switch (this.type) {
        case 'Delete':
          return this.$t('Delete comment').toString();
        case 'Error403':
        case 'Error':
          return this.$t('Error').toString();
        default:
          return this.$t('Update comment').toString();
      }
    },
  },

  methods: {
    editComment(): void {
      this.$emit('editComment');
    },
    commentModal(type: string): void {
      console.log('commentModal'+ type);
    },
    async updateComment(newComment?: CommentPodcast | undefined): Promise<void> {
      console.log('updateComment' + newComment);
    },
    async deleteComment(): Promise<void> {
      console.log('deleteComment');
    },
  },
});
</script>