<template>
  <div class="module-box flex-grow-0">
    <h3 class="mb-3">
      {{ $t('Subscribe emission') }}
    </h3>
    <div class="d-flex flex-wrap">
      <template
        v-for="sub in subscriptions"
        :key="sub.name"
      >
        <a
          v-if="getUrl(sub.name)"
          rel="noopener"
          target="_blank"
          class="btn me-3 mb-2 share-btn"
          :href="getUrl(sub.name)"
          :title="sub.name"
        >
          <span :class="sub.icon">
            <div
              v-for="index in getPathNumber(sub.name)"
              :key="index"
              :class="'path'+(index+1)"
            />
          </span>
        </a>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Emission } from '@/store/class/general/emission';
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    emission: { default: undefined, type: Object as ()=> Emission},
    podcastId: { default: undefined, type: Number},
  },
   
  data() {
    return {
      subscriptions : [
        {name : 'amazon', icon : 'saooti-amazon'},
        {name:'applePodcast', icon:'saooti-apple'},
        {name:'deezer', icon:'saooti-deezer'},
        {name:'googlePodcasts', icon:"saooti-google-podcasts"},
        {name:'playerFm', icon: 'saooti-saooti-playerfm'},
        {name:'pocketCasts', icon:'saooti-pocket-casts'},
        {name:'podcastAddict', icon: 'saooti-podcast-addict'},
        {name:'radioline', icon:'saooti-radioline'},
        {name:'spotify', icon:'saooti-spotify'},
        {name:'stitcher', icon:'saooti-stitcher-logo'},
        {name:'tunein', icon:'saooti-tunin'}] as Array<{name:string, icon:string}>,
    };
  },

  methods: {
    getPathNumber(sub: string): number{
      switch (sub) {
        case 'amazon': return 3;
        case 'googlePodcasts': return 7;
        case 'stitcher': return 18;
        default: return 0;
      }
    },
    getUrl(sub: string): string | undefined{
      return this.externaliseLinks(this.emission && this.emission.annotations? (this.emission.annotations[sub] as string): undefined);
    },
    externaliseLinks(link?: string): string|undefined {
      if (!link) return link;
      link = link.trim();
      if (!link.startsWith('http') && !link.startsWith('//'))
        return '//' + link;
      return link;
    },
  },
})
</script>
