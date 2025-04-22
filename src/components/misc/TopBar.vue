<template>
  <header
    class="header-saooti-play"
    :style="headerBackgroundImage"
    :class="[contentToDisplay ? 'header-img-bg':'header-color-bg', scrolled? 'scrolled':'', needToBlur ? 'header-force-blur':'']"
  >
    <TopBarMainContent
      :is-phone="isPhone"
      :scrolled="scrolled"
      :title-display="titleToDisplay"
      style="height: var(--header-size);"
      :class="headerBackgroundImage.length ? 'header-opacity':''"
    />
  </header>
  <div v-if="contentToDisplay" class="header-content-bg" :style="headerBackgroundImage" :class="{ scrolled: scrolled, 'header-force-blur':needToBlur }" >
    <div class="header-additional-content header-content">
      <h1 v-if="!scrolled" class="text-truncate">
        {{ titleToDisplay }}
      </h1>
      <SubscribeButtons
        v-if="!isGarRole"
        v-show="!scrolled"
        :emission="emissionObject"
        :playlist-id="contentToDisplay?.playlistId"
        :window-width="windowWidth"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {useImageProxy} from "../composable/useImageProxy";
import TopBarMainContent from "./TopBarMainContent.vue";
import { mapState } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
import { useAuthStore } from "../../stores/AuthStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Emission } from "@/stores/class/general/emission";
import {useResizePhone} from "../composable/useResizePhone";
import { Playlist } from "@/stores/class/general/playlist";
import { Canal } from "@/stores/class/radio/canal";
import axios from "axios";
const SubscribeButtons = defineAsyncComponent(
  () => import("../display/sharing/SubscribeButtons.vue"),
);
export default defineComponent({
  name: "TopBar",
  components: {
    TopBarMainContent,
    SubscribeButtons,
  },
  setup(){
    const { isPhone, windowWidth } = useResizePhone();
    const { useProxyImageUrl } = useImageProxy();
    return { isPhone, windowWidth, useProxyImageUrl }
  },

  data() {
    return {
      scrolled: false as boolean,
      oldScrollY: 0 as number,
      minScroll: 0 as number,
      headerBackgroundImage: "" as string,
      needToBlur: false as boolean,
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
  watch:{
    contentToDisplay: {
      deep: true,
      immediate: true,
      async handler() {
        if(!this.contentToDisplay){
          this.headerBackgroundImage = "";
          this.needToBlur = false;
          return;
        }
        const proxyUrl = this.useProxyImageUrl(this.contentToDisplay.imageUrl,"270", undefined, true);
        try {
          const result = await axios.get(proxyUrl);
          this.headerBackgroundImage = `background-image: url('${result.data}');`;
          if(result.data !== this.contentToDisplay.imageUrl){
            this.needToBlur = false;
          }else{
            this.needToBlur = true;
          }
        } catch {
          this.headerBackgroundImage = this.contentToDisplay.imageUrl ? `background-image: url('${this.contentToDisplay.imageUrl}');` : "";
          this.needToBlur = true;
        }
      },
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
  --header-size: 5rem;
  --header-additional-content-size: 22rem;
  @media (width <= 650px) {
    --header-size: 3.5rem;
  }
  @media (width <= 550px) {
    --header-additional-content-size: 13rem;
  }
  .header-saooti-play{
    z-index: 11;
    position: sticky;
    top: 0;
    &.header-img-bg{
      background-position: center -20vw;
      background-repeat: no-repeat;
      background-size: cover;
    }
    &.header-color-bg{
      background: var(--octopus-primary);
      background: linear-gradient(
        90deg,
        var(--octopus-primary) 0%,
        var(--octopus-tertiary) 100%
      );
    }
    &.header-color-bg, &.scrolled{
      box-shadow: 0 2px 15px 5px var(--octopus-shadow) !important; 
    }
  }
  .header-content-bg{
    background-position: center calc(calc(var(--header-size) * -1) - 20vw);
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    display: flex;
    transition: height 0.7s;
    height: calc(var(--header-additional-content-size) - var(--header-size));
    &.scrolled {
      height: 0rem;
    }
  }
  .header-additional-content{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .header-additional-content, .header-opacity{
    background: oklch(0 0 0 / 0.5);
  }
  .header-force-blur .header-additional-content, .header-force-blur .header-opacity{
    backdrop-filter: blur(8px);
  }
  .header-content{
    *:focus-visible {
      box-shadow: 0 0 10px 1px white !important;
    }
    h1 {
      color: white !important;
      font-size: 1.8rem;
      margin: 2rem 5rem;
      @media (width <= 550px) {
        font-size: 1rem;
        margin: 1rem 0.5rem 0.5rem;
      }
    }
    .admin-button:hover,
    .share-btn:hover {
      background: white;
    }
  }
}
</style>
