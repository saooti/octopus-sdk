import octopusApi from "@saooti/octopus-api";
import { defineComponent } from "vue";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import { AdserverOtherEmission } from "@/stores/class/adserver/adserverOtherEmission";
export const playerTranscript = defineComponent({
  computed: {
    ...mapState(usePlayerStore, ["playerTranscript", "playerPodcast", 'playerDelayStitching']),
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerUpdateTranscript", "playerUpdateDelayStitching"]),
    async checkDelayWithStitching(){
      this.playerUpdateDelayStitching(0);
      const audioPlayer = document.querySelector("#audio-player") as HTMLAudioElement;
      if (!this.playerTranscript || !audioPlayer || !this.playerPodcast ||
        audioPlayer.duration <= this.playerPodcast.duration / 1000 + 5) 
      {
        return;
      }
      //TODO save config to use with vast
      let adserverConfig = await octopusApi.fetchDataPublic<AdserverOtherEmission>(0,`ad/test/podcast/${this.playerPodcast.podcastId}`);
      const doubletsLength = adserverConfig.config.doublets.length;
      if(1=== doubletsLength &&  "pre" === adserverConfig.config.doublets[0].timing.insertion){
        this.playerUpdateDelayStitching( audioPlayer.duration - (this.playerPodcast.duration / 1000));
      }else if(0===doubletsLength || 1=== doubletsLength &&  "post" === adserverConfig.config.doublets[0].timing.insertion){
        return;
      }else{
        this.playerUpdateChaptering();
        this.playerUpdateTranscript();
      }
    },
    async getTranscription(): Promise<void> {
      if (!this.playerPodcast) {
        this.playerUpdateTranscript();
        return;
      }
      const result = await octopusApi.fetchDataPublic<string>(
        11,
        `response/${this.playerPodcast.podcastId}`,
      );
      const arrayTranscript = this.parseSrt(result);
      const actualText =
        arrayTranscript?.[0]?.startTime === 0 ? arrayTranscript[0].text : "";
      if(!arrayTranscript){
        return;
      }
      this.playerUpdateTranscript({
        actual: 0,
        actualText: actualText,
        value: arrayTranscript
      });
    },
    parseSrt(transcript: string) {
      const pattern =
        /(\d+)\n([\d:,]+)\s+-{2}>\s+([\d:,]+)\n([\s\S]*?(?=\n{2}|$))/gm;
      const result = [];
      if (typeof transcript != "string") {
        return;
      }
      if (transcript == null) {
        return;
      }
      transcript = transcript.replace(/\r\n|\r|\n|\t/g, "\n");
      let matches;
      while ((matches = pattern.exec(transcript)) != null) {
        result.push({
          startTime: this.srtTimeToSeconds(matches[2]),
          endTime: this.srtTimeToSeconds(matches[3]),
          text: matches[4],
        });
      }
      return result;
    },
    srtTimeToSeconds(time: string): number {
      const a = time.split(":");
      return +a[0] * 60 * 60 + +a[1] * 60 + +parseFloat(a[2]);
    },
    onTimeUpdateTranscript(currentTime: number) {
      if(!this.playerTranscript?.value.length){
        return;
      }
      const startTime = (this.playerTranscript.value[this.playerTranscript.actual]?.startTime ?? 0) + this.playerDelayStitching;
      if (startTime <= currentTime) {
        this.playerTranscript.actualText = this.playerTranscript.value[this.playerTranscript?.actual]?.text ??"";
      }
      if (
        (this.playerTranscript.value[this.playerTranscript.actual]?.endTime ??
          Infinity) + this.playerDelayStitching < currentTime
      ) {
        this.playerTranscript.actual += 1;
        this.playerTranscript.actualText =
          this.playerTranscript?.value[this.playerTranscript.actual]?.text ??
          "";
      }
    },
    
    onSeekedTranscript(currentTime: number) {
      if (this.playerTranscript) {
        let newActual = 0;
        while (
          currentTime >
          (this.playerTranscript.value[newActual]?.endTime ?? Infinity) + this.playerDelayStitching
        ) {
          newActual += 1;
        }
        this.playerTranscript.actual = newActual;
      }
    },
  },
});
