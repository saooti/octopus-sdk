<template>
  <label for="iframe-select" title="select miniplayer" >
    <select
      id="iframe-select"
      :value="iFrameModel"
      @change="selectChange($event)"
    >
      <optgroup v-show="isCustomPlayer" id="player-default-opt-group" :label="t('Default version')"></optgroup>
      <Teleport defer :disabled="!isCustomPlayer" to="#player-default-opt-group">
        <template v-for="option in optionsSelect" :key="option.value">
          <option v-if="option.condition" :value="option.value">
            {{ option.name }}
          </option>
        </template>
      </Teleport>
      
      <optgroup v-if="isCustomPlayer" :label="t('Custom version')">
        <option
          v-for="player in customPlayersDisplay"
          :key="player.customId"
          :value="player.customId"
        >
          {{ t("Custom version") + " «" + player.name + "»" }}
        </option>
      </optgroup>
    </select>
  </label>
</template>

<script setup lang="ts">
import classicApi from "../../../api/classicApi";
import { useAuthStore } from "../../../stores/AuthStore";
import { Podcast } from "@/stores/class/general/podcast";
import { CustomPlayer } from "@/stores/class/general/customPlayer";
import { computed, onBeforeMount, onMounted, Ref, ref } from "vue";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
import { InterfacePageable } from "@/stores/class/general/interfacePageable";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  podcast: { default: undefined, type: Object as () => Podcast },
  emission: { default: undefined, type: Object as () => Emission },
  playlist: { default: undefined, type: Object as () => Playlist },
  iFrameModel: { default: "default", type: String },
  typeCustomPlayer: { default: "", type: String },
  organisationId: { default: undefined, type: String },
  isLive: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["update:iFrameModel", "update:typeCustomPlayer"]);

//Data 
const customPlayers: Ref<Array<CustomPlayer>> = ref([]);

//Composables
const { t } = useI18n();
const authStore = useAuthStore();

//Computed
const isCustomPlayer = computed(() => 1<=customPlayersDisplay.value.length);
const isVideoPodcast = computed(() => undefined !== props.podcast?.video?.videoId);
const optionsSelectLive = computed(() => {
  return [
    { name: t("Large version"), value: "large", condition: true },
    {
      name: t("High version"),
      value: "videoLive",
      condition: props.podcast?.podcastId,
    },
  ];
});
const optionsSelect = computed(() => {
  if (props.isLive) {
    return optionsSelectLive.value;
  }
  return [
    {
      name: t("Video Version"),
      value: "video",
      condition: isVideoPodcast.value,
    },
    { name: t("Default version"), value: "default", condition: true },
    { name: t("Large version"), value: "largeMore", condition: props.podcast?.podcastId, },
    {
      name: props.podcast?.podcastId ? t("Minimalist length version"): t("Large version"),
      value: "large",
      condition: true,
    },
    {
      name: t("Emission version"),
      value: "emission",
      condition: props.podcast?.podcastId,
    },
    {
      name: t("Large emission version"),
      value: "emissionLarge",
      condition: props.podcast?.podcastId,
    },
  ];
});
const customPlayersDisplay = computed(() => {
  return customPlayers.value.filter((player: CustomPlayer) => {
    return (
      (("EPISODE" === player.typePlayer) &&
        props.podcast?.podcastId) ||
      ("EMISSION" === player.typePlayer &&
      props.emission &&
        !props.podcast) ||
      ("PLAYLIST" === player.typePlayer && props.playlist)
    );
  }).sort((a,b) => {
    if(a.name > b.name){
      return 1;
    }
    return (b.name > a.name) ? -1 : 0;
  });
});


onBeforeMount(()=>{
  if (props.isLive) {
    return;
  }
  initCustomPlayers();
})
onMounted(()=>{
  if (isVideoPodcast.value) {
    emit("update:iFrameModel", "video");
  }
})
 

//Methods
function isNumeric(value: string): boolean {
  return /^-?\d+$/.test(value);
}
function selectChange($event: Event) {
  const val = $event.target.value;
  if (!val) {
    return;
  }
  if (isNumeric(val)) {
    const customPlayer = customPlayersDisplay.value.find((p) => {
      return p.customId.toString() === val;
    });
    if (customPlayer) {
      selectCustomPlayer(customPlayer);
    }
  } else {
    emit("update:iFrameModel", val);
  }
}
async function fetchPlayerPaginate(type: string): Promise<CustomPlayer[]> {
  let players = await classicApi.fetchData<InterfacePageable<CustomPlayer>>(
    {
      api: 6,
      path: "customPlayer/type/" + props.organisationId + "/" + type,
      isNotAuth: true,
    },
  );
  let playersContent = players.content;
  const totalCount = players.totalElements;
  let index = 1;
  while (totalCount > playersContent.length) {
    players = await classicApi.fetchData<InterfacePageable<CustomPlayer>>({
      api: 6,
      path:
        "customPlayer/type/" +
        props.organisationId +
        "/" +
        type +
        "?start=" +
        index,
      isNotAuth: true,
    });
    playersContent = playersContent.concat(players.content);
    ++index;
  }
  return playersContent;
}
function selectCustomPlayer(customPlayer: CustomPlayer) {
  emit("update:typeCustomPlayer", customPlayer.typePlayer);
  emit("update:iFrameModel", customPlayer.customId.toString());
}

async function fetchCustomPlayers(
  type: string,
  selectIfPossible = true,
): Promise<boolean> {
  const customPlayersForType = await fetchPlayerPaginate(type);
  customPlayers.value = customPlayers.value.concat(customPlayersForType);
  if (
    !isVideoPodcast.value &&
    selectIfPossible &&
    customPlayersForType?.[0]?.selected
  ) {
    selectCustomPlayer(customPlayers.value[0]);
    return true;
  }
  return false;
}
async function initCustomPlayers(): Promise<void> {
  if (undefined === authStore.authOrgaId) return;
  if (props.playlist) {
    fetchCustomPlayers("PLAYLIST");
  } else if (props.emission && !props.podcast) {
    fetchCustomPlayers("EMISSION");
  } else {
    const episodeSelected = await fetchCustomPlayers("EPISODE");
    await fetchCustomPlayers(
      "EMISSION",
      !episodeSelected,
    );
  }
}
</script>
