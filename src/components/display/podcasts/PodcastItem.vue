<template>
  <li
    class="podcast-item-container m-0"
    :class="[
      podcastShadow ? 'shadow-element' : '',
      podcastBorderBottom ? 'border-bottom' : '',
    ]"
    :data-pubdate="displayDate"
    :data-count="podcast.downloadCount"
  >
    <PodcastImage
      v-bind:podcast="podcast"
      :hidePlay="!hover || !description"
      :displayDescription="description"
      :arrowDirection="arrowDirection"
      @hideDescription="hideDescription"
      @showDescription="showDescription"
    />
    <div
      :id="'description-podcast-container-' + podcast.podcastId"
      class="description-podcast-item html-wysiwyg-content"
      :class="[
        hover && description ? 'visible' : 'invisible',
        isDescriptionBig ? 'after-podcast-description' : '',
      ]"
    >
      <div
        :id="'description-podcast-' + podcast.podcastId"
        v-html="description"
      ></div>
    </div>
    <div
      class="d-contents"
      @mouseenter="showDescription"
      @mouseleave="hideDescription"
    >
      <div class="d-flex justify-content-between flex-wrap text-secondary mb-3">
        <div class="mr-3 small-Text">{{ date }}</div>
        <div class="small-Text" v-if="0 !== duration.length">
          <!-- <span class="saooti-clock3"></span> -->{{ duration }}
        </div>
      </div>
      <AnimatorsItem v-bind:animators="podcast.animators" />
      <router-link
        :to="{
          name: 'podcast',
          params: { podcastId: podcast.podcastId },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark d-flex flex-column flex-grow"
      >
        <div class="title-podcast-item">{{ title }}</div>
      </router-link>
      <div class="d-flex justify-content-between">
        <router-link
          v-if="!isPodcastmaker"
          :to="{
            name: 'productor',
            params: { productorId: podcast.organisation.id },
            query: { productor: $store.state.filter.organisationId },
          }"
          class="text-dark producer-podcast-item"
        >
          <div>{{ '© ' + podcast.organisation.name }}</div>
        </router-link>
        <span
          class="saooti-star-bounty text-danger pr-2"
          v-if="editRight && podcast.order && podcast.order > 1"
        ></span>
      </div>
    </div>
  </li>
</template>

<style lang="scss">
.podcast-item-container {
  border-radius: 0.8rem;
  list-style: none;
  position: relative;
  width: 13rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-align: left;
  background: #fff;
  flex-shrink: 0;
  .text-secondary {
    margin: 0.5rem !important;
  }
  .saooti-star-bounty {
    font-size: 22px;
  }

  .title-podcast-item {
    font-weight: 700;
    margin: 0.25rem 0.5rem 0.5rem;
    overflow: hidden;
    display: -webkit-box;
    flex-grow: 1;
    font-size: 0.7rem;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    min-height: 3rem;
    line-height: 1rem;
    word-break: break-word;
  }
  .description-podcast-item {
    padding: 1rem;
    color: #333;
    background-color: rgba(255, 255, 255, 0.92);
    height: 13rem;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9em;
    position: absolute;
    width: 13rem;
    word-break: break-word;
    &.after-podcast-description:after {
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
  .producer-podcast-item {
    margin: 0.2rem 0.5rem 0.5rem;
    font-size: 0.55rem;
    color: #666;
  }

  @media (max-width: 960px) {
    margin: 0.5rem !important;
  }
}
</style>

<script>
import AnimatorsItem from './AnimatorsItem.vue';
import PodcastImage from './PodcastImage.vue';
import { state } from '../../../store/paramStore.js';
const moment = require('moment');
const humanizeDuration = require('humanize-duration');

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastItem',

  props: ['podcast'],

  components: {
    AnimatorsItem,
    PodcastImage,
  },

  mounted() {
    let podcastDesc = document.getElementById(
      'description-podcast-' + this.podcast.podcastId
    );
    let podcastDescContainer = document.getElementById(
      'description-podcast-container-' + this.podcast.podcastId
    );
    if (
      null !== podcastDesc &&
      podcastDesc.clientHeight > podcastDescContainer.clientHeight
    ) {
      this.isDescriptionBig = true;
    }
  },

  data() {
    return {
      hover: false,
      arrowDirection: 'up',
      isDescriptionBig: false,
    };
  },

  computed: {
    isPodcastmaker() {
      return state.generalParameters.podcastmaker;
    },
    podcastShadow() {
      return state.podcastsPage.podcastShadow;
    },
    podcastBorderBottom() {
      return state.podcastsPage.podcastBorderBottom;
    },
    date() {
      return moment(this.podcast.pubDate).format('D/MM/YYYY [à] HH[h]mm');
    },
    displayDate() {
      return moment(this.podcast.pubDate).format('X');
    },
    category() {
      const catIds = this.podcast.emission.iabIds;
      return state.generalParameters.allCategories
        .filter(c => {
          return catIds.includes(c.id);
        })
        .map(c => {
          return c.name;
        })
        .join(', ');
    },

    description() {
      if (!this.podcast.description) return null;
      return this.podcast.description;
    },

    title() {
      if (state.generalParameters.isIE11)
        return this.podcast.title.substring(0, 50) + '...';
      return this.podcast.title;
    },
    organisationId() {
      return state.generalParameters.organisationId;
    },
    authenticated() {
      return state.generalParameters.authenticated;
    },
    editRight() {
      if (
        (this.authenticated &&
          this.organisationId === this.podcast.organisation.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },

    duration() {
      if (this.podcast.duration <= 1) return '';

      if (this.podcast.duration > 600000) {
        return humanizeDuration(this.podcast.duration, {
          language: 'shortFr',
          largest: 1,
          round: true,
          languages: {
            shortFr: {
              y: () => 'années',
              mo: () => 'mois',
              w: () => 'semaines',
              d: () => 'jours',
              h: () => 'h',
              m: () => 'min',
              s: () => 'sec',
              ms: () => 'ms',
            },
          },
        });
      }
      return humanizeDuration(this.podcast.duration, {
        language: 'shortFr',
        largest: 2,
        round: true,
        languages: {
          shortFr: {
            m: () => 'min',
            s: () => 'sec',
            ms: () => 'ms',
          },
        },
      });
    },
  },
  methods: {
    showDescription() {
      this.arrowDirection = 'down';
      this.hover = true;
    },
    hideDescription() {
      this.arrowDirection = 'up';
      this.hover = false;
    },
  },
});
</script>
