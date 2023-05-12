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
      for(let i = 0; i < arrayMetadata.length; i++){
        if(dayjs().valueOf()-29000 > dayjs(arrayMetadata[i].startDate).valueOf()){
          if(previousTitle !== arrayMetadata[i].title){
            //todo 
            arrayMetadata[i].podcastId = 98619;
            if(arrayMetadata[i].podcastId){
              const data : Podcast = await octopusApi.fetchData<Podcast>(0, 'podcast/'+arrayMetadata[i].podcastId); 
              callbackMetadata(arrayMetadata[i], data);
            }else{
              callbackMetadata(arrayMetadata[i]);
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