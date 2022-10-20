<template>
  <div
    class="emission-player-container shadow-element"
  >
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
        query: { productor: $store.state.filter.organisationId },
      }"
      class="d-flex flex-column text-dark"
    >
      <div
        v-if="rubriqueName"
        class="emissionPlayerItem-info"
      >
        {{ rubriqueName }}
      </div>
      <div
        class="img-box rounded-0"
      >
        <img
          v-lazy="proxyImageUrl(emission.imageUrl, '260')"
          :title="$t('Emission name image', {name:emission.name})"
          :alt="$t('Emission name image', {name:emission.name})"
          class="img-box rounded-0"
        >
        <div
          v-if="titleInImage"
          class="titleInImage"
        >
          {{ emission.name }}
        </div>
      </div>
      <div class="d-flex flex-column p-2">
        <div class="fw-bold text-uppercase text-truncate">
          {{ emission.name }}
        </div>
        <div
          ref="descriptionEmissionContainer"
          class="emission-description html-wysiwyg-content"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            ref="descriptionEmission"
            v-html="urlify(emission.description)"
          />
          <!-- eslint-enable -->
        </div>
      </div>
    </router-link>
    <div
      v-for="p in podcasts"
      :key="p.podcastId"
      class="border-top emission-item-border-color p-2 secondary-bg d-flex flex-column"
    >
      <router-link
        v-if="isProgressBar"
        :to="{
          name: 'podcast',
          params: { podcastId: p.podcastId },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark fw-bold two-line-clamp"
      >
        {{ p.title }}
      </router-link>
      <div class="d-flex justify-content-between flex-grow-1">
        <div class="d-flex flex-column">
          <router-link
            v-if="!isProgressBar"
            :to="{
              name: 'podcast',
              params: { podcastId: p.podcastId },
              query: { productor: $store.state.filter.organisationId },
            }"
            class="d-flex flex-column define-width text-dark"
          >
            <div class="fw-bold text-truncate">
              {{ p.title }}
            </div>
            <div
              :ref="'descriptionPodcastContainer'+ p.podcastId"
              class="emission-description html-wysiwyg-content"
            >
              <!-- eslint-disable vue/no-v-html -->
              <div
                :ref="'descriptionPodcast'+ p.podcastId"
                v-html="urlify(p.description)"
              />
              <!-- eslint-enable -->
            </div>
          </router-link>
          <PodcastPlayBar :podcast="p" />
        </div>
        <button
          v-if="
            $store.state.player.podcast !== p ||
              ($store.state.player.podcast === p &&
                'PAUSED' === $store.state.player.status)
          "
          class="play-button-box bg-secondary"
          @click="play(p)"
        >
          <div
            class="text-light saooti-play"
            :title="$t('Play')"
          />
        </button>
        <button
          v-else
          class="play-button-box bg-secondary"
          @click="pause(p)"
        >
          <div
            class="text-light saooti-pause"
            :title="$t('Pause')"
          />
        </button>
      </div>
    </div>
    <div
      v-if="buttonMore && podcasts.length === nbPodcasts"
      class="border-top emission-item-border-color p-2 secondary-bg d-flex justify-content-center"
    >
      <router-link
        :to="{
          name: 'emission',
          params: { emissionId: emission.emissionId },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="btn"
      >
        {{ $t('More episodes') }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import { Emission } from '@/store/class/general/emission';
import { Podcast } from '@/store/class/general/podcast';
import { state } from '../../../store/paramStore';
import PodcastPlayBar from '../podcasts/PodcastPlayBar.vue';
import { displayMethods, imageProxy } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'EmissionPlayerItem',

  components:{
    PodcastPlayBar
  },
  mixins: [displayMethods, imageProxy],
  props: {
    emission: { default: ()=>({}), type: Object as ()=>Emission },
    nbPodcasts: { default: undefined, type: Number },
    rubriqueName: { default: undefined, type: String},
  },

  data() {
    return {
      activeEmission: true as boolean,
      podcasts: [] as Array<Podcast>,
    };
  },
  
  computed: {
    isProgressBar(): boolean{
      return (state.emissionsPage.progressBar as boolean);
    },
    buttonMore(): boolean {
      return (state.emissionsPage.buttonMore as boolean);
    },
    titleInImage(): boolean {
      return (state.emissionsPage.titleInImage as boolean);
    },
    authenticated(): boolean {
      return this.$store.state.authentication.isAuthenticated;
    },
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    editRight(): boolean {
      return (true===this.authenticated && this.organisationId === this.emission.orga.id) ||
        true === state.generalParameters.isAdmin
    },
  },

  created() {
    this.loadPodcasts();
  },
  mounted() {
    const emissionDesc = (this.$refs.descriptionEmission as HTMLElement);
    const emissionDescContainer = (this.$refs.descriptionEmissionContainer as HTMLElement);
    if (
      null !== emissionDesc && null !== emissionDescContainer &&
      emissionDesc.clientHeight > emissionDescContainer.clientHeight
    ) {
      emissionDescContainer.classList.add('after-emission-description');
    }
  },
  methods: {
    async loadPodcasts(): Promise<void> {
      const nb = this.nbPodcasts ? this.nbPodcasts : 2;
      const data =  await octopusApi.fetchDataWithParams<{count: number;result:Array<Podcast>;sort: string;}>(0, 'podcast/search',{
        emissionId: this.emission.emissionId,
        size: nb,
      }, true);
      if (0 === data.count) {
        this.activeEmission = false;
      }
      this.podcasts = data.result;
      this.$nextTick(() => {
      for (let index = 0, len = this.podcasts.length; index < len; index++) {
        const podcastDesc = (this.$refs['descriptionPodcast'+this.podcasts[index].podcastId] as Array<HTMLElement>)[0];
        const podcastDescContainer = (this.$refs['descriptionPodcastContainer'+this.podcasts[index].podcastId] as Array<HTMLElement>)[0];
        if (
          null !== podcastDesc && null !== podcastDescContainer &&
          podcastDesc.clientHeight > podcastDescContainer.clientHeight
        ) {
          podcastDescContainer.classList.add('after-emission-description');
        }
      }
      });
    },
    play(podcast: Podcast): void {
      if (podcast === this.$store.state.player.podcast) {
        this.$store.commit('playerPause', false);
      } else {
        this.$store.commit('playerPlayPodcast', podcast);
      }
    },
    pause(): void {
      this.$store.commit('playerPause', true);
    },
  },
})
</script>

<style lang="scss">

.emission-player-container {
  list-style: none;
  background: #fff;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 13rem;
  height: min-content;
  border-radius: 0.8rem;
  overflow: hidden;
  .progress{
    height: 6px;
  }
  .progress-bar-cursor{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: black;
    align-self: center;
    position: absolute;
  }
  .emission-item-border-color {
    border-color: #ddd;
  }
  .emission-description {
    overflow: hidden;
    margin-top: 0.5em;
    word-break: break-word;
    max-height: 3.5rem;
    position: relative;
    &.after-emission-description:after {
      content: '...';
      position: absolute;
      padding-left: 1rem;
      right: 0;
      bottom: 0;
      width: 100%;
      font-size: 1rem;
      font-weight: bolder;
      text-align: center;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff 40%);
    }
  }
  .define-width {
    width: 9rem;
  }
  @media (max-width: 960px) {
    .d-flex:not(.flex-column) {
      flex-wrap: nowrap;
    }
  }
}

</style>