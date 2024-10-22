import classicApi from "../../../api/classicApi";
import { defineComponent } from "vue";
import { useAuthStore } from "../../../stores/AuthStore";
import { usePlayerStore } from "../../../stores/PlayerStore";
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
      await classicApi.putData({
        api: 0,
        path:"podcast/listen/" + this.downloadId + "?seconds=" + Math.round(newVal),
        isNotAuth:true
      });
    },
    playerSeekTime() {
      if (undefined===this.playerSeekTime) {
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
        const downloadId = await classicApi.putData<string | null>({
          api: 0,
          path:"podcast/prepare/live/" + this.playerLive.podcastId+"?mediaType="+mediaType,
          isNotAuth:true
        });
        //TODO check if we can do otherwise
        await classicApi.fetchData<string | null>({
          api:0,
          path: "podcast/download/live/" + this.playerLive.podcastId + ".m3u8",
          parameters:{
            downloadId: downloadId ?? undefined,
            origin: "octopus",
            distributorId: this.authOrgaId,
          },
          isNotAuth:true
        });
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
        await classicApi.putData<string | null>({
          api: 0,
          path:"podcast/listen/" +
            this.downloadId +
            "?seconds=" +
            Math.round(this.listenTime),
          isNotAuth:true
        });
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
