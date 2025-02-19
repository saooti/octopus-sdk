import classicApi from "../../../api/classicApi";
import { MediaRadio, MetadataRadio, NextAdvertising } from '@/stores/class/general/player';
import { Podcast } from '@/stores/class/general/podcast';
import dayjs from 'dayjs';
import radioHelper from "../../../helper/radio/radioHelper";
import {onBeforeUnmount, Ref, ref} from 'vue';
export const useFetchRadio = ()=>{

  const radioInterval : Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);
  
  async function fetchRadioMetadata(
    canalId: number,
    previousTitle: string,
    callbackMetadata: (
      metadata: MediaRadio,
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
    if(callbackAdvertising){
      callbackAdvertising(metadata.nextAdvertising);
    }
    const arrayMetadata = metadata.previously;
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
  function displayTitle(metadata: MediaRadio): string {
    return radioHelper.displayTitle(metadata);
  }


  onBeforeUnmount(() => {
    clearInterval(radioInterval.value as unknown as number);
  })


	return {
    fetchRadioMetadata,
    displayTitle
	}
}
