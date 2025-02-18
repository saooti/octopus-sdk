<template>
  <ClassicModal
    id-modal="clipboard-modal"
    :title-modal="$t('RSS Link')"
    @close="closePopup"
  >
    <template #body>
      <p class="d-flex justify-content-between align-items-center">
        {{ $t("Rss feed:") }}
        <span id="LINK">{{ link }}</span>
        <button class="btn btn-primary" @click="onCopyCode(link, afterCopy)">
          {{ $t("Copy") }}
        </button>
      </p>
      <RssSection
        v-if="emission && undefined !== authOrgaId"
        :emission="emission"
      />
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import ClassicModal from "../modal/ClassicModal.vue";
import { Emission } from "@/stores/class/general/emission";
import displayHelper from "../../../helper/displayHelper";
import { defineComponent, defineAsyncComponent } from "vue";
import { useAuthStore } from "../../../stores/AuthStore";
import { mapState } from "pinia";
const RssSection = defineAsyncComponent(
  () => import("@/components/display/aggregator/RssSection.vue"),
);
export default defineComponent({
  name: "ClipboardModal",
  components: {
    RssSection,
    ClassicModal,
  },
  props: {
    link: { default: "", type: String },
    emission: { default: undefined, type: Object as () => Emission },
  },
  emits: ["close", "copy"],
  computed: {
    ...mapState(useAuthStore, ["authOrgaId"]),
  },
  methods: {
    onCopyCode(link: string, callback: () => void){
      displayHelper.onCopyCode(link, callback);
    },
    closePopup(): void {
      this.$emit("close");
    },
    afterCopy(): void {
      this.$emit("copy");
    },
  },
});
</script>
