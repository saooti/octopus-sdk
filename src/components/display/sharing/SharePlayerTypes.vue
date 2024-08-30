<template>
  <label for="iframe-select" title="select miniplayer" />
  <select
    id="iframe-select"
    :value="iFrameModel"
    @change="selectChange($event)"
  >
    <template v-for="option in optionsSelect" :key="option.value">
      <option v-if="option.condition" :value="option.value">
        {{ option.name }}
      </option>
    </template>
    <option
      v-for="player in customPlayersDisplay"
      :key="player.customId"
      :value="player.customId"
    >
      {{ $t("Custom version") + " «" + player.name + "»" }}
    </option>
  </select>
</template>

<script lang="ts">
import { state } from "../../../stores/ParamSdkStore";
import octopusApi from "@saooti/octopus-api";
import { Podcast } from "@/stores/class/general/podcast";
import { CustomPlayer } from "@/stores/class/general/customPlayer";
import { defineComponent } from "vue";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
import { InterfacePageable } from "@/stores/class/general/interfacePageable";
export default defineComponent({
  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    emission: { default: undefined, type: Object as () => Emission },
    playlist: { default: undefined, type: Object as () => Playlist },
    iFrameModel: { default: "default", type: String },
    typeCustomPlayer: { default: "", type: String },
    organisationId: { default: undefined, type: String },
    isLive: { default: false, type: Boolean },
  },
  emits: ["update:iFrameModel", "update:typeCustomPlayer"],

  data() {
    return {
      customPlayers: [] as Array<CustomPlayer>,
    };
  },
  computed: {
    isVideoPodcast(): boolean {
      return (
        undefined !== this.podcast && undefined !== this.podcast.video?.videoId
      );
    },
    optionsSelectLive() {
      return [
        { name: this.$t("Large version"), value: "large", condition: true },
        {
          name: this.$t("High version"),
          value: "videoLive",
          condition: this.podcast?.podcastId,
        },
      ];
    },
    optionsSelect() {
      if (this.isLive) {
        return this.optionsSelectLive;
      }
      return [
        {
          name: this.$t("Video Version"),
          value: "video",
          condition: this.isVideoPodcast,
        },
        { name: this.$t("Default version"), value: "default", condition: true },
        { name: this.$t("Large version"), value: "large", condition: true },
        {
          name: this.$t("Full Large version"),
          value: "largeMore",
          condition: this.podcast?.podcastId,
        },
        {
          name: this.$t("Emission version"),
          value: "emission",
          condition: this.podcast?.podcastId,
        },
        {
          name: this.$t("Large emission version"),
          value: "emissionLarge",
          condition: this.podcast?.podcastId,
        },
        {
          name: this.$t("Large suggestion version"),
          value: "largeSuggestion",
          condition: this.podcast?.podcastId,
        },
      ];
    },
    customPlayersDisplay(): Array<CustomPlayer> {
      return this.customPlayers.filter((player: CustomPlayer) => {
        return (
          (("EPISODE" === player.typePlayer ||
            "SUGGESTION" === player.typePlayer) &&
            this.podcast?.podcastId) ||
          ("EMISSION" === player.typePlayer &&
            this.emission &&
            !this.podcast) ||
          ("PLAYLIST" === player.typePlayer && this.playlist)
        );
      });
    },
  },
  created() {
    if (this.isVideoPodcast) {
      this.$emit("update:iFrameModel", "video");
    }
    if (this.isLive) {
      return;
    }
    this.initCustomPlayers();
  },
  methods: {
    isNumeric(value: string): boolean {
      return /^-?\d+$/.test(value);
    },
    selectChange($event: any) {
      const val = $event.target.value;
      if (!val) {
        return;
      }
      if (this.isNumeric(val)) {
        var customPlayer = this.customPlayersDisplay.find((p) => {
          return p.customId.toString() === val;
        });
        if (customPlayer) {
          this.selectCustomPlayer(customPlayer);
        }
      } else {
        this.$emit("update:iFrameModel", val);
      }
    },
    async fetchPlayerPaginate(type: string): Promise<CustomPlayer[]> {
      let players = await octopusApi.fetchDataPublic<
        InterfacePageable<CustomPlayer>
      >(6, "customPlayer/type/" + this.organisationId + "/" + type);
      let playersContent = players.content;
      const totalCount = players.totalElements;
      let index = 1;
      while (totalCount > playersContent.length) {
        players = await octopusApi.fetchDataPublic<
          InterfacePageable<CustomPlayer>
        >(
          6,
          "customPlayer/type/" +
            this.organisationId +
            "/" +
            type +
            "?start=" +
            index,
        );
        playersContent = playersContent.concat(players.content);
        ++index;
      }
      return playersContent;
    },
    selectCustomPlayer(customPlayer: CustomPlayer) {
      this.$emit("update:typeCustomPlayer", customPlayer.typePlayer);
      this.$emit("update:iFrameModel", customPlayer.customId.toString());
    },
    async fetchCustomPlayers(
      type: string,
      selectIfPossible = true,
    ): Promise<boolean> {
      let customPlayersForType = await this.fetchPlayerPaginate(type);
      this.customPlayers = this.customPlayers.concat(customPlayersForType);
      if (
        "video" !== this.iFrameModel &&
        selectIfPossible &&
        customPlayersForType?.[0]?.selected
      ) {
        this.selectCustomPlayer(this.customPlayers[0]);
        return true;
      }
      return false;
    },
    async initCustomPlayers(): Promise<void> {
      if (!state.generalParameters.authenticated) return;
      if (this.playlist) {
        this.fetchCustomPlayers("PLAYLIST");
      } else if (this.emission && !this.podcast) {
        this.fetchCustomPlayers("EMISSION");
      } else {
        const episodeSelected = await this.fetchCustomPlayers("EPISODE");
        const emissionSelected = await this.fetchCustomPlayers(
          "EMISSION",
          !episodeSelected,
        );
        await this.fetchCustomPlayers(
          "SUGGESTION",
          !episodeSelected && !emissionSelected,
        );
      }
    },
  },
});
</script>
