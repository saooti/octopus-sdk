<template>
  <div>
    <AccessibilityModal
      v-if="isAccessibilityModal"
      @save="saveAccessibility"
      @close="isAccessibilityModal = false"
    />
    <div class="transcription-section-buttons">
      <button v-if="isOpen" class="btn btn-primary m-0" @click="isAccessibilityModal = true">
        <EyeOutlineIcon class="me-1"/> {{ $t('Transcript Accessibility') }}
      </button>
      <button
        class="btn btn-transcript"
        :class="{ open: isOpen }"
        @click="isOpen = !isOpen"
      >
        {{ buttonText }}
      </button>
    </div>
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
import cookiesHelper from "../../../helper/cookiesHelper";
import EyeOutlineIcon from "vue-material-design-icons/EyeOutline.vue";
import classicApi from "../../../api/classicApi";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { defineAsyncComponent, defineComponent } from "vue";
const AccessibilityModal = defineAsyncComponent(
  () => import("../accessibility/AccessibilityModal.vue"),
);
export default defineComponent({
  name: "PodcastRawTranscript",

  components: {
    ClassicLoading,
    EyeOutlineIcon,
    AccessibilityModal
  },

  props: {
    podcastId: { default: undefined, type: Number },
  },
  data() {
    return {
      isOpen: false as boolean,
      firstLoaded: false as boolean,
      transcript: undefined as string | undefined,
      isAccessibilityModal : false as boolean,
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
        this.getAccessibility();
      }
    },
  },
  methods: {
    getAccessibility(){
      let fontSize = cookiesHelper.getCookie("octopus-font-size");
      if (null !== fontSize) {
        this.setCssProperty('--octopus-accessibility-font-size', fontSize);
      }
      let background = cookiesHelper.getCookie("octopus-background");
      if (null !== background) {
        this.setCssProperty('--octopus-accessibility-background', background);
      }
      let color = cookiesHelper.getCookie("octopus-color");
      if (null !== color) {
        this.setCssProperty('--octopus-accessibility-color', color);
      }
    },
    setCssProperty(name: string, value: string){
      document.documentElement.style.setProperty(name,value);
    },
    saveAccessibility(accessibility: {fontSize: number,background: string,color: string}){
      this.setCssProperty('--octopus-accessibility-font-size', accessibility.fontSize+'px');
      cookiesHelper.setCookie("octopus-font-size", accessibility.fontSize+'px');
      this.setCssProperty('--octopus-accessibility-background', accessibility.background);
      cookiesHelper.setCookie("octopus-background",accessibility.background);
      this.setCssProperty('--octopus-accessibility-color', accessibility.color);
      cookiesHelper.setCookie("octopus-color",accessibility.color);
      this.isAccessibilityModal = false;
    },
    async fetchTranscript() {
      if (!this.podcastId) {
        return;
      }
      try {
        this.transcript = await classicApi.fetchData({
          api: 11,
          path: `transcription/text/${this.podcastId}`,
        });
      } catch {
        //Do nothing
      }
      this.firstLoaded = true;
    },
  },
});
</script>
<style lang="scss">
:root {
  --octopus-accessibility-font-size: 16px;
  --octopus-accessibility-background: var(--octopus-background);
  --octopus-accessibility-color: var(--octopus-color-text);
}
.octopus-app {
  .transcription-section-buttons{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    @media (width <= 625px) {
      flex-direction: column;
    }
  }
  .btn-transcript {
    position: relative;
    border-radius: var(--octopus-border-radius);
    overflow: hidden;
    background: var(--octopus-secondary);
    transition: all 0.2s linear 0s;
    
    &.open{
      margin-left:auto;
      @media (width <= 625px) {
        margin-top: 0.5rem;
      }
    }
    &:not(.open){
      margin-right: auto;
    }

    &:not(.open)::before,
    &.open::after {
      content: "➤";
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      height: 100%;
      width: 30px;
      border-radius: 0 50% 50% 0;
      background-color: var(--octopus-background-transparent);
      transform: scale(0, 1);
      transition: all 0.2s linear 0s;
    }

    &:not(.open)::before {
      left: 0;
      transform-origin: left center;
    }

    &.open::after {
      right: -30px;
      transform-origin: center left;
    }

    &.open {
      direction: rtl;
    }

    &:hover {
      text-indent: 30px;
    }

    &:not(.open):hover::before,
    &.open:hover::after {
      text-indent: 0;
    }

    &:not(.open):hover::before {
      transform: scale(1, 1);
    }

    &.open:hover::after {
      transform: scale(-1, 1);
    }
  }

  .transcription-body {
    font-size: var(--octopus-accessibility-font-size);
    position: relative;
    padding: 1rem;
    max-height: 250px;
    display: flex;
    justify-content: center;
    white-space: pre-wrap;
    background: var(--octopus-accessibility-background);
    color: var(--octopus-accessibility-color);

    .transcription-text {
      overflow: hidden auto;
    }

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      padding: 3px;
      background: repeating-conic-gradient(
          var(--octopus-secondary) 0 25%,
          var(--octopus-primary) 0 50%
        )
        0 0/30px 30px round;
      mask:linear-gradient(black 0 0) content-box, linear-gradient(black 0 0);
      mask-composite: exclude;
      pointer-events: none;
    }
  }
}
</style>
