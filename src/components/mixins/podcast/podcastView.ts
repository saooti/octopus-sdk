import dayjs from "dayjs";
// @ts-ignore
import humanizeDuration from "humanize-duration";
import { defineComponent } from 'vue';
export default defineComponent({
  computed:{
    isCounter(): boolean {
      debugger;
      return (
        this.isLiveReadyToRecord &&
        undefined !== this.podcastConference &&
        ("PLANNED" === this.podcastConference.status ||
          "PENDING" === this.podcastConference.status)
      );
    },
    timeRemaining(): number {
      return !this.podcast
        ? 0
        : dayjs(this.podcast.pubDate).diff(dayjs(), "seconds");
    },
    isLiveReadyToRecord(): boolean {
      return (
        undefined !== this.podcast &&
        undefined !== this.podcast.conferenceId &&
        0 !== this.podcast.conferenceId &&
        "READY_TO_RECORD" === this.podcast.processingStatus
      );
    },
    date(): string {
      if (!this.podcast || 1970 === dayjs(this.podcast.pubDate).year()) {
        return "";
      }
      if (this.isLiveReadyToRecord) {
        return dayjs(this.podcast.pubDate).format("D MMMM YYYY - HH:mm");
      }
      return dayjs(this.podcast.pubDate).format("D MMMM YYYY");
    },
    duration(): string {
      if (!this.podcast || this.podcast.duration <= 1) return "";
      if (this.podcast.duration > 600000) {
        return humanizeDuration(this.podcast.duration, {
          language: this.$i18n.locale,
          largest: 1,
          round: true,
        });
      }
      return humanizeDuration(this.podcast.duration, {
        language: this.$i18n.locale,
        largest: 2,
        round: true,
      });
    },
  }
});
