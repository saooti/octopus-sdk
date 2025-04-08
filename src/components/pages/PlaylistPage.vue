<template>
  <section class="page-box">
    <template v-if="loaded && !error && playlist">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="pageTitle"
        :img-url="playlist.imageUrl"
      />
      <div
        class="d-flex flex-column page-element"
        :class="isPodcastmaker ? 'page-element-podcastmaker' : ''"
      >
        <section class="module-box">
          <EditBox v-if="editRight && !isPodcastmaker" :playlist="playlist" />
          <div class="mb-5 mt-3 description-text">
            <img
              v-lazy="useProxyImageUrl(playlist.imageUrl, '250')"
              width="250"
              height="250"
              role="presentation"
              alt=""
              :title="$t('Playlist name image', { name: name })"
              class="img-box float-start me-3 mb-3"
            />
            <div class="d-flex align-items-center justify-content-between">
              <h2>{{ name }}</h2>
              <ShareAnonymous v-if="!editRight" class="d-flex justify-content-end flex-grow-1" :playlist="playlist" :organisation-id="playlist.organisation?.id"/>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <p class="html-wysiwyg-content" v-html="urlify(description)" />
            <!-- eslint-enable -->
          </div>
        </section>
        <SharePlayer
          v-if="!isPodcastmaker && editRight"
          :playlist="playlist"
          :organisation-id="authOrgaId"
        />
        <ShareSocialsButtons
          v-if="pageParameters.isShareButtons"
          :organisation-id="playlist.organisation.id"
        />
        <section class="module-box">
          <PodcastList :playlist="playlist" />
        </section>
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded ? $t('Loading content ...') : undefined"
      :error-text="error ? $t(`Playlist doesn't exist`) : undefined"
    />
  </section>
</template>

<script lang="ts">
import { useGeneralStore } from "../../stores/GeneralStore";
import { useAuthStore } from "../../stores/AuthStore";
import { mapActions, mapState } from "pinia";
import {useOrgaComputed} from "../composable/useOrgaComputed";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import ClassicLoading from "../form/ClassicLoading.vue";
import PodcastList from "../display/playlist/PodcastList.vue";
import classicApi from "../../api/classicApi";
import { useFilterStore } from "../../stores/FilterStore";
import { state } from "../../stores/ParamSdkStore";
import displayHelper from "../../helper/displayHelper";
import {useImageProxy} from "../composable/useImageProxy";
import {useErrorHandler} from "../composable/useErrorHandler";
import { Playlist } from "@/stores/class/general/playlist";
import { defineComponent, defineAsyncComponent } from "vue";
import { AxiosError } from "axios";
const ShareSocialsButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareSocialsButtons.vue"),
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
const ShareAnonymous = defineAsyncComponent(() => import("../display/sharing/ShareAnonymous.vue"));
export default defineComponent({
  components: {
    ShareSocialsButtons,
    EditBox,
    PodcastList,
    SharePlayer,
    ClassicLoading,
    PodcastmakerHeader,
    ShareAnonymous
  },

  props: {
    playlistId: { default: undefined, type: Number },
  },
  setup(){
    const { useProxyImageUrl } = useImageProxy();
    const { isPodcastmaker, isEditRights, authOrgaId } = useOrgaComputed();
    const { updatePathParams } = useSeoTitleUrl();
    const {handle403} = useErrorHandler();
    return { useProxyImageUrl, isPodcastmaker, isEditRights, authOrgaId, updatePathParams, handle403 }
  },
  data() {
    return {
      loaded: false as boolean,
      playlist: undefined as Playlist | undefined,
      error: false as boolean,
    };
  },
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
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
    urlify(text:string|undefined){
      return displayHelper.urlify(text);
    },
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
        this.updatePathParams(this.playlist.title);
      } catch (error) {
        this.handle403(error as AxiosError);
        this.initError();
      }
      this.loaded = true;
    },
  },
});
</script>
