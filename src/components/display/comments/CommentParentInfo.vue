<template>
  <div class="mt-2">
    <ClassicLoading
      :loading-text="loading ? $t('Loading content ...') : undefined"
    />
    <CommentBasicView
      v-if="!loading"
      :comment="comment"
      :edit-right="editRight"
    />
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import CommentBasicView from "./CommentBasicView.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { CommentPodcast } from "@/stores/class/general/comment";
import { defineComponent } from "vue";
export default defineComponent({
  name: "CommentParentInfo",

  components: {
    CommentBasicView,
    ClassicLoading,
  },

  props: {
    comId: { default: undefined, type: Number },
    editRight: { default: false, type: Boolean },
  },

  data() {
    return {
      loading: true as boolean,
      comment: undefined as CommentPodcast | undefined,
    };
  },
  created() {
   this.fetchComment();
  },
  methods:{
    async fetchComment():Promise<void>{
      if (this.comId) {
        this.comment = await octopusApi.fetchData<CommentPodcast>(
          2,
          `comment/${this.comId}`,
        );
      }
      this.loading = false;
    }
  }
});
</script>
