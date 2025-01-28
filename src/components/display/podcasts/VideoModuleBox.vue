<template>
  <section v-if="podcast" class="d-flex flex-column flex-grow-1 mt-2">
    <div class="d-flex justify-content-between flex-wrap">
      <time v-if="0 !== date.length" class="me-2" :datetime="podcast.pubDate">
        {{ date }}
      </time>
      <time :datetime="durationIso">
        {{ duration }}
      </time>
    </div>
    <div class="my-3 h3">{{ podcast.title }}</div>
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="podcast.description"
      class="description-text html-wysiwyg-content mb-3"
      v-html="urlify(podcast.description)"
    />
    <!-- eslint-enable -->
    <ParticipantDescription :participants="podcast.animators" />
    <ParticipantDescription :participants="podcast.guests" :is-guest="true" />
    <PodcastRawTranscript class="mt-3" :podcast-id="podcast.podcastId" />
  </section>
</template>

<script lang="ts">
import { Podcast } from "@/stores/class/general/podcast";
import displayMethods from "../../mixins/displayMethods";
import PodcastRawTranscript from "./PodcastRawTranscript.vue";
import { defineAsyncComponent, defineComponent } from "vue";
const ParticipantDescription = defineAsyncComponent(
  () => import("./ParticipantDescription.vue"),
);
export default defineComponent({
  name: "VideoModuleBox",
  components: {
    ParticipantDescription,
    PodcastRawTranscript,
  },

  mixins: [displayMethods],

  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    date: { default: "", type: String },
    duration: { default: "", type: String },
    durationIso: { default: "", type: String },
  },

  data() {
    return {};
  },
  computed: {},
});
</script>
