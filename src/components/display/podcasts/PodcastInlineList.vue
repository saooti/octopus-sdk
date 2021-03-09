<template>
  <div
    class="d-flex flex-column p-3 list-episode"
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
  >
    <h2>{{ title }}</h2>
    <div class="d-flex justify-content-between">
      <div class="d-flex" v-if="undefined === requirePopularSort">
        <button
          class="btn btn-underline"
          @click="sortPopular()"
          :class="{ active: popularSort }"
        >
          {{ $t('Most popular') }}
        </button>
        <button
          class="btn btn-underline"
          @click="sortChrono()"
          :class="{ active: !popularSort }"
        >
          {{ $t('Last added') }}
        </button>
      </div>
      <div v-else></div>
      <div class="hide-phone" v-if="!isArrow">
        <button
          class="btn btn-arrow"
          @click="displayPrevious()"
          :class="{ disabled: !previousAvailable }"
          :aria-label="$t('Display previous')"
        >
          <div class="saooti-arrow-left2"></div>
        </button>
        <button
          class="btn btn-arrow"
          @click="displayNext()"
          :class="{ disabled: !nextAvailable }"
          :aria-label="$t('Display next')"
        >
          <div class="saooti-arrow-right2"></div>
        </button>
      </div>
    </div>
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading podcasts ...') }}</h3>
    </div>
    <transition-group
      :name="transitionName"
      class="podcast-list-inline"
      tag="ul"
      v-show="loaded"
      :class="[alignLeft ? 'justify-content-start' : '']"
    >
      <PodcastItem
        class="flex-shrink item-phone-margin"
        v-bind:podcast="p"
        v-for="p in podcasts"
        v-bind:key="p.podcastId"
        :class="[alignLeft ? 'mr-3' : '']"
      />
    </transition-group>
    <router-link
      class="btn btn-link"
      :class="buttonPlus ? 'btn-linkPlus' : ''"
      :to="refTo"
      >{{ buttonText }}
      <div class="saooti-plus" v-if="buttonPlus"></div
    ></router-link>
  </div>
</template>

<style lang="scss">
.list-episode {
  padding: 2rem 0rem 1rem !important;
  @media (max-width: 450px) {
    padding: 0.5rem 0rem 1rem !important;
  }
  h2 {
    margin-bottom: 1rem;
  }
}

.podcast-list-inline {
  align-self: stretch;
  flex-grow: 1;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 1rem;
  grid-row: 1;
}
.out-left-enter-active,
.out-left-leave-active,
.out-right-enter-active,
.out-right-leave-active {
  transition: all 0.3s ease;
}

.out-left-leave-to,
.out-right-enter {
  transform: translateX(-110%);
  opacity: 0;
}

.out-left-enter,
.out-right-leave-to {
  transform: translateX(110%);
  opacity: 0;
}

.out-left-leave-to,
.out-right-leave-to {
  position: absolute;
}
.out-right-leave-to {
  right: 5rem;
  z-index: -1;
}
/** PHONES*/
@media (max-width: 960px) {
  .podcast-list-inline {
    display: flex;
    flex-wrap: nowrap;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    padding-bottom: 1rem;
    width: 100%;
    .item-phone-margin {
      margin: 0 0.5rem !important;
    }
  }
}
</style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import domHelper from '../../../helper/dom';
import PodcastItem from './PodcastItem.vue';
import store from '@/store/AppStore';
const PHONE_WIDTH = 960;

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastInlineList',

  props: [
    'organisationId',
    'emissionId',
    'iabId',
    'title',
    'href',
    'buttonText',
    'requirePopularSort',
    'isArrow',
    'buttonPlus',
    'rubriqueId',
    'rubriquageId',
  ],

  components: {
    PodcastItem,
  },

  created() {
    if (undefined !== this.requirePopularSort) {
      this.popularSort = this.requirePopularSort;
    }
    if (undefined !== this.isArrow) {
      this.$emit('update:isArrow', true)
    }
    window.addEventListener('resize', this.handleResize);
  },

  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },

  mounted() {
    this.handleResize();
    this.fetchNext();
  },

  data() {
    return {
      loading: true,
      loaded: true,
      index: 0,
      first: 0,
      size: 5,
      totalCount: 0,
      popularSort: true,
      allPodcasts: [] as any,
      direction: 1,
      alignLeft: false,
    };
  },

  computed: {
    podcasts():any {
      return this.allPodcasts.slice(this.index, this.index + this.size);
    },
    filterOrga() {
      return store.state.filter.organisationId;
    },
    organisation():any {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
    refTo():any {
      if (this.href) return this.href;
      return {
        name: 'category',
        params: { iabId: this.iabId },
        query: { productor: store.state.filter.organisationId },
      };
    },
    previousAvailable():boolean {
      return this.index > 0;
    },
    nextAvailable():boolean {
      return this.index + this.size < this.totalCount;
    },
    transitionName: ({ direction }:any) =>
      direction > 0 ? 'out-left' : 'out-right',
  },

  methods: {
    async fetchNext() {
      const data = await octopusApi.fetchPodcasts({
        first: this.first,
        size: this.size + 1,
        organisationId: this.organisation,
        emissionId: this.emissionId,
        iabId: this.iabId,
        rubriqueId: this.rubriqueId,
        rubriquageId: this.rubriquageId,
        sort: this.popularSort ? 'POPULARITY' : 'DATE',
      });
      this.loading = false;
      this.loaded = true;
      this.totalCount = data.count;
      if (this.allPodcasts.length + data.result.length < this.totalCount) {
        let nexEl = data.result.pop();
        this.preloadImage(nexEl.imageUrl);
      }
      this.allPodcasts = this.allPodcasts.concat(
        data.result.filter((pod:any) => null !== pod)
      );
      if (this.allPodcasts.length <= 3) {
        this.alignLeft = true;
      } else {
        this.alignLeft = false;
      }
      this.first += this.size;
    },

    displayPrevious() {
      this.direction = -1;
      if (this.previousAvailable) {
        this.index -= 1;
      }
    },

    displayNext() {
      this.direction = 1;
      if (!this.nextAvailable) return;
      if (
        this.first - (this.index + this.size) < 2 &&
        this.allPodcasts.length < this.totalCount
      ) {
        this.fetchNext();
      }
      this.index += 1;
    },

    handleResize() {
      if (!this.$el) return;
      if (window.innerWidth <= PHONE_WIDTH) {
        this.size = 10;
        return;
      }
      const width = this.$el.offsetWidth;
      const sixteen = domHelper.convertRemToPixels(13.7);
      this.size = Math.floor(width / sixteen);
    },

    sortPopular() {
      if (this.popularSort) return;

      this.popularSort = true;
      this.reset();
      this.fetchNext();
    },

    sortChrono() {
      if (!this.popularSort) return;

      this.popularSort = false;
      this.reset();
      this.fetchNext();
    },

    reset() {
      this.loading = true;
      this.loaded = true;
      this.index = 0;
      this.first = 0;
      this.totalCount = 0;
      this.allPodcasts.length = 0;
    },

    preloadImage(url:string) {
      let img = new Image();
      img.src = url;
    },
  },

  watch: {
    emissionId: {
      handler() {
        this.reset();
        this.fetchNext();
      },
    },
    organisationId: {
      handler() {
        this.reset();
        this.fetchNext();
      },
    },
    filterOrga: {
      handler() {
        this.reset();
        this.fetchNext();
      },
    },
    iabId: {
      handler() {
        this.reset();
        this.fetchNext();
      },
    },
    rubriqueId: {
      handler() {
        this.reset();
        this.fetchNext();
      },
    },
    rubriquageId: {
      handler() {
        this.reset();
        this.fetchNext();
      },
    },
  },
});
</script>
