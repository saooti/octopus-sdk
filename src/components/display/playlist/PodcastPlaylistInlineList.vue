<template>
  <div
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
    class="d-flex flex-column p-3 playlist-inline-podcast"
  >
    <h2>{{ title }}</h2>
    <div v-if="!overflowScroll" class="d-flex justify-content-end hide-phone">
      <button
        class="btn admin-button m-1 saooti-left"
        :class="{ disabled: !previousAvailable }"
        :title="$t('Display previous')"
        @click="displayPrevious()"
      />
      <button
        class="btn admin-button m-1 saooti-right"
        :class="{ disabled: !nextAvailable }"
        :title="$t('Display next')"
        @click="displayNext()"
      />
    </div>
    <ClassicLoading
      :loading-text="loading ? $t('Loading podcasts ...') : undefined"
    />
    <transition-group
      :name="transitionName"
      class="element-list-inline"
      tag="div"
      :class="[
        alignLeft ? 'justify-content-start' : '',
        overflowScroll ? 'overflowScroll' : '',
      ]"
      :css="isInlineAnimation"
    >
      <PodcastItem
        v-for="p in podcasts"
        :key="p.podcastId"
        class="flex-shrink-0 item-phone-margin"
        :podcast="p"
        :class="[alignLeft ? 'me-3' : '']"
      />
    </transition-group>
    <router-link
      class="btn btn-primary align-self-center width-fit-content m-4"
      :to="{
        name: 'playlist',
        params: { playlistId: playlistId.toString() },
      }"
    >
      {{ $t("See more") }}
      <div class="ms-1 saooti-more" />
    </router-link>
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import domHelper from "../../../helper/dom";
import PodcastItem from "../podcasts/PodcastItem.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
const PHONE_WIDTH = 960;
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Playlist } from "@/stores/class/general/playlist";
import resizePhone from "../../mixins/resizePhone";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastPlaylistInlineList",

  components: {
    PodcastItem,
    ClassicLoading,
  },
  mixins: [resizePhone],

  props: {
    playlistId: { default: undefined, type: Number },
  },

  data() {
    return {
      loading: true as boolean,
      index: 0 as number,
      first: 0 as number,
      size: 5 as number,
      totalCount: 0 as number,
      playlist: undefined as Playlist | undefined,
      allPodcasts: [] as Array<Podcast>,
      direction: 1 as number,
      alignLeft: false as boolean,
      isPhone: false as boolean,
      windowWidth: 0 as number
    };
  },
  computed: {
    title(): string {
      return this.playlist?.title ?? "";
    },
    podcasts(): Array<Podcast> {
      return this.allPodcasts.slice(this.index, this.index + this.size);
    },
    sizeItem(): number {
      return state.generalParameters.podcastItem
        ? state.generalParameters.podcastItem
        : 13;
    },
    overflowScroll(): boolean {
      return state.emissionPage.overflowScroll as boolean;
    },
    isInlineAnimation(): boolean {
      return state.generalParameters.isInlineAnimation as boolean;
    },
    previousAvailable(): boolean {
      return this.index > 0;
    },
    nextAvailable(): boolean {
      return this.index + this.size < this.totalCount;
    },
    transitionName(): string {
      return this.direction > 0 ? "out-left" : "out-right";
    },
  },
  watch: {
    playlistId(): void {
      this.reset();
      this.fetchContent();
    },
    windowWidth(){
      if (!this.$el) return;
      if (this.overflowScroll) {
        this.size = 20;
        return;
      }
      if (this.windowWidth <= PHONE_WIDTH) {
        this.size = 10;
        return;
      }
      const width = (this.$el as HTMLElement).offsetWidth;
      const sixteen = domHelper.convertRemToPixels(this.sizeItem + 0.8);
      this.size = Math.floor(width / sixteen);
    }
  },

  mounted() {
    this.fetchContent();
  },
  methods: {
    async fetchContent(): Promise<void> {
      this.allPodcasts.length = 0;
      this.loading = true;
      this.playlist = await octopusApi.fetchData<Playlist>(
        0,
        "playlist/" + this.playlistId,
      );
      this.allPodcasts = await octopusApi.fetchData<Array<Podcast>>(
        0,
        "playlist/" + this.playlistId + "/content",
      );
      if (
        !(
          (state.generalParameters.authenticated &&
            state.generalParameters.organisationId ===
              this.playlist?.organisation?.id) ||
          state.generalParameters.isAdmin
        )
      ) {
        this.allPodcasts = this.allPodcasts.filter((p: Podcast | null) => {
          return (
            null !== p &&
            (!p.availability || true === p.availability.visibility)
          );
        });
      }
      this.alignLeft = this.allPodcasts.length <= 3;
      this.loading = false;
    },
    displayPrevious(): void {
      this.direction = -1;
      if (this.previousAvailable) {
        this.index -= 1;
      }
    },
    displayNext(): void {
      this.direction = 1;
      if (!this.nextAvailable) return;
      this.index += 1;
    },
    reset(): void {
      this.index = 0;
      this.first = 0;
      this.totalCount = 0;
      this.allPodcasts.length = 0;
    },
  },
});
</script>
