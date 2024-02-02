<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :pageTitle="pageTitle"
        :imageUrl="playlist.imageUrl"
      />
      <div class="d-flex flex-column page-element">
        <div class="module-box">
          <div class="mb-5 mt-3 descriptionText">
            <img
              v-lazy="proxyImageUrl(playlist.imageUrl, '250')"
              width="250"
              height="250"
              :alt="$t('Playlist name image', { name: name })"
              class="img-box float-start me-3 mb-3"
            />
            <h2>{{ name }}</h2>
            <!-- eslint-disable vue/no-v-html -->
            <p class="html-wysiwyg-content" v-html="urlify(description)" />
            <!-- eslint-enable -->
          </div>
          <EditBox
            v-if="editRight && pageParameters.isEditBox"
            :playlist="playlist"
          />
        </div>
        <SharePlayer
          v-if="pageParameters.isSharePlayer && authenticated"
          :playlist="playlist"
          :organisation-id="myOrganisationId"
          :is-education="isEducation"
        />
        <ShareButtons
          v-if="pageParameters.isShareButtons"
          :playlist="playlist"
          :organisation-id="playlist.organisation.id"
        />
        <PodcastList :playlist="playlist" />
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded ? $t('Loading content ...') : undefined"
      :error-text="error ? $t(`Playlist doesn't exist`) : undefined"
    />
  </div>
</template>

<script lang="ts">
import { useGeneralStore } from "@/stores/GeneralStore";
import { mapActions } from "pinia";
import { orgaComputed } from "../mixins/orgaComputed";
import ClassicLoading from "../form/ClassicLoading.vue";
import PodcastList from "../display/playlist/PodcastList.vue";
import octopusApi from "@saooti/octopus-api";
import { state } from "../../stores/ParamSdkStore";
import displayMethods from "../mixins/displayMethods";
import imageProxy from "../mixins/imageProxy";
import { handle403 } from "../mixins/handle403";
import { Playlist } from "@/stores/class/general/playlist";
import { defineComponent, defineAsyncComponent } from "vue";
import { AxiosError } from "axios";
const ShareButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareButtons.vue"),
);
const EditBox = defineAsyncComponent(
  () => import("@/components/display/edit/EditBox.vue"),
);
const SharePlayer = defineAsyncComponent(
  () => import("../display/sharing/SharePlayer.vue"),
);
const PodcastmakerHeader = defineAsyncComponent(
  () => import("../display/podcastmaker/PodcastmakerHeader.vue"),
);
export default defineComponent({
  components: {
    ShareButtons,
    EditBox,
    PodcastList,
    SharePlayer,
    ClassicLoading,
    PodcastmakerHeader
  },
  mixins: [displayMethods, handle403, orgaComputed, imageProxy],

  props: {
    playlistId: { default: undefined, type: Number },
    isEducation: { default: false, type: Boolean },
  },

  emits: ["playlistTitle"],
  data() {
    return {
      loaded: false as boolean,
      playlist: undefined as Playlist | undefined,
      error: false as boolean,
    };
  },
  computed: {
    pageParameters() {
      return {
        isEditBox: state.podcastPage.EditBox as boolean,
        isShareButtons: state.podcastPage.ShareButtons as boolean,
        isSharePlayer: state.podcastPage.SharePlayer as boolean,
      };
    },
    pageTitle(): string {
      return this.playlistRadio
        ? this.$t("Mix of episodes")
        : this.$t("Playlist");
    },
    playlistRadio(): boolean {
      return (
        "AMBIANCE" === this.playlist?.ambianceType ||
        "AMBIANCE_PROGRAMMED" === this.playlist?.ambianceType
      );
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    name(): string {
      return this.playlist?.title ?? "";
    },
    description(): string {
      return this.playlist?.description ?? "";
    },
    editRight(): boolean {
      return (
        (true === state.generalParameters.isPlaylist &&
          this.myOrganisationId === this.playlist?.organisation?.id) ||
        true === state.generalParameters.isAdmin
      );
    },
  },
  watch: {
    playlistId: {
      immediate: true,
      handler() {
        this.getPlaylistDetails();
      },
    },
  },
  beforeUnmount(){
    this.contentToDisplayUpdate(null);
  },

  methods: {
    ...mapActions(useGeneralStore, ["contentToDisplayUpdate"]),
    initError(): void {
      this.error = true;
      this.loaded = true;
    },
    async getPlaylistDetails(): Promise<void> {
      try {
        this.loaded = false;
        this.error = false;
        this.playlist = await octopusApi.fetchData<Playlist>(
          0,
          "playlist/" + this.playlistId,
        );
        if (
          (!this.editRight && this.playlistRadio) ||
          ("PUBLIC" !== this.playlist.organisation?.privacy &&
            this.filterOrgaId !== this.playlist.organisation?.id)
        ) {
          this.initError();
          return;
        }
        this.contentToDisplayUpdate(this.playlist);
        this.$emit("playlistTitle", this.playlist.title);
      } catch (error) {
        this.handle403(error as AxiosError);
        this.initError();
      }
      this.loaded = true;
    },
  },
});
</script>
