import classicApi from "../../../api/classicApi";
import { MediaRadio, MetadataRadio, NextAdvertising } from '@/stores/class/general/player';
import { Podcast } from '@/stores/class/general/podcast';
import dayjs from 'dayjs';
import {onBeforeUnmount, Ref, ref} from 'vue';
import { useI18n } from "vue-i18n";
export const useFetchRadio = ()=>{

  const radioInterval : Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);

  const {t} = useI18n();
  
  async function fetchRadioMetadata(
    canalId: number,
    previousTitle: string,
    callbackMetadata: (
      metadata: MediaRadio|undefined,
      podcast: Podcast | undefined,
      history: Array<MediaRadio>
    ) => void,
    callbackAdvertising?: (
      nextAdvertising: NextAdvertising
    ) => void,
  ): Promise<void> {
    const metadata = await classicApi.fetchData<MetadataRadio>({
      api: 14,
      path:  "player/playing/" + canalId,
    });
    /*{
      "adCount": 1,
      "startDate": "2025-03-04T13:12:00Z",
      "tag": "5e385e1b51c86"
  }; */
    if(callbackAdvertising){
      callbackAdvertising(metadata.nextAdvertising);
    }
    const arrayMetadata = metadata.previously;
    if(null!==metadata.currently){
      arrayMetadata.unshift(metadata.currently);
      for (let index = 0, len = arrayMetadata.length; index < len; index++) {
        if (
          dayjs().valueOf() - 18000 >
          dayjs(arrayMetadata[index].startDate).valueOf()
        ) {
          await useCallbackIfNewMetadata(previousTitle, arrayMetadata, index, len,callbackMetadata);
          return;
        }
      }
    }else{
      callbackMetadata(undefined, undefined, arrayMetadata);
    }
  }
  async function useCallbackIfNewMetadata(previousTitle: string, arrayMetadata: Array<MediaRadio>, index:number, len: number, callbackMetadata: (
    metadata: MediaRadio,
    podcast: Podcast | undefined,
    history: Array<MediaRadio>
  ) => void){
    if (previousTitle !== arrayMetadata[index].title) {
      const historyIndex = index + 1 < len ? index + 1 : index;
      const history = arrayMetadata.slice(historyIndex, len);
      if (arrayMetadata[index].podcastId) {
        const data: Podcast = await classicApi.fetchData<Podcast>({
          api: 0,
          path: "podcast/" + arrayMetadata[index].podcastId,
        });
        callbackMetadata(arrayMetadata[index], data, history);
      } else {
        callbackMetadata(arrayMetadata[index], undefined, history);
      }
    }
  }
  function displayTitle(metadata: MediaRadio|undefined): string {
    if(!metadata){
      return t("Silent stream");
    }
    let title = "";
    if (metadata?.title) {
      title += metadata.title;
    }
    if (metadata?.artist) {
      title += " - " + metadata.artist;
    }
    return title;
  }



  onBeforeUnmount(() => {
    clearInterval(radioInterval.value as unknown as number);
  })


	return {
    fetchRadioMetadata,
    displayTitle
	}
}
