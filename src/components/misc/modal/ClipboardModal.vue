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
        <ClassicCopyButton
          :text="$t('Copy')"
          :text-after-copy="$t('Copied!')"
          :data-to-copy="link"
          :snackbar-text="$t('Link in clipboard')"
        />
      </p>
      <RssSection
        v-if="emission && undefined !== authOrgaId"
        :emission="emission"
      />
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import ClassicCopyButton from "../../form/ClassicCopyButton.vue";
import ClassicModal from "../modal/ClassicModal.vue";
import { Emission } from "@/stores/class/general/emission";
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
    ClassicCopyButton
  },
  props: {
    link: { default: "", type: String },
    emission: { default: undefined, type: Object as () => Emission },
  },
  emits: ["close"],
  computed: {
    ...mapState(useAuthStore, ["authOrgaId"]),
  },
  methods: {
    closePopup(): void {
      this.$emit("close");
    },
  },
});
</script>
