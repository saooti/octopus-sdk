import octopusApi from "@saooti/octopus-api";
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState } from "pinia";
export const playerLogicProgress = defineComponent({
  mixins: [],
  data() {
    return {
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      downloadId: null as string | null,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authOrgaId"]),
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerLive",
      "playerRadio",
      "playerSeekTime",
      "playerVideo"
    ]),
  },

  watch: {
    async listenTime(newVal): Promise<void> {
      if (
        (this.playerRadio && !this.playerPodcast && !this.playerLive) ||
        !this.downloadId ||
        newVal - this.lastSend < 10
      ) {
        return;
      }
      this.lastSend = newVal;
      await octopusApi.putDataPublic(
        0,
        "podcast/listen/" + this.downloadId + "?seconds=" + Math.round(newVal),
        undefined,
      );
    },
    playerSeekTime() {
      if (!this.playerSeekTime) {
        return;
      }
      if (this.playerPodcast || this.playerLive) {
        this.notListenTime = this.playerSeekTime - this.listenTime;
      }
      if(this.playerVideo){
        return;
      }
      const audioPlayer: HTMLAudioElement | null = document.querySelector("#audio-player");
      if (!audioPlayer) return;
      audioPlayer.currentTime = this.playerSeekTime;
    },
  },

  mounted() {
    window.addEventListener("beforeunload", this.endListeningProgress);
  },

  methods: {
    async initLiveDownloadId() {
      if (!this.playerLive || this.downloadId) {
        return;
      }
      try {
        const mediaType = this.playerVideo ? "VIDEO":"AUDIO";
        const downloadId = await octopusApi.putDataPublic<string | null>(
          0,
          "podcast/prepare/live/" + this.playerLive.podcastId+"?mediaType="+mediaType,
          undefined,
        );
        await octopusApi.fetchDataPublicWithParams<string | null>(
          0,
          "podcast/download/live/" + this.playerLive.podcastId + ".m3u8",
          {
            downloadId: null !== downloadId ? downloadId : undefined,
            origin: "octopus",
            distributorId: this.authOrgaId,
          },
        );
        this.setDownloadId(downloadId);
      } catch (error) {
        this.downloadId = null;
        console.log("ERROR downloadId");
      }
    },
    onTimeUpdateProgress(currentTime: number): void {
      if (!this.downloadId) {
        return;
      }
      if (
        this.playerLive &&
        0 === this.listenTime &&
        0 !== currentTime
      ) {
        this.notListenTime = currentTime;
        this.listenTime = 1;
      } else {
        const newListenTime = currentTime - this.notListenTime;
        const diffTime = newListenTime - this.listenTime;
        if(diffTime > 0 && diffTime<1){
          this.listenTime = newListenTime;
        }
      }
    },
    setDownloadId(newValue: string | null): void {
      this.endListeningProgress();
      this.downloadId = newValue;
    },
    async endListeningProgress(): Promise<void> {
      if (!this.downloadId) return;
      try {
        await octopusApi.putDataPublic(
          0,
          "podcast/listen/" +
            this.downloadId +
            "?seconds=" +
            Math.round(this.listenTime),
          undefined,
        );
      } catch {
        //Do nothing
      }
      this.downloadId = null;
      this.notListenTime = 0;
      this.lastSend = 0;
      this.listenTime = 0;
    },

  },
});
