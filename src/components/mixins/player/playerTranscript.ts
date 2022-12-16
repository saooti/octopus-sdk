import octopusApi from '@saooti/octopus-api';
import { defineComponent } from 'vue';
export const playerTranscript = defineComponent({
  methods: {
    async getTranscription(): Promise<void>{
      if(!this.podcast){
        this.$store.commit('player/transcript',undefined);
        return;
      }
      const result = await octopusApi.fetchDataPublic<string>(11 , `response/${this.podcast.podcastId}`);
      const arrayTranscript = this.parseSrt(result);
      const actualText = arrayTranscript?.[0]?.startTime === 0 ? arrayTranscript[0].text : "";
      this.$store.commit('player/transcript',{actual: 0,actualText:actualText, value : arrayTranscript});
    },
    parseSrt(transcript: string){
      const pattern = /(\d+)\n([\d:,]+)\s+-{2}\>\s+([\d:,]+)\n([\s\S]*?(?=\n{2}|$))/gm;
      const result = [];
      if (typeof(transcript) != 'string'){
        return;
      }
      if (transcript == null){
        return;
      }
      transcript = transcript.replace(/\r\n|\r|\n|\t/g, '\n');
      let matches;
      while ((matches = pattern.exec(transcript)) != null) {
        result.push({
          startTime: this.srtTimeToSeconds(matches[2]),
          endTime: this.srtTimeToSeconds(matches[3]),
          text: matches[4]
        });
      }
      return result;
    },
    srtTimeToSeconds(time:string): number{
      const a = time.split(':'); 
      return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+parseFloat(a[2])); 
    },
    onTimeUpdateTranscript(currentTime:number){
      if((this.$store.state.player.transcript?.value[this.$store.state.player.transcript?.actual]?.endTime ?? Infinity) < currentTime){
        this.$store.state.player.transcript.actual +=1;
        this.$store.state.player.transcript.actualText = this.$store.state.player.transcript?.value[this.$store.state.player.transcript?.actual].text ?? "";
      }
    },
    onSeekedTranscript(currentTime: number){
      if(this.$store.state.player.transcript){
        let newActual = 0;
        while (currentTime > (this.$store.state.player.transcript.value[newActual]?.endTime ?? Infinity)){
          newActual +=1;
        }
        this.$store.state.player.transcript.actual = newActual;
      }
    }
  },
})