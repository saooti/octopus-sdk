<template>
  <ListPaginate
    id="playlistListPaginate"
    v-model:first="dfirst"
    v-model:rowsPerPage="dsize"
    v-model:isMobile="isMobile"
    :text-count="
      displayCount > 1
        ? `${$t('Number playlists', { nb: displayCount })}`
        : undefined
    "
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading ? $t('Loading content ...') : undefined"
  >
    <template #list>
      <div class="emission-list two-emissions">
        <template v-for="p in displayArray" :key="p.playlistId">
          <PlaylistItem v-if="0 !== p.playlistId" :playlist="p" />
        </template>
      </div>
    </template>
  </ListPaginate>
</template>

<script lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import { handle403 } from "../../mixins/handle403";
import octopusApi from "@saooti/octopus-api";
import PlaylistItem from "./PlaylistItem.vue";
import { Playlist, emptyPlaylistData } from "@/stores/class/general/playlist";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { AxiosError } from "axios";
export default defineComponent({
  name: "PlaylistList",

  components: {
    PlaylistItem,
    ListPaginate,
  },

  mixins: [handle403],

  props: {
    first: { default: 0, type: Number },
    size: { default: 30, type: Number },
    query: { default: undefined, type: String },
    organisationId: { default: undefined, type: String },
  },

  data() {
    return {
      loading: true as boolean,
      dfirst: this.first,
      dsize: this.size,
      totalCount: 0 as number,
      displayCount: 0 as number,
      playlists: [] as Array<Playlist>,
      isMobile: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    displayArray(): Array<Playlist> {
      if (this.isMobile) {
        return this.playlists;
      }
      return this.playlists.slice(
        this.dfirst,
        Math.min(this.dfirst + this.dsize, this.totalCount),
      );
    },
    changed(): string {
      return `${this.first}|${this.size}|${this.organisationId}|${this.query}`;
    },
    sort(): string {
      return !this.query ? "NAME" : "SCORE";
    },
    organisation(): string | undefined {
      return this.organisationId ? this.organisationId : this.filterOrgaId;
    },
  },
  watch: {
    changed(): void {
      this.reloadList();
    },
    dsize(): void {
      this.reloadList();
    },
    dfirst(): void {
      if (
        !this.playlists[this.dfirst] ||
        0 === this.playlists[this.dfirst].playlistId
      ) {
        this.fetchContent(false);
      }
    },
  },

  mounted() {
    this.fetchContent(true);
  },
  methods: {
    reloadList() {
      this.dfirst = 0;
      this.fetchContent(true);
    },
    async fetchContent(reset: boolean): Promise<void> {
      this.loading = true;
      const param = {
        first: this.dfirst,
        size: this.dsize,
        query: this.query,
        organisationId: this.organisation,
        type: "NONE",
        sort: this.sort,
      };
      try {
        const data = await octopusApi.fetchDataWithParams<{
          count: number;
          result: Array<Playlist>;
          sort: string;
        }>(0, "playlist/search", param, true);
        this.afterFetching(reset, data);
      } catch (error) {
        this.handle403(error as AxiosError);
      }
    },
    afterFetching(
      reset: boolean,
      data: { count: number; result: Array<Playlist>; sort: string },
    ): void {
      if (reset) {
        this.playlists.length = 0;
      }
      if (this.dfirst > this.playlists.length) {
        for (
          let i = this.playlists.length - 1, len = this.dfirst + this.dsize;
          i < len;
          i++
        ) {
          this.playlists.push(emptyPlaylistData());
        }
      }
      this.displayCount = data.count;
      const responsePlaylists = data.result.filter((e: Playlist | null) => {
        if (null === e) {
          this.displayCount--;
        }
        return null !== e;
      });
      this.playlists = this.playlists
        .slice(0, this.dfirst)
        .concat(responsePlaylists)
        .concat(
          this.playlists.slice(this.dfirst + this.dsize, this.playlists.length),
        );
      this.totalCount = data.count;
      this.loading = false;
    },
    displayMore(): void {
      this.fetchContent(false);
    },
  },
});
</script>
