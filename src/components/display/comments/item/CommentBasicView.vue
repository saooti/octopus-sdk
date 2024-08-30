<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex align-items-center h6 mb-2">
      <strong
        :id="'popover-comment' + comment.commentId"
        role="button"
        tabindex="-1"
        :class="isValidComment ? 'c-hand-auto' : 'text-danger'"
        class="me-2"
        >{{ username }}</strong
      >
      <ClassicPopover
        :disable="isValidComment"
        :target="'popover-comment' + comment.commentId"
        :content="$t('Comment waiting')"
      />
      <div class="me-2">
        {{ date }}
      </div>
      <div
        v-if="comment.abuse && editRight"
        class="d-flex align-items-center text-danger me-2"
      >
        <span class="saooti-warning me-1" />
        {{ $t("abuse denounced", { nb: comment.abuse }) }}
      </div>
      <span v-if="editRight" :class="'status-' + comment.state" />
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <pre v-html="urlify(contentDisplay)" />
    <!-- eslint-enable -->
    <a
      v-if="commentTooLong"
      class="c-hand font-italic"
      @click="displayPreview = !displayPreview"
      >{{ readMore }}
    </a>
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import selenium from "../../../mixins/selenium";
import displayMethods from "../../../mixins/displayMethods";
import { CommentPodcast } from "@/stores/class/general/comment";
import ClassicPopover from "../../../misc/ClassicPopover.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "CommentBasicView",

  components: {
    ClassicPopover,
  },

  mixins: [displayMethods, selenium],

  props: {
    comment: { default: () => ({}), type: Object as () => CommentPodcast },
    editRight: { default: false, type: Boolean },
  },
  data() {
    return {
      displayPreview: true as boolean,
      dateInterval: undefined as ReturnType<typeof setTimeout> | undefined,
      date: "" as string,
    };
  },
  computed: {
    commentTooLong() {
      return this.comment.content.length > 300;
    },
    username(): string {
      return this.comment.poster.userName;
    },
    isValidComment() {
      return "VALIDATED" === this.comment.state;
    },
    readMore(): string {
      return this.displayPreview ? this.$t("Read more") : this.$t("Read less");
    },
    contentDisplay(): string {
      if (!this.displayPreview || !this.commentTooLong) {
        return this.comment.content;
      }
      return this.comment.content.substring(0, 300) + "...";
    },
  },
  mounted() {
    this.defineDateFromNow();
    this.dateInterval = setInterval(() => {
      this.defineDateFromNow();
    }, 60000);
  },
  unmounted() {
    clearInterval(this.dateInterval as unknown as number);
  },
  methods: {
    defineDateFromNow() {
      if (!this.comment.date) {
        this.date = "";
      }
      this.date = dayjs(this.comment.date).fromNow();
    },
  },
});
</script>
<style lang="scss">
@import "../../../../assets/comments.scss";
</style>
