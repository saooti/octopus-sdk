<template>
  <div v-if="participant" class="participant-item-container">
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: participant.participantId },
      }"
      class="mt-3 text-dark"
      :title="$t('Participant name page', { name: name })"
    >
      <img
        v-lazy="proxyImageUrl(participant.imageUrl, '200')"
        width="200"
        height="200"
        role="presentation"
        alt=""
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
        class="participant-description html-wysiwyg-content"
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
      class="participant-producer"
    >
      © {{ participant.orga.name }}
    </router-link>
  </div>
</template>

<script lang="ts">
import AlertIcon from "vue-material-design-icons/Alert.vue";
import classicApi from "../../../api/classicApi";
import { Participant } from "@/stores/class/general/participant";
import imageProxy from "../../mixins/imageProxy";
import displayMethods from "../../mixins/displayMethods";
import { orgaComputed } from "../../mixins/orgaComputed";
import { defineComponent } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
export default defineComponent({
  name: "ParticpantItem",
  components: {
    AlertIcon,
  },
  mixins: [displayMethods, orgaComputed, imageProxy],
  props: {
    participant: { default: () => ({}), type: Object as () => Participant },
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
      participantDescContainer.classList.add("after-participant-description");
    }
  },
  methods: {
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


.octopus-app {
  .participant-item-container {
    list-style: none;
    border-radius: var(--octopus-border-radius);
    display: flex;
    flex-direction: column;
    margin: 1rem 0;
    align-items: center;
    width: var(--octopus-image-size);

    .participant-description {
      overflow: hidden;
      margin-top: 0.5em;
      max-height: 3rem;
      position: relative;
      text-align: center;

      &.after-participant-description::after {
        content: "...";
        position: absolute;
        padding-left: 1rem;
        right: 0;
        bottom: 0;
        width: 100%;
        font-size: 1rem;
        font-weight: bolder;
        text-align: center;
        background: linear-gradient(
          to bottom,
          var(--octopus-background-full-transparent),
          var(--octopus-background-transparent)
        );
      }
    }

    .participant-producer {
      font-weight: 300;
      font-size: 0.6rem;
      margin-top: 0.5rem;
    }

    @media (width <= 960px) {
      margin: 0;
    }

    @media (width <= 450px) {
      margin: 1rem 0 0;
    }
  }
}
</style>
