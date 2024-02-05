<template>
  <div
    class="top-bar-container"
    :class="{ scrolled: scrolled, 'content-top-bar': isContentToDisplay }"
  >
    <TopBarMainContent
      :is-education="isEducation"
      :is-phone="isPhone"
      :scrolled="scrolled"
      :title-display="titleToDisplay"
    />
    <template v-if="isContentToDisplay">
      <div class="page-element-bg" :style="backgroundDisplay" />
      <h1 v-show="!scrolled" class="text-truncate">{{ titleToDisplay }}</h1>
      <SubscribeButtons
        v-show="!scrolled"
        :emission="emissionObject"
        :playlist-id="contentToDisplay?.playlistId"
        :window-width="windowWidth"
      />
    </template>
  </div>
</template>

<script lang="ts">
import imageProxy from "../mixins/imageProxy";
import TopBarMainContent from "./TopBarMainContent.vue";
import { mapState } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
import { useGeneralStore } from "@/stores/GeneralStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Emission } from "@/stores/class/general/emission";
import resizePhone from "../mixins/resizePhone";
import { Playlist } from "@/stores/class/general/playlist";
import { Canal } from "@/stores/class/radio/canal";
const SubscribeButtons = defineAsyncComponent(
  () => import("../display/sharing/SubscribeButtons.vue"),
);
export default defineComponent({
  name: "TopBar",
  components: {
    TopBarMainContent,
    SubscribeButtons,
  },

  mixins: [imageProxy, resizePhone],

  props: {
    isEducation: { default: false, type: Boolean },
  },
  data() {
    return {
      scrolled: false as boolean,
      oldScrollY: 0 as number,
      minScroll: 0 as number,
      isPhone: false as boolean,
      windowWidth: 0 as number,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ["contentToDisplay"]),
    isContentToDisplay(): boolean {
      return null !== this.contentToDisplay;
    },
    backgroundDisplay(): string {
      if (!this.contentToDisplay) {
        return "";
      }
      return `background-image: url('${this.proxyImageUrl(
        this.contentToDisplay.imageUrl,
        "270",
      )}');`;
    },
    titleToDisplay(): string {
      if ((this.contentToDisplay as Podcast)?.podcastId) {
        return (this.contentToDisplay as Podcast).emission.name;
      }
      if ((this.contentToDisplay as Playlist)?.playlistId) {
        return (this.contentToDisplay as Playlist).title;
      }
      if ((this.contentToDisplay as Emission)?.emissionId) {
        return (this.contentToDisplay as Emission).name;
      }
      if ((this.contentToDisplay as Canal)?.id) {
        return (this.contentToDisplay as Canal).name;
      }
      return "";
    },
    emissionObject(): Emission | null {
      if ((this.contentToDisplay as Podcast)?.podcastId) {
        return (this.contentToDisplay as Podcast).emission;
      }
      if ((this.contentToDisplay as Emission)?.emissionId) {
        return this.contentToDisplay as Emission;
      }
      return null;
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll(): void {
      if (
        window.scrollY - this.oldScrollY > 0 &&
        window.scrollY > 1 &&
        document.body.offsetHeight - window.innerHeight > 40
      ) {
        this.scrolled = true;
        this.minScroll = 0;
      } else if (
        window.scrollY - this.oldScrollY < 0 &&
        window.scrollY < 1 &&
        this.minScroll > 20
      ) {
        this.scrolled = false;
        this.minScroll = 0;
      }
      this.oldScrollY = window.scrollY;
      if (this.minScroll < window.scrollY) {
        this.minScroll = window.scrollY;
      }
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .top-bar-container {
    position: sticky;
    top: 0;
    background: $octopus-primary-color;
    background: linear-gradient(
      90deg,
      $octopus-primary-color 0%,
      $blue-octopus 100%
    );
    width: 100%;
    height: 5rem;
    display: flex;
    flex-direction: column;
    transition: height 0.7s;
    box-shadow: 0px 2px 15px 5px rgba(0, 0, 0, 0.4) !important;

    &.content-top-bar {
      height: 22rem;
      background: black;
      .page-element-bg {
        height: 22rem;
      }
    }
    &.content-top-bar.scrolled {
      height: 5rem;
      .page-element-bg {
        height: 5rem;
      }
    }

    &.scrolled {
      z-index: 11;
    }

    h1 {
      color: white !important;
      font-size: 2rem;
      margin: 2rem 5rem;
    }
    @media (max-width: 650px) {
      height: 3.5rem;
      &.content-top-bar.scrolled {
        height: 3.5rem;
        .page-element-bg {
          height: 3.5rem;
        }
      }
    }

    @media (max-width: 550px) {
      h1 {
        font-size: 1rem;
        margin: 1rem 0.5rem 0.5rem 0.5rem;
      }
      &.content-top-bar {
        height: 13rem;
        .page-element-bg {
          height: 13rem;
        }
      }
    }
    .page-element-bg {
      opacity: 0.5;
      filter: blur(8px);
      -webkit-filter: blur(8px);
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      width: 100%;
      position: absolute;
      z-index: -1;
      transition: height 0.7s;
    }

    .admin-button:hover,
    .share-btn:hover {
      background: white;
    }
  }
}
</style>
