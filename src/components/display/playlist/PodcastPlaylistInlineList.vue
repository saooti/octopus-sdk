<template>
  <PodcastInlineListTemplate
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
    :display-arrow="false"
    :button-text="$t('See more')"
    :button-plus="true"
    :title="playlist?.title ?? ''"
    :href="'/main/pub/playlist/' + playlistId"
    :podcast-id="playlistId"
  >
    <template #list-inline>
      <ClassicLoading
        class="loading-size"
        :loading-text="loading ? $t('Loading podcasts ...') : undefined"
      />
      <SwiperList v-if="!loading" :list-object="allPodcasts" :sizeItemOverload="sizeItemOverload">
        <template #octopusSlide="{ option }">
          <PodcastItem
            class="flex-shrink-0 item-phone-margin"
            :podcast="option"
          />
        </template>
      </SwiperList>
    </template>
  </PodcastInlineListTemplate>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import PodcastInlineListTemplate from "../podcasts/PodcastInlineListTemplate.vue";
import PodcastItem from "../podcasts/PodcastItem.vue";
import SwiperList from "../list/SwiperList.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Playlist } from "@/stores/class/general/playlist";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastPlaylistInlineList",

  components: {
    PodcastItem,
    ClassicLoading,
    PodcastInlineListTemplate,
    SwiperList,
  },

  props: {
    playlistId: { default: undefined, type: Number },
    sizeItemOverload: { default: undefined, type: Number },
  },

  data() {
    return {
      loading: true as boolean,
      totalCount: 0 as number,
      playlist: undefined as Playlist | undefined,
      allPodcasts: [] as Array<Podcast>,
    };
  },
  computed: {},
  watch: {
    playlistId(): void {
      this.reset();
      this.fetchContent();
    },
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
      this.loading = false;
    },
    reset(): void {
      this.totalCount = 0;
      this.allPodcasts.length = 0;
    },
  },
});
</script>
