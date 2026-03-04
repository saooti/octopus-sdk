<template>
  <div class="d-flex flex-column align-items-center">
    <div class="d-flex flex-grow-1">
      <div class="d-flex flex-column flex-shrink-0 me-3">
        <h2 class="mb-3">
          {{ t("Configure your Newsletter tile") }}
        </h2>
        <div
          v-for="colors in arrayColors"
          :key="colors.mainText"
          class="d-flex align-items-center mb-3"
        >
          <VSwatches
            v-model="colors.color"
            class="c-hand me-2"
            show-fallback
            fallback-input-type="color"
            colors="text-advanced"
            popover-to="right"
            :data-color="colors.color"
          />
          <div class="d-flex flex-column">
            <div class="fw-bold">{{ colors.mainText }}</div>
            <div v-if="colors.secondText" class="description-text">
              {{ colors.secondText }}
            </div>
          </div>
        </div>
      </div>
      <!-- eslint-disable vue/no-v-html -->
      <div class="border p-3" v-html="newsletterHtml" />
      <!-- eslint-enable -->
    </div>
    <ClassicCopyButton
      :text="t('Copy code')"
      :text-after-copy="t('Code copied!')"
      :data-to-copy="newsletterHtml"
    />
    <div>{{ t("And paste it in your newsletter") }}</div>
  </div>
</template>

<script setup lang="ts">
import ClassicCopyButton from "../../form/ClassicCopyButton.vue";
import { VSwatches } from "vue3-swatches";
import "vue3-swatches/dist/style.css";
import { Podcast } from "@/stores/class/general/podcast";
import { computed, onBeforeMount, ref } from "vue";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { useFilterStore } from "../../../stores/FilterStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

//Props 
const props = defineProps({
  podcast: { default: undefined, type: Object as () => Podcast },
  emission: { default: undefined, type: Object as () => Emission },
  playlist: { default: undefined, type: Object as () => Playlist },
})

const { t } = useI18n();

//Data 
const shareUrl = ref(window.location.origin);
const arrayColors = ref([
  {
    color: "#40a372",
    mainText: t("Choose main color"),
    secondText: t("Newsletter elements"),
  },
  { color: "#000000", mainText: t("Choose text color") },
  { color: "#FFFFFF", mainText: t("Choose background color") },
]);

//Composables
const filterStore = useFilterStore();
const authStore = useAuthStore();
const saveFetchStore = useSaveFetchStore();
const router = useRouter();

//Computed
const pathShare = computed(() => {
  const orga = filterStore.filterOrgaId ? "?productor="+filterStore.filterOrgaId : "";
  if(props.podcast) {
    return router.resolve({ name: "podcast", params: { podcastId: props.podcast.podcastId } }).path + orga;
  }
  if(props.emission){
    return router.resolve({ name: "emission", params: { emissionId: props.emission.emissionId } }).path + orga;
  }
  if(props.playlist){
    return router.resolve({ name: "playlist", params: { playlistId: props.playlist.playlistId } }).path + orga;
  }
  return "";
});

const newsletterInfo = computed(() => {
  if (props.podcast) {
    return {
      imageUrl: `${props.podcast.imageUrl}" alt="${t(
        "Episode name image",
        { name: props.podcast.title },
      )}`,
      title: props.podcast.title,
      description: props.podcast.description ?? "",
      shareText: t("Listen this episode"),
      emissionHtml: `<tr><td style="padding:5px 0;">
      <div style="display:flex; margin-top:5px;">
      <div style="font-size:16px; color:${
        arrayColors.value[1].color
      }; margin-right:5px;text-wrap: nowrap;">${t("Emission")} :</div>
      <a href="${shareUrl.value+pathShare.value}" style="font-size: 16px;color: ${
        arrayColors.value[0].color
      };overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${
        props.podcast.emission.name
      }</a>
      </div></td></tr>`,
      articleHtml:
        !props.podcast?.article || 0 === props.podcast.article?.length
          ? ``
          : `<tr><td style="padding:5px 0;">
      <div style="display:flex;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M7 17h7v-2H7zm0-4h10v-2H7zm0-4h10V7H7zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z"/></svg>
      <a href="${props.podcast.article}" style="color: ${
        arrayColors.value[1].color
      };margin-top:2px">${t("See associated article")}</a>
      </div></td></tr>
      `,
      colorTitle: `color:${arrayColors.value[1].color};`,
    };
  }
  if (props.emission) {
    return {
      imageUrl: `${props.emission.imageUrl}" alt="${t(
        "Emission image",
      )}`,
      title: props.emission.name,
      description: props.emission.description ?? "",
      shareText: t("Listen to all episodes"),
      emissionHtml: ``,
      articleHtml: ``,
      colorTitle: `color:${arrayColors.value[0].color};`,
    };
  }
  return {
    imageUrl: `${props.playlist?.imageUrl}" alt="${t(
      "Playlist image",
    )}`,
    title: props.playlist?.title,
    description: props.playlist?.description ?? "",
    shareText: t("Listen to all episodes"),
    emissionHtml: ``,
    articleHtml: ``,
    colorTitle: `color:${arrayColors.value[0].color};`,
  };
});
const newsletterHtml = computed(() => {
  return `<table style="background:${arrayColors.value[2].color};color:${
        arrayColors.value[1].color
          };table-layout: fixed;width:100%;font-size: 14px;">
    <tr>
    <td valign="top" width="30%" rowspan="7" style="padding-right:5px;"><img width="100%" src="${
            newsletterInfo.value.imageUrl
          }" style="border-radius: 4px;"></td>
    <td valign="top" width="70%" style="padding:5px 0;"><div style="margin-top:5px;font-size: 20px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;font-weight:bold;${
            newsletterInfo.value.colorTitle
          }">${newsletterInfo.value.title}</div></td>
    </tr>${newsletterInfo.value.emissionHtml}
    <tr><td style="padding:5px 0;"><div style="overflow: hidden;display: -webkit-box;-webkit-line-clamp: 6;-webkit-box-orient: vertical;word-break: break-word;">${
            newsletterInfo.value.description
          }</div></td></tr>
    <tr><td valign="top" style="padding:5px 0;"><a href="${
            shareUrl.value+pathShare.value
          }" style="color: ${arrayColors.value[0].color};">${t(
            "See more",
          )}</a></td></tr>
    <tr>${newsletterInfo.value.articleHtml}
    <td width="1" style="padding:5px 0;"><a href="${
            shareUrl.value+pathShare.value
          }" style="font-size: 18px;color: ${
            arrayColors.value[0].color
          };text-decoration: none; display:flex;"><svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="currentColor" d="m9.5 16.5l7-4.5l-7-4.5zM12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22"/></svg><div style="margin-top: 15px; color:${
            arrayColors.value[1].color
          };">${newsletterInfo.value.shareText}</div></a></td>
    </tr>
    </table>
    `;
});


onBeforeMount(()=>initData())

//Methods
async function initData(): Promise<void> {
  const orgaId = authStore.authOrgaId;
  if (!orgaId?.length) {
    return;
  }
  const attributes = await saveFetchStore.getOrgaAttributes(orgaId ?? "");
  if (
    Object.hasOwn(attributes, "podcastmakerUrl") &&
    (attributes.podcastmakerUrl as string | undefined | null)?.length
  ) {
    shareUrl.value = attributes.podcastmakerUrl?.toString() ?? window.location.origin;
  }
  if (Object.hasOwn(attributes, "COLOR")) {
    arrayColors.value[0].color = attributes.COLOR as string;
  }
}
</script>
