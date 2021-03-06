<template>
  <li
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
      <div class="emissionPlayerItem-info" v-if="rubriqueName">
        {{ rubriqueName }}
      </div>
      <div
        class="img-box no-border-round"
        :style="{
          'background-image':
            'url(\'' + emission.imageUrl + '?dummy=' + dummyParam + '\')',
        }"
      ><div v-if="titleInImage" class="titleInImage">{{ emission.name }}</div></div>
      <div class="d-flex flex-column p-2">
        <div class="font-weight-bold text-uppercase text-ellipsis">
          {{ emission.name }}
        </div>
        <div
          :id="'description-emission-container-' + emission.emissionId"
          class="emission-description html-wysiwyg-content"
        >
          <div
            :id="'description-emission-' + emission.emissionId"
            v-html="urlify(emission.description)"
          ></div>
        </div>
        <!-- <div class="text-ellipsis html-wysiwyg-content" v-html="urlify(emission.description)"></div> -->
      </div>
    </router-link>
    <div
      class="border-top emission-item-border-color p-2 secondary-bg d-flex"
      v-for="p in podcasts"
      :key="p.podcastId"
    >
      <div class="d-flex justify-content-between flex-grow">
        <router-link
          :to="{
            name: 'podcast',
            params: { podcastId: p.podcastId },
            query: { productor: $store.state.filter.organisationId },
          }"
          class="d-flex flex-column define-width text-dark"
        >
          <div class="font-weight-bold text-ellipsis">{{ p.title }}</div>
          <div
            :id="'description-podcast-container-' + p.podcastId"
            class="emission-description html-wysiwyg-content"
          >
            <div
              :id="'description-podcast-' + p.podcastId"
              v-html="urlify(p.description)"
            ></div>
          </div>
        </router-link>
        <div
          class="play-button-box bg-secondary"
          @click="play(p)"
          v-if="
            $store.state.player.podcast !== p ||
              ($store.state.player.podcast === p &&
                'PAUSED' === $store.state.player.status)
          "
        >
          <div
            class="text-light saooti-play2-bounty"
            :aria-label="$t('Play')"
          ></div>
        </div>
        <div class="play-button-box bg-secondary" @click="pause(p)" v-else>
          <div
            class="text-light saooti-pause-bounty"
            :aria-label="$t('Pause')"
          ></div>
        </div>
      </div>
    </div>
    <div
      class="border-top emission-item-border-color p-2 secondary-bg d-flex justify-content-center"
      v-if="buttonMore && podcasts.length === nbPodcasts"
    >
      <router-link
        :to="{
          name: 'emission',
          params: { emissionId: emission.emissionId },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="btn"
        >{{ $t('More episodes') }}</router-link
      >
    </div>
  </li>
</template>

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
.emission-item-border-color {
  border-color: #ddd;
}
</style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import { Emission } from '@/store/class/emission';
import { Podcast } from '@/store/class/podcast';
import { state } from '../../../store/paramStore';
import { displayMethods } from '../../mixins/functions';
export default displayMethods.extend({
  name: 'EmissionPlayerItem',
  props: {
    emission: { default: undefined as Emission|undefined },
    nbPodcasts: { default: undefined as number|undefined },
    rubriqueName: { default: undefined as string|undefined },
  },

  data() {
    return {
      activeEmission: true as boolean,
      podcasts: [] as Array<Podcast>,
      dummyParam: new Date().getTime().toString() as string,
    };
  },

  created() {
    /* if(!this.editRight)return; */
    this.loadPodcasts();
  },
  mounted() {
    const emissionDesc = document.getElementById(
      'description-emission-' + this.emission.emissionId
    );
    const emissionDescContainer = document.getElementById(
      'description-emission-container-' + this.emission.emissionId
    );
    if (
      null !== emissionDesc &&
      emissionDesc.clientHeight > emissionDescContainer!.clientHeight
    ) {
      emissionDescContainer!.classList.add('after-emission-description');
    }
  },
  
  computed: {
    buttonMore(): boolean {
      return state.emissionsPage.buttonMore;
    },
    titleInImage(): boolean {
      return state.emissionsPage.titleInImage;
    },
    authenticated(): boolean {
      return this.$store.state.authentication.isAuthenticated;
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    editRight(): boolean {
      if (
        (this.authenticated && this.organisationId === this.emission.orga.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
  },
  methods: {
    async loadPodcasts(): Promise<void> {
      const nb = this.nbPodcasts ? this.nbPodcasts : 2;
      const data = await octopusApi.fetchPodcasts({
        emissionId: this.emission.emissionId,
        size: nb,
      });
      if (0 === data.count) {
        this.activeEmission = false;
      }
      this.podcasts = data.result;
      this.$nextTick(() => {
      for (let index = 0, len = this.podcasts.length; index < len; index++) {
        const podcastDesc = document.getElementById(
          'description-podcast-' + this.podcasts[index].podcastId
        );
        const podcastDescContainer = document.getElementById(
          'description-podcast-container-' + this.podcasts[index].podcastId
        );
        if (
          null !== podcastDesc &&
          podcastDesc.clientHeight > podcastDescContainer!.clientHeight
        ) {
          podcastDescContainer!.classList.add('after-emission-description');
        }
      }
      });
      /* if (this.editRight || this.activeEmission) {
        return;
      }
      this.$emit('emissionNotVisible'); */
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
});
</script>
