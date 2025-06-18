<template>
  <section class="module-box overflow-visible">
    <div class="d-flex justify-content-between align-items-center">
      <h3 class="mb-3">
        {{ t("Embed") }}
      </h3>
      <div
        v-if="noAd && !generalStore.platformEducation"
        class="sticker"
        :title="t('You cannot insert advertising')"
      >
        {{ t("No advertising") }}
      </div>
    </div>
    <template v-if="!exclusive && (authenticated || notExclusive)">
      <div class="d-flex">
        <iframe
          id="miniplayerIframe"
          title="Miniplayer"
          allowfullscreen="true"
          allow="clipboard-read; clipboard-write; autoplay"
          referrerpolicy="no-referrer-when-downgrade"
          :src="iFrameSrc"
          width="100%"
          :height="iFrameHeight"
          class="max-iframe mx-3"
        />
        <div class="d-flex flex-column flex-grow-1">
          <SharePlayerTypes
            v-model:i-frame-model="iFrameModel"
            v-model:type-custom-player="typeCustomPlayer"
            :podcast="podcast"
            :emission="emission"
            :playlist="playlist"
            :organisation-id="organisationId"
            :is-live="isLiveReadyToRecord"
          />
          <SharePlayerColors
            v-model:color="color"
            v-model:theme="theme"
            class="mt-3"
          />
          <PlayerParameters
            v-model:display-article="displayArticle"
            v-model:display-transcript="displayTranscript"
            v-model:display-wave="displayWave"
            v-model:proceed-reading="proceedReading"
            v-model:is-visible="isVisible"
            v-model:player-auto-play="playerAutoPlay"
            v-model:episodes-number="episodesNumber"
            v-model:insert-code="insertCode"
            :display-is-visible="displayIsVisible"
            :is-podcast-not-visible="isPodcastNotVisible"
            :chose-number-episode="displayChoiceAllEpisodes"
            :display-choice-all-episodes="displayChoiceAllEpisodes"
            :display-transcript-param="displayTranscriptParam"
            :display-article-param="displayArticleParam"
            :display-wave-param="displayWaveParam"
            :display-insert-code="displayInsertCode"
            @episode-choice-display="episodeChoiceDisplay = $event"
          />

          <ShareModalPlayer
            v-if="isShareModal"
            :embed-link="iFrame"
            :embedly-link="iFrameSrc"
            :direct-link="podcast"
            @close="isShareModal = false"
          />
          <button
            class="btn btn-primary w-fit-content mt-3"
            @click="isShareModal = true"
          >
            {{ t("Share the player") }}
          </button>
        </div>
      </div>
    </template>
    <div v-else-if="exclusive && authenticated">
      {{ t("Only organisation members can share the content") }}
    </div>
    <div v-else-if="!authenticated">
      {{ t("Only authenticated members can share the content") }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { Podcast } from "@/stores/class/general/podcast";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
import { useAuthStore } from "../../../stores/AuthStore";
import { useApiStore } from "../../../stores/ApiStore";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { defineAsyncComponent, ref, Ref, computed, onBeforeMount } from "vue";
import { useGeneralStore } from "../../../stores/GeneralStore";
import { useI18n } from "vue-i18n";
const ShareModalPlayer = defineAsyncComponent(
  () => import("../../misc/modal/ShareModalPlayer.vue"),
);
const PlayerParameters = defineAsyncComponent(
  () => import("./PlayerParameters.vue"),
);
const SharePlayerTypes = defineAsyncComponent(
  () => import("./SharePlayerTypes.vue"),
);
const SharePlayerColors = defineAsyncComponent(
  () => import("./SharePlayerColors.vue"),
);


//Props 
const props = defineProps({
  podcast: { default: undefined, type: Object as () => Podcast },
  emission: { default: undefined, type: Object as () => Emission },
  playlist: { default: undefined, type: Object as () => Playlist },
  organisationId: { default: undefined, type: String },
  exclusive: { default: false, type: Boolean },
  notExclusive: { default: true, type: Boolean },
})

//Data 
const typeCustomPlayer = ref("");
const iFrameModel = ref("default");
const isShareModal = ref(false);
const color = ref("#40a372");
const theme = ref("#000000");
const proceedReading = ref(true);
const episodeChoiceDisplay = ref("number");
const episodesNumber = ref(3);
const isVisible = ref(false);
const displayArticle = ref(true);
const displayTranscript = ref(true);
const displayWave = ref(false);
const playerAutoPlay = ref(false);
const insertCode = ref(false);
const orgaAttributes : Ref<{ [key: string]: string | number | boolean | undefined }| undefined>= ref(undefined);


//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const apiStore = useApiStore();
const generalStore = useGeneralStore();
const saveFetchStore = useSaveFetchStore();


//Computed
const authenticated = computed(() => undefined !== authStore.authOrgaId);
const displayWaveParam = computed(() => "default" === iFrameModel.value || "emission" === iFrameModel.value);
const displayIsVisible = computed(() => displayChoiceAllEpisodes.value || isPodcastNotVisible.value);
const isPodcastNotVisible = computed(() => {
  return (
    undefined !== props.podcast &&
    !props.podcast.availability.visibility &&
    !isTypeEmission.value
  );
});
const displayArticleParam = computed(() => {
  return (
    undefined !== props.podcast &&
    undefined !== props.podcast.article &&
    0 !== props.podcast.article.length &&
    ("default" === iFrameModel.value ||
      "large" === iFrameModel.value ||
      "largeMore" === iFrameModel.value)
  );
});
const displayInsertCode = computed(() => {
  let orgaResourceId = "";
  if (props.podcast) {
    orgaResourceId = props.podcast.organisation.id;
  }
  if (props.emission) {
    orgaResourceId = props.emission.orga.id;
  }
  if (props.playlist) {
    orgaResourceId = props.playlist.organisation?.id ?? "";
  }
  return orgaResourceId === authStore.authOrgaId;
});
const displayTranscriptParam = computed(() => isTranscriptionAuthorize.value && (isDefault.value || isEmission.value));
const isTranscriptionAuthorize = computed(() => {
  if (!orgaAttributes.value) {
    return false;
  }
  return orgaAttributes.value &&
    Object.hasOwn(orgaAttributes.value, "speechtotext.active")
    ? (orgaAttributes.value["speechtotext.active"] as boolean)
    : false;
});
const displayChoiceAllEpisodes = computed(() => !props.podcast || isTypeEmission.value);
const isDefault = computed(() => "default" === iFrameModel.value);
const isEmission = computed(() => "emission" === iFrameModel.value);
const isLargeEmission = computed(() => "emissionLarge" === iFrameModel.value);
const isTypeEmission = computed(() => {
  return (
    isEmission.value ||
    isLargeEmission.value ||
    "EMISSION" === typeCustomPlayer.value
  );
});
const isLiveReadyToRecord = computed(() => {
  if (props.podcast)
    return (
      undefined !== props.podcast.conferenceId &&
      0 !== props.podcast.conferenceId &&
      props.podcast.processingStatus === "READY_TO_RECORD"
    );
  return false;
});

const noAd = computed(() => {
  return (
    (props.podcast?.organisation.id !== props.organisationId &&
      "NO" === props.podcast?.monetisable) ||
    ("UNDEFINED" === props.podcast?.monetisable &&
      "NO" === props.podcast?.emission.monetisable)
  );
});
const iFrameSrc = computed(() => {
  if ("video" === iFrameModel.value) {
    return (
      "https://www.ultimedia.com/deliver/generic/iframe/mdtk/01009833/zone/1/showtitle/1/src/" +
      props.podcast?.video?.videoId +
      "/sound/true"
    );
  }
  let url = [""];
  const iFrameNumber =
    displayChoiceAllEpisodes.value && "all" === episodeChoiceDisplay.value
      ? "/0"
      : "/" + episodesNumber.value;
  url.push(`${apiStore.miniplayerUrl}miniplayer/`);
  if (!props.podcast && !props.playlist && props.emission) {
    url = constructEmissionUrl(url);
  } else if (props.playlist) {
    url = constructPlaylistUrl(url);
  } else if (props.emission && props.podcast) {
    url.push(`${iFrameModel.value}/`);
    if (isTypeEmission.value) {
      url.push(
        `${props.emission.emissionId}${iFrameNumber}/${props.podcast.podcastId}`,
      );
    } else {
      url.push(`${props.podcast.podcastId}`);
    }
  }
  return addUrlParameters(url).join("");
});
const iFrameHeight = computed(() => {
  switch (iFrameModel.value) {
    case "video":
      return "281px";
    case "large":
      if (props.podcast) return "140px";
      return "350px";
    case "largeMore":
      return "210px";
    case "emissionLarge":
      return "350px";
    case "emission":
      return "540px";
    case "videoLive":
      return "450px";
    default:
      return "540px";
  }
});
const iFrame = computed(() => {
  const specialDigiteka = props.podcast?.video?.videoId
    ? 'allowfullscreen="true" referrerpolicy="no-referrer-when-downgrade"'
    : "";
  return `<iframe src="${iFrameSrc.value}" width="100%" height="${iFrameHeight.value}" scrolling="no" ${specialDigiteka} allow="clipboard-read; clipboard-write; autoplay"></iframe>`;
});
const dataTitle = computed(() => {
  if (props.podcast) return props.podcast.podcastId;
  if (props.emission) return props.emission.emissionId;
  if (props.playlist) return props.playlist.playlistId;
  return 0;
});


onBeforeMount(()=>initSharePlayer())


//Methods
async function initSharePlayer() {
  orgaAttributes.value = await saveFetchStore.getOrgaAttributes(authStore.authOrgaId ?? "");
  initColor();
  if (isLiveReadyToRecord.value) {
    iFrameModel.value = "large";
  }
  if ("true" === props.podcast?.annotations?.["fromTTS"]) {
    displayTranscript.value = false;
  }
}
function getIframeNumber(): string {
  return displayChoiceAllEpisodes.value && "all" === episodeChoiceDisplay.value
    ? "/0"
    : "/" + episodesNumber.value;
}
function constructEmissionUrl(url: Array<string>) {
  if (!props.emission) {
    return [];
  }
  switch (iFrameModel.value) {
    case "default":
      url.push("emission");
      break;
    case "large":
      url.push("emissionLarge");
      break;
    default:
      url.push(`${iFrameModel.value}`);
      break;
  }
  url.push(`/${props.emission.emissionId}${getIframeNumber()}`);
  return url;
}
function constructPlaylistUrl(url: Array<string>) {
  if (!props.playlist) {
    return [];
  }
  switch (iFrameModel.value) {
    case "default":
      url.push("playlist");
      break;
    case "large":
      url.push("playlistLarge");
      break;
    default:
      url.push(`${iFrameModel.value}`);
      break;
  }
  url.push(`/${props.playlist.playlistId}`);
  return url;
}
function addUrlParameters(url: Array<string>) {
  url.push("?distributorId=" + props.organisationId);
  url.push(
    `&color=${color.value.substring(1)}&theme=${theme.value.substring(1)}`,
  );
  if (!proceedReading.value) {
    url.push("&proceed=false");
  }
  if (!displayArticle.value && displayArticleParam.value) {
    url.push("&article=false");
  }
  if (!displayTranscript.value) {
    url.push("&transcript=false");
  }
  if (!displayWave.value) {
    url.push("&wave=false");
  }
  if (playerAutoPlay.value) {
    url.push("&autoplay=true");
  }
  if (isVisible.value) {
    url.push("&key=" + window.btoa(dataTitle.value.toString()));
  }
  if (insertCode.value) {
    url.push("&insertCode=true");
  }
  return url;
}
function initColor(): void {
  if (!orgaAttributes.value) {
    return;
  }
  color.value = Object.hasOwn(orgaAttributes.value, "COLOR")
    ? (orgaAttributes.value.COLOR as string)
    : "#40a372";
  theme.value = Object.hasOwn(orgaAttributes.value, "THEME")
    ? (orgaAttributes.value.THEME as string)
    : "#000000";
}
</script>

<style lang="scss">

@use "../../../style/iframe";

.octopus-app {
  .sticker {
    align-self: center;
    background: var(--octopus-primary);
    padding: 0.5rem;
    transition: all 0.5s ease;
    color: white;
    font-weight: bold;
    letter-spacing: 1px;
    box-shadow: 10px 10px 34px -15px var(--octopus-shadow);
    border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
    border: solid 2px var(--octopus-gray-text);

    &:hover {
      box-shadow: 2px 8px 4px -6px var(--octopus-shadow);
      background: transparent;
      color: var(--octopus-primary);
    }
  }
}
</style>
