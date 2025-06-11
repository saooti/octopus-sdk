<template>
  <article v-if="participant" class="participant-item-container">
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: participant.participantId },
      }"
      class="mt-3 text-dark"
      :title="$t('Participant name page', { name: name })"
    >
      <img
        v-lazy="useProxyImageUrl(participant.imageUrl, '200')"
        width="200"
        height="200"
        role="presentation"
        
        :title="$t('Animator image', { name: name })"
        class="img-box border"
      />
      <div class="d-flex align-items-center h4 justify-content-center mt-2">
        <AlertIcon
          v-if="!activeParticipant && !isPodcastmaker && editRight"
          :size="16"
          class="text-danger me-1"
          :title="$t('Participant have not podcasts')"
        />
        {{ name }}
      </div>
      <div
        ref="descriptionParticipantContainer"
        class="element-description small-description html-wysiwyg-content"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div
          ref="descriptionParticipant"
          v-html="urlify(participant.description || '')"
        />
        <!-- eslint-enable -->
      </div>
    </router-link>
    <router-link
      v-if="!isPodcastmaker"
      :to="{
        name: 'productor',
        params: { productorId: participant.orga.id },
      }"
      class="small-text mt-1"
    >
      © {{ participant.orga.name }}
    </router-link>
  </article>
</template>

<script lang="ts">
import AlertIcon from "vue-material-design-icons/Alert.vue";
import classicApi from "../../../api/classicApi";
import { Participant } from "@/stores/class/general/participant";
import {useImageProxy} from "../../composable/useImageProxy";
import displayHelper from "../../../helper/displayHelper";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import { defineComponent } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
export default defineComponent({
  name: "ParticpantItem",
  components: {
    AlertIcon,
  },
  props: {
    participant: { default: () => ({}), type: Object as () => Participant },
  },
  setup(){
    const { useProxyImageUrl } = useImageProxy();
    const { isPodcastmaker, isEditRights } = useOrgaComputed();
    return { useProxyImageUrl, isPodcastmaker, isEditRights }
  },

  data() {
    return {
      activeParticipant: true as boolean,
    };
  },
  computed: {
    name(): string {
      return `${this.participant.firstName ?? ""} ${
        this.participant.lastName ?? ""
      }`.trim();
    },
    editRight(): boolean {
      if (!this.participant?.orga) {
        return false;
      }
      return this.isEditRights(this.participant.orga.id);
    },
  },

  created() {
    if (!this.editRight) return;
    this.hasPodcast();
  },
  mounted() {
    const participantDesc = this.$refs.descriptionParticipant as HTMLElement;
    const participantDescContainer = this.$refs
      .descriptionParticipantContainer as HTMLElement;
    if (
      null !== participantDesc &&
      null !== participantDescContainer &&
      participantDesc.clientHeight > participantDescContainer.clientHeight
    ) {
      participantDescContainer.classList.add("after-element-description");
    }
  },
  methods: {
    urlify(text:string|undefined){
      return displayHelper.urlify(text);
    },
    async hasPodcast(): Promise<void> {
      const data = await classicApi.fetchData<ListClassicReturn<Podcast>>({
        api: 0,
        path: "podcast/search",
        parameters: {
          participantId: this.participant.participantId,
          first: 0,
          size: 0,
          includeStatus: ["READY", "PROCESSING"],
        },
        specialTreatement: true,
      });
      if (0 === data.count) {
        this.activeParticipant = false;
      }
    },
  },
});
</script>
<style lang="scss">
.octopus-app .participant-item-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: var(--octopus-border-radius);
  width: var(--octopus-image-size);
}
</style>
