<template>
  <div 
    v-if="playerRadio.history.length"
    class="d-flex align-items-center flex-wrap mt-3"
  >
    <div class="fw-bold me-3">
      {{ $t('Previously') +':' }}
    </div>
    <div 
      v-for="pastItem in playerRadio.history" 
      :key="pastItem.title"
      class="me-3"
    >
      <span class="me-2 hour-past-item">{{ displayTimeItem(pastItem) }}</span>
      <span>{{ displayPreviousItem(pastItem) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { usePlayerStore } from '@/stores/PlayerStore';
import { mapState } from 'pinia';
import dayjs from 'dayjs';
import {fetchRadioData} from '../../../mixins/radio/fetchRadioData';
import { defineComponent } from 'vue';
import { MediaRadio } from '@/stores/class/general/player';
export default defineComponent({
  name: 'RadioHistory',

  components: {
  },

  mixins: [fetchRadioData],
  emits: ['updateNotListenTime'],
  data() {
    return {
    };
  },
  
  computed: {
    ...mapState(usePlayerStore, ['playerRadio']),
  },
  mounted(){
    console.log(this.playerRadio);
  },
  methods:{
    displayTimeItem(item: MediaRadio):string{
      return dayjs(item.startDate).format('HH:mm');
    },
    displayPreviousItem(item: MediaRadio):string{
      if(item.podcastId){
        return item.title;
      }
      return this.displayTitle(item);
    }
  }
})
</script>
<style lang="scss">
.octopus-app{
  .hour-past-item{
    font-size: 0.8rem;
    color: #dbdbdb;
  }
}
</style>