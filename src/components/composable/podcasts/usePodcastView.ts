import { Conference } from '@/stores/class/conference/conference';
import { Podcast } from '@/stores/class/general/podcast';
import dayjs from 'dayjs';
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
// @ts-expect-error Bibliothèque non typée
import humanizeDuration from "humanize-duration";
import {computed, Ref} from 'vue';
import { useI18n } from 'vue-i18n';
import {useOrgaComputed} from "../useOrgaComputed"
export const usePodcastView = (podcast: Ref<Podcast|undefined>,  podcastConference: Ref<Conference|undefined>)=>{

  const i18n = useI18n();

  const {isEditRights, isPodcastmaker} = useOrgaComputed();


  const editRight = computed(() => { 
    return isEditRights(podcast.value?.organisation.id);
  });
  const isLiveReadyToRecord = computed(() => { 
    return (
      undefined !== podcast.value &&
      undefined !== podcast.value.conferenceId &&
      0 !== podcast.value.conferenceId &&
      "READY_TO_RECORD" === podcast.value.processingStatus
    );
  });
  const isCounter = computed(() => { 
    return (
      isLiveReadyToRecord.value &&
      undefined !==  podcastConference.value &&
      ("PLANNED" ===  podcastConference.value.status ||
        "PENDING" ===  podcastConference.value.status)
    );
  });

  const timeRemaining = computed(() => { 
    return !podcast.value ? 0: dayjs(podcast.value.pubDate).diff(dayjs(), "seconds");
  });

  const isPlannedInProcessor = computed(() => "PLANNED" === podcast.value?.processingStatus);
  
  const date = computed(() => { 
    if (!podcast.value || 1970 === dayjs(podcast.value.pubDate).year()) {
      return "";
    }
    if (isLiveReadyToRecord.value) {
      return dayjs(podcast.value.pubDate).format("D MMMM YYYY - HH:mm");
    }
    return dayjs(podcast.value.pubDate).format("D MMMM YYYY");
  });

  const duration = computed(() => { 
    if (!podcast.value || podcast.value.duration <= 1) return "";
      if (podcast.value.duration > 600000) {
        return humanizeDuration(podcast.value.duration, {
          language: i18n.locale.value,
          largest: 1,
          round: true,
        });
      }
      return humanizeDuration(podcast.value.duration, {
        language: i18n.locale.value,
        largest: 2,
        round: true,
      });
  });

  const durationIso = computed(() => { 
    if (!podcast.value || podcast.value.duration <= 1) return "";
      return dayjs.duration({ milliseconds: podcast.value.duration }).toISOString();
  });
	return {
    isLiveReadyToRecord,
    isCounter,
    timeRemaining,
    isPlannedInProcessor,
    date,
    duration,
    durationIso,
    editRight,
    isPodcastmaker
	}
}