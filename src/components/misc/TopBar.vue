<template>
  <header
    class="top-bar-container"
    :class="{ scrolled: scrolled, 'content-top-bar': isContentToDisplay }"
  >
    <TopBarMainContent
      class="top-bar-z-index"
      :is-phone="isPhone"
      :scrolled="scrolled"
      :title-display="titleToDisplay"
    />
    <template v-if="contentToDisplay">
      <div class="page-element-bg" :style="backgroundDisplay" />
      <h1 v-if="!scrolled" class="text-truncate top-bar-z-index">
        {{ titleToDisplay }}
      </h1>
      <SubscribeButtons
        v-if="!isGarRole"
        v-show="!scrolled"
        class="top-bar-z-index"
        :emission="emissionObject"
        :playlist-id="contentToDisplay?.playlistId"
        :window-width="windowWidth"
      />
    </template>
  </header>
</template>

<script lang="ts">
import imageProxy from "../mixins/imageProxy";
import TopBarMainContent from "./TopBarMainContent.vue";
import { mapState } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
import { useAuthStore } from "../../stores/AuthStore";
import { useGeneralStore } from "../../stores/GeneralStore";
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
    ...mapState(useAuthStore, ["isGarRole"]),
    ...mapState(useGeneralStore, ["contentToDisplay"]),
    isContentToDisplay(): boolean {
      return (
        "podcast" === this.$route.name ||
        "emission" === this.$route.name ||
        "playlist" === this.$route.name ||
        "radio" === this.$route.name
      );
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
        if (!this.scrolled) {
          this.scrolled = true;
          this.minScroll = 0;
        }
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


.octopus-app {
  .top-bar-container {
    *:focus-visible {
      box-shadow: 0 0 10px 1px white !important;
    }

    background: var(--octopus-primary);
    background: linear-gradient(
      90deg,
      var(--octopus-primary) 0%,
      var(--octopus-tertiary) 100%
    );
    width: 100%;
    height: 5rem;
    display: flex;
    flex-direction: column;
    transition: height 0.7s;
    box-shadow: 0 2px 15px 5px var(--octopus-shadow) !important;

    .page-element-bg {
      opacity: 0.5;
      filter: blur(8px);
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      width: 100%;
      position: absolute;
      transition: height 0.7s;
    }

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

    &:not(.scrolled) {
      position: relative;
    }

    &.scrolled {
      z-index: 11;
      position: sticky;
      top: 0;
    }

    .top-bar-z-index {
      z-index: 1;
    }

    h1 {
      color: white !important;
      font-size: 1.8rem;
      margin: 2rem 5rem;
    }

    @media (width <= 650px) {
      height: 3.5rem;

      &.content-top-bar.scrolled {
        height: 3.5rem;

        .page-element-bg {
          height: 3.5rem;
        }
      }
    }

    @media (width <= 550px) {
      h1 {
        font-size: 1rem;
        margin: 1rem 0.5rem 0.5rem;
      }

      &.content-top-bar {
        height: 13rem;

        .page-element-bg {
          height: 13rem;
        }
      }
    }



    .admin-button:hover,
    .share-btn:hover {
      background: white;
    }
  }
}
</style>
