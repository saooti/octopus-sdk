import { defineComponent } from 'vue';
import { MediaRadio, MetadataRadio } from '@/stores/class/general/player';
import octopusApi from '@saooti/octopus-api';
import dayjs from 'dayjs';
import { Podcast } from '@/stores/class/general/podcast';
export const fetchRadioData = defineComponent({
  data() {
    return {
      radioInterval: undefined as  ReturnType<typeof setTimeout>|undefined,
    };
  },
  unmounted() {
    clearInterval((this.radioInterval as unknown as number));
  },
  methods: {
    async fetchRadioMetadata(canalId: number, previousTitle: string,  callbackMetadata: (metadata: MediaRadio, podcast?:Podcast) => void): Promise<void>{
      const metadata = await octopusApi.fetchData<MetadataRadio>(14, 'player/playing/'+canalId);
      const arrayMetadata = metadata.previously;
      arrayMetadata.unshift(metadata.currently);
      for (let el of arrayMetadata) {
        if(dayjs().valueOf()-29000 > dayjs(el.startDate).valueOf()){
          if(previousTitle !== el.title){
            if(el.podcastId){
              const data : Podcast = await octopusApi.fetchData<Podcast>(0, 'podcast/'+el.podcastId); 
              callbackMetadata(el, data);
            }else{
              callbackMetadata(el);
            }
          }
          return;
        }
      }
    },
    displayTitle(metadata: MediaRadio): string{
      let title = "";
      if(metadata.title){
        title+=metadata.title;
      }
      if(metadata.artist){
        title+=" - "+metadata.artist;
      }
      return title;
    }
	}
});