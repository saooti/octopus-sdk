<template>
  <div v-if="!isLoading && (authenticated || !noSharing)" class="module-box">
    <div class="d-flex align-items-center mb-3">
      <h2 class="big-h2 mb-0">
        {{ $t("Share") }}
      </h2>
      <span
        v-if="authenticated"
        id="popover-share-help"
        role="button"
        tabindex="0"
        class="saooti-help ms-2"
        :aria-label="$t('Help')"
      />
      <ClassicPopover
        v-if="authenticated"
        target="popover-share-help"
        :content="$t('Share this page without edit and share blocks')"
        relative-class="page-element"
        :is-fixed="true"
      />
    </div>
    <ShareButtonsIntern
      :no-sharing="noSharing"
      :podcast="podcast"
      :emission="emission"
      :playlist="playlist"
      :participant-id="participantId"
      :organisation-id="organisationId"
    />
  </div>
</template>

<script lang="ts">
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
import { mapActions } from "pinia";
import { Emission } from "@/stores/class/general/emission";
import { Podcast } from "@/stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import displayMethods from "../../mixins/displayMethods";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import ShareButtonsIntern from "./ShareButtonsIntern.vue";
import { defineComponent } from "vue";
import { Playlist } from "@/stores/class/general/playlist";
export default defineComponent({
  components: {
    ShareButtonsIntern,
    ClassicPopover,
  },
  mixins: [displayMethods],
  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    emission: { default: undefined, type: Object as () => Emission },
    playlist: { default: undefined, type: Object as () => Playlist },
    participantId: { default: undefined, type: Number },
    organisationId: { default: undefined, type: String },
  },
  data() {
    return {
      noSharing: true as boolean,
      isLoading: true as boolean,
    };
  },
  computed: {
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
  },
  async created() {
    if (!this.organisationId) {
      return;
    }
    const attributes = await this.getOrgaAttributes(this.organisationId);
    this.noSharing = "true" === attributes.noSharing;
    this.isLoading = false;
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
  },
});
</script>
