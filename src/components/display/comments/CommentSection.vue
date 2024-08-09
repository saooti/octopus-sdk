<template>
  <div class="module-box">
    <div class="d-flex align-items-center">
      <h2 class="mb-0 me-2">{{ $t("Podcast's comments") }}</h2>
      <button
        :title="$t('Refresh')"
        class="btn btn-transparent saooti-refresh"
        @click="reload = !reload"
      />
    </div>
    <CommentInput :podcast="podcast" @new-comment="reload = !reload" />
    <CommentList class="mt-5" :podcast="podcast" :reload="reload" />
  </div>
</template>

<script lang="ts">
import cookies from "../../mixins/cookies";
import { Podcast } from "@/stores/class/general/podcast";
import { defineAsyncComponent, defineComponent } from "vue";
const CommentList = defineAsyncComponent(() => import("./CommentList.vue"));
const CommentInput = defineAsyncComponent(() => import("./CommentInput.vue"));
export default defineComponent({
  name: "CommentSection",
  components: {
    CommentList,
    CommentInput,
  },
  mixins: [cookies],
  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
  },
  data() {
    return {
      reload: false as boolean,
    };
  },
});
</script>
