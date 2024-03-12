import { defineComponent } from "vue";
import { MediaRadio, MetadataRadio } from "@/stores/class/general/player";
import octopusApi from "@saooti/octopus-api";
import dayjs from "dayjs";
import { Podcast } from "@/stores/class/general/podcast";
export const fetchRadioData = defineComponent({
  data() {
    return {
      radioInterval: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },
  unmounted() {
    clearInterval(this.radioInterval as unknown as number);
  },
  methods: {
    async fetchRadioMetadata(
      canalId: number,
      previousTitle: string,
      callbackMetadata: (
        metadata: MediaRadio,
        podcast: Podcast | undefined,
        history: Array<MediaRadio>
      ) => void,
      callbackAdvertising?: (
        nextAdvertisingStartDate: string|null
      ) => void,
    ): Promise<void> {
      const metadata = await octopusApi.fetchData<MetadataRadio>(
        14,
        "player/playing/" + canalId,
      );
      if(callbackAdvertising){
        //TODO remove mock
        //callbackAdvertising("2024-03-12T15:25:00Z");
        callbackAdvertising(metadata.nextAdvertisingStartDate);
      }
      const arrayMetadata = metadata.previously;
      arrayMetadata.unshift(metadata.currently);
      for (let index = 0, len = arrayMetadata.length; index < len; index++) {
        if (
          dayjs().valueOf() - 18000 >
          dayjs(arrayMetadata[index].startDate).valueOf()
        ) {
          if (previousTitle !== arrayMetadata[index].title) {
            const historyIndex = index + 1 < len ? index + 1 : index;
            const history = arrayMetadata.slice(historyIndex, len);
            if (arrayMetadata[index].podcastId) {
              const data: Podcast = await octopusApi.fetchData<Podcast>(
                0,
                "podcast/" + arrayMetadata[index].podcastId,
              );
              callbackMetadata(arrayMetadata[index], data, history);
            } else {
              callbackMetadata(arrayMetadata[index], undefined, history);
            }
          }
          return;
        }
      }
    },
    displayTitle(metadata: MediaRadio): string {
      let title = "";
      if (metadata.title) {
        title += metadata.title;
      }
      if (metadata.artist) {
        title += " - " + metadata.artist;
      }
      return title;
    },
  },
});
