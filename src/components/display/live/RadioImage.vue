<template>
  <div
    class="img-box img-box-podcast position-relative flex-shrink-0 mb-3 me-3 float-start"
  >
    <img
      v-lazy="
        radio.imageUrl
          ? proxyImageUrl(radio.imageUrl, '270')
          : '/img/emptyradio.webp'
      "
      width="270"
      height="270"
      class="img-box img-box-podcast"
      :title="$t('Canal name image', { name: radio.name })"
      :alt="$t('Canal name image', { name: radio.name })"
    />
    <button class="image-play-button" @click="playRadio">
      <div class="multiple-play-buttons-container">
        <div v-if="!playingRadio" :title="$t('Play')" class="saooti-play" />
        <div v-else class="bloc-paddle" :class="playingRadio && 'PLAYING' === playerStatus ? 'play-animation' : ''">
          <span class="paddle1" />
          <span class="paddle2" />
          <span class="paddle3" />
        </div>
        <div class="ms-2">
          {{ playText }}
        </div>
      </div>
    </button>
  </div>
</template>

<script lang="ts">
import { usePlayerStore } from "@/stores/PlayerStore";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState, mapActions } from "pinia";
import imageProxy from "../../mixins/imageProxy";
import { defineComponent } from "vue";
import { Canal } from "@/stores/class/radio/canal";
export default defineComponent({
  name: "RadioImage",

  components: {},

  mixins: [imageProxy],

  props: {
    radio: { default: undefined, type: Object as () => Canal },
  },

  computed: {
    ...mapState(usePlayerStore, ["playerRadio", "playerStatus"]),
    ...mapState(useFilterStore, ["filterOrgaId"]),
    playingRadio() {
      return this.playerRadio && this.playerRadio.canalId === this.radio?.id;
    },
    playText(): string {
      return this.playingRadio && "PLAYING" === this.playerStatus
        ? this.$t("Pause")
        : this.$t("Play");
    },
  },

  methods: {
    ...mapActions(usePlayerStore, ["playerPlay", "playerChangeStatus"]),
    playRadio(): void {
      if (!this.radio) {
        return;
      }
      if (this.playingRadio) {
        this.playerChangeStatus("PLAYING" === this.playerStatus);
      } else {
        this.playerPlay({
          canalId: this.radio.id,
          url: "https://" + this.radio.url + "/live.m3u8",
          metadata: "",
        });
      }
    },
  },
});
</script>
