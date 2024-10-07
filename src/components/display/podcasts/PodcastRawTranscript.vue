<template>
  <div>
    <button
      class="btn btn-transcript"
      :class="{ open: isOpen }"
      @click="isOpen = !isOpen"
    >
      {{ buttonText }}
    </button>
    <div v-if="isOpen" class="transcription-body">
      <ClassicLoading
        :loading-text="!firstLoaded ? $t('Loading content ...') : undefined"
      />
      <div class="transcription-text">
        <template v-if="firstLoaded && transcript?.length">{{
          transcript
        }}</template>
        <template v-if="firstLoaded && !transcript?.length">{{
          $t("Transcript does not yet exist for this episode")
        }}</template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastRawTranscript",

  components: {
    ClassicLoading,
  },

  props: {
    podcastId: { default: undefined, type: Number },
  },
  data() {
    return {
      isOpen: false as boolean,
      firstLoaded: false as boolean,
      transcript: undefined as string | undefined,
    };
  },

  computed: {
    buttonText() {
      return this.isOpen
        ? this.$t("Hide transcript")
        : this.$t("View transcript");
    },
  },
  watch: {
    async isOpen() {
      if (this.isOpen && !this.firstLoaded) {
        this.fetchTranscript();
      }
    },
  },
  methods: {
    async fetchTranscript() {
      if (!this.podcastId) {
        return;
      }
      try {
        this.transcript = await octopusApi.fetchData(
          11,
          `transcription/text/${this.podcastId}`,
        );
      } catch {
        //Do nothing
      }
      this.firstLoaded = true;
    },
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .btn-transcript {
    position: relative;
    border-radius: $octopus-borderradius;
    overflow: hidden;
    background: $octopus-secondary-color;
    transition: all 0.2s linear 0s;

    &:not(.open):before,
    &.open:after {
      content: "➤";
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      height: 100%;
      width: 30px;
      border-radius: 0 50% 50% 0;
      background-color: rgba(#fff, 0.4);
      transform: scale(0, 1);
      transition: all 0.2s linear 0s;
    }
    &:not(.open):before {
      left: 0px;
      transform-origin: left center;
    }
    &.open:after {
      right: -30px;
      transform-origin: center left;
    }
    &.open {
      direction: rtl;
    }
    &:hover {
      text-indent: 30px;
    }
    &:not(.open):hover:before,
    &.open:hover:after {
      text-indent: 0;
    }
    &:not(.open):hover:before {
      transform: scale(1, 1);
    }
    &.open:hover:after {
      transform: scale(-1, 1);
    }
  }
  .transcription-body {
    position: relative;
    padding: 1rem;
    max-height: 250px;
    display: flex;
    justify-content: center;
    .transcription-text {
      overflow-y: auto;
      overflow-x: hidden;
      text-align: justify;
    }
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      padding: 3px;
      background: repeating-conic-gradient(
          $octopus-secondary-color 0 25%,
          $octopus-primary-color 0 50%
        )
        0 0/30px 30px round;
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }
  }
}
</style>
