<template>
  <div v-if="!isLoading && !noSharing">
    <button
      id="anonymous-share-button"
      :class="btnClass"
      :title="t('Share')"
    >
      <DotsHorizontalIcon />
    </button>
    <ClassicPopover
      target="anonymous-share-button"
      :relative-class="relativeClass"
      :is-fixed="true"
      :left-pos="true"
      :only-click="true"
    >
      <div  
        v-for="button in dropdownButtons"
        :key="button.icon"
        class="d-flex flex-column"
      >
        <button
          v-if="button.condition"
          :key="button.title"
          class="btn-transparent d-flex flex-nowrap justify-content-start align-items-center octopus-dropdown-item py-2"
          :title="button.title"
          @mousedown="clickButton(button.emitName)"
          @keydown.enter="clickButton(button.emitName)"
        >
          <component :is="button.icon" />
          <span class="ms-1">{{ button.title }}</span>
        </button>
      </div>
    </ClassicPopover>
    <QrCodeModal
      v-if="isQrCodeModal"
      :url-page="urlPage"
      :orga-for-color="organisationId"
      @close="isQrCodeModal = false"
    />
    <PlayerAnonymousModal
      v-if="isPlayerModal"
      :podcast="podcast"
      :emission="emission ?? podcast?.emission"
      :exclusive="!playerCanBeSharedOthers"
      :not-exclusive="playerCanBeSharedAnonymous"
      @close="isPlayerModal = false"
    />
    <NewsletterModal
      v-if="isNewsletterModal"
      :closable="true"
      :podcast="podcast"
      :emission="emission"
      :playlist="playlist"
      @close="isNewsletterModal = false"
    />
    <ClipboardModal
      v-if="isRssModal"
      :link="rssUrl"
      @close="isRssModal = false"
    />
    <SnackBar
      v-if="lazyLoadingSnackbar"
      ref="snackbar"
      position="bottom-left"
    />
  </div>
</template>

<script setup lang="ts">
import QrcodeIcon from "vue-material-design-icons/Qrcode.vue";
import LinkVariantIcon from "vue-material-design-icons/LinkVariant.vue";
import DotsHorizontalIcon from "vue-material-design-icons/DotsHorizontal.vue";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import displayHelper from "../../../helper/displayHelper";
import { computed, defineAsyncComponent, onBeforeMount, ref, useTemplateRef } from "vue";
import { useApiStore } from "../../../stores/ApiStore";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
import { state } from "../../../stores/ParamSdkStore";
import classicApi from "../../../api/classicApi";
import { useI18n } from "vue-i18n";
const SnackBar = defineAsyncComponent(() => import("../../misc/SnackBar.vue"));
const NewsletterModal = defineAsyncComponent(
  () => import("../../misc/modal/NewsletterModal.vue"),
);
const QrCodeModal = defineAsyncComponent(
  () => import("../../misc/modal/QrCodeModal.vue"),
);
const ClipboardModal = defineAsyncComponent(
  () => import("../../misc/modal/ClipboardModal.vue"),
);
const PlayerAnonymousModal = defineAsyncComponent(
  () => import("../sharing/PlayerAnonymousModal.vue"),
);
const CodeTagsIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/CodeTags.vue"),
);
const EmailNewsletterIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/EmailNewsletter.vue"),
);
const RssIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/Rss.vue"),
);

//Props 
const props = defineProps({
  podcast: { default: undefined, type: Object as () => Podcast },
  emission: { default: undefined, type: Object as () => Emission },
  playlist: { default: undefined, type: Object as () => Playlist },
  participantId: { default: undefined, type: Number },
  organisationId: { default: undefined, type: String },
  relativeClass: { default: "page-element", type: String },
  btnClass: { default: "btn btn-transparent", type: String },
})

//Data 
const lazyLoadingSnackbar = ref(false);
const isNewsletterModal = ref(false);
const isQrCodeModal = ref(false);
const displayRss = ref(false);
const noSharing = ref(true);
const playerCanBeSharedAnonymous = ref(false);
const playerCanBeSharedOthers = ref(false);
const isLoading = ref(true);
const isRssModal = ref(false);
const isPlayerModal = ref(false);
const snackBarRef = useTemplateRef('snackbar');


//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const apiStore = useApiStore();
const saveFetchStore = useSaveFetchStore();


//Computed
const urlPage = computed(() => window.location.href);
const isPodcastmaker = computed(() => state.generalParameters.podcastmaker);
const rssUrl = computed(() => {
  const api = apiStore.apiUrl + "rss/";
  if (
    (!isPodcastmaker.value && props.playlist) ||
    props.podcast ||
    props.emission
  ) {
    return "";
  }
  if (props.participantId) {
    return api + "participant/" + props.participantId + ".rss";
  }
  if (props.playlist) {
    return api + "playlist/" + props.playlist.playlistId + ".rss";
  }
  if (props.organisationId) {
    return api + "productor/" + props.organisationId + ".rss";
  }
  return "";
});
const titleRssButton = computed(() => {
  if (props.participantId) {
    return t("Subscribe to this participant");
  }
  if (props.emission) {
    return t("Subscribe to this emission");
  }
  return t("Subscribe to this RSS feed");
});
const dropdownButtons = computed(() => {
  return [
    {
      title: t("Copy this page URL"),
      icon: LinkVariantIcon,
      condition:true,
      emitName: "link",
    },
    {
      title: t("Share the player"),
      icon: CodeTagsIcon,
      condition: !isPodcastmaker.value && (playerCanBeSharedAnonymous.value || (playerCanBeSharedOthers.value && authStore.authOrgaId)),
      emitName: "player",
    },
    {
      title: t("Share newsletter"),
      icon: EmailNewsletterIcon,
      condition: props.podcast || props.emission || props.playlist,
      emitName: "newsletter",
    },
    {
      title: t("Share QR Code"),
      icon: QrcodeIcon,
      condition: true,
      emitName: "qrcode",
    },
    {
      title: titleRssButton.value,
      icon: RssIcon,
      condition: '' !== rssUrl.value && displayRss.value && !authStore.isGarRole,
      emitName: "rss",
    },
  ];
});


onBeforeMount(()=>initShareButtons())


//Methods
async function initShareButtons() {
  if (undefined !== props.participantId) {
    displayRss.value = await classicApi.fetchData<boolean>({
      api: 0,
      path: `rss/participants/allowed/${props.organisationId}`,
      isNotAuth: true,
    });
  } else {
    displayRss.value = true;
  }
  determinePlayerCanBeShared();
  if (!props.organisationId) {
    return;
  }
  const attributes = await saveFetchStore.getOrgaAttributes(props.organisationId);
  noSharing.value = "true" === attributes.noSharing;
  isLoading.value = false;
}
function determinePlayerCanBeShared() {
  const emissionAnnot = props.podcast?.emission.annotations ?? props.emission?.annotations;
  if (!emissionAnnot) { return }
  if (emissionAnnot.exclusive) {
    playerCanBeSharedOthers.value = "true" !== emissionAnnot.exclusive;
  }
  if (emissionAnnot.notExclusive) {
    playerCanBeSharedAnonymous.value = "true" === emissionAnnot.notExclusive;
  }
}
function clickButton(name: string) {
  switch (name) {
    case "link":
      displayHelper.onCopyCode(urlPage.value, afterCopy);
      break;
    case "newsletter":
      isNewsletterModal.value = true;
      break;
    case "qrcode":
      isQrCodeModal.value = true;
      break;
    case "rss":
      isRssModal.value = true;
      break;
    case "player": 
      isPlayerModal.value = true;
      break;
    default:
      break;
  }
}
function afterCopy(): void {
  if (!lazyLoadingSnackbar.value) {
    lazyLoadingSnackbar.value = true;
    setTimeout(() => {
      afterCopy();
    }, 500);
  } else {
    (snackBarRef?.value as InstanceType<typeof SnackBar>).open(t("Link in clipboard"));
  }
}
</script>
