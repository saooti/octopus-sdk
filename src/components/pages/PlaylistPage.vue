<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="pageTitle"
        :image-url="playlist.imageUrl"
      />
      <div
        class="d-flex flex-column page-element"
        :class="isPodcastmaker ? 'page-element-podcastmaker' : ''"
      >
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
          <EditBox v-if="editRight && !isPodcastmaker" :playlist="playlist" />
        </div>
        <SharePlayer
          v-if="!isPodcastmaker && undefined !== authOrgaId"
          :playlist="playlist"
          :organisation-id="authOrgaId"
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
import { useGeneralStore } from "../../stores/GeneralStore";
import { useAuthStore } from "../../stores/AuthStore";
import { mapActions, mapState } from "pinia";
import { orgaComputed } from "../mixins/orgaComputed";
import ClassicLoading from "../form/ClassicLoading.vue";
import PodcastList from "../display/playlist/PodcastList.vue";
import classicApi from "../../api/classicApi";
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
    PodcastmakerHeader,
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
    ...mapState(useAuthStore, ["isRolePlaylists"]),
    pageParameters() {
      return {
        isShareButtons: state.podcastPage.ShareButtons as boolean,
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
    name(): string {
      return this.playlist?.title ?? "";
    },
    description(): string {
      return this.playlist?.description ?? "";
    },
    editRight(): boolean {
      return this.isEditRights(
        this.playlist?.organisation?.id,
        this.isRolePlaylists,
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
  beforeUnmount() {
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
        this.playlist = await classicApi.fetchData<Playlist>({
          api: 0,
          path: "playlist/" + this.playlistId,
        });
        if (
          (!this.editRight && this.playlistRadio) ||
          ("PUBLIC" !== this.playlist.organisation?.privacy &&
            this.filterOrgaId !== this.playlist.organisation?.id &&
            this.$route.query.productor !== this.playlist.organisation?.id)
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
