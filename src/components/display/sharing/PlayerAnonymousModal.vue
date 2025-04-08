<template>
  <ClassicModal
    id-modal="player-anonymous-modal"
    :title-modal="$t('Share the player')"
    @close="closePopup"
  >
    <template #body>
      <SharePlayer
        :podcast="podcast"
        :emission="emission"
        :exclusive="exclusive"
        :not-exclusive="notExclusive"
        :organisation-id="authOrgaId"
      />
    </template>
    <template #footer>
      <button class="btn btn-primary m-1" @click="closePopup">
        {{ $t("Close") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import { Podcast } from "@/stores/class/general/podcast";
import ClassicModal from "../../misc/modal/ClassicModal.vue";
import SharePlayer from "./SharePlayer.vue";
import { useAuthStore } from "../../../stores/AuthStore";
import { defineComponent } from "vue";
import { Emission } from "@/stores/class/general/emission";
import { mapState } from "pinia";
export default defineComponent({
  name: "PlayerAnonymousModal",
  components: {
    ClassicModal,
    SharePlayer
  },
  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    emission: { default: undefined, type: Object as () => Emission },
    exclusive: { default: false, type: Boolean },
    notExclusive: { default: true, type: Boolean },
  },
  emits: ["close"],
  computed:{
    ...mapState(useAuthStore, ["authOrgaId"]),
  },
  methods: {
    closePopup(): void {
      this.$emit("close");
    },
  },
});
</script>
