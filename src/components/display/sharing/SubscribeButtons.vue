<template>
  <div class="module-box flex-grow-0">
    <h3 class="mb-2 height-40">
      {{ $t('Subscribe emission') }}
    </h3>
    <template
      v-for="(sub, index) in subscriptionsDisplay"
      :key="sub.name"
    >
      <a
        rel="noopener"
        target="_blank"
        :class="[
          0 === index? 'first': '',
          subscriptionsDisplay.length-1 === index? 'last': '',
        ]"
        class="btn share-btn mb-2 mx-2"
        :href="sub.url"
        :title="sub.name"
      >
        <span :class="sub.icon">
          <div
            v-for="indexPath in getPathNumber(sub.name)"
            :key="indexPath"
            :class="'path'+(indexPath+1)"
          />
        </span>
      </a>
    </template>
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
  computed:{
    subscriptionsDisplay(){
      const sub = [
        {name : 'amazon', icon : 'saooti-amazon', url : this.getUrl('amazon')},
        {name:'applePodcast', icon:'saooti-apple', url : this.getUrl('applePodcast')},
        {name:'deezer', icon:'saooti-deezer', url : this.getUrl('deezer')},
        {name:'googlePodcasts', icon:"saooti-google-podcasts", url : this.getUrl('googlePodcasts')},
        {name:'playerFm', icon: 'saooti-saooti-playerfm', url : this.getUrl('playerFm')},
        {name:'pocketCasts', icon:'saooti-pocket-casts', url : this.getUrl('pocketCasts')},
        {name:'podcastAddict', icon: 'saooti-podcast-addict', url : this.getUrl('podcastAddict')},
        {name:'radioline', icon:'saooti-radioline', url : this.getUrl('radioline')},
        {name:'spotify', icon:'saooti-spotify', url : this.getUrl('spotify')},
        {name:'stitcher', icon:'saooti-stitcher-logo', url : this.getUrl('stitcher')},
        {name:'tunein', icon:'saooti-tunin', url : this.getUrl('tunein')}
      ];
      return sub.filter(item=> item.url);
    }
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
<style lang="scss">
.height-40{
  height: 40px;
}
</style>