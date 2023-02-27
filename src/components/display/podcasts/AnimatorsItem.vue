<template>
  <div
    v-if="animator"
    class="d-flex align-items-center justify-content-start animators-item"
  >
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: animator.participantId },
        query: { productor: filterOrgaId },
      }"
      :title="$t('Participant')"
      class="podcast-item-animator text-dark"
    >
      {{ animatorName }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { Participant } from '@/stores/class/general/participant';
import { useFilterStore } from '@/stores/FilterStore';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'AnimatorsItem',

  props: {
    animator: { default: undefined, type: Object as ()=> Participant},
  },
  computed:{
    ...mapState(useFilterStore, ['filterOrgaId']),
    animatorName(): string{
      return (`${this.animator?.firstName??''} ${this.animator?.lastName??''}`).trim();
    }
  }
})
</script>

<style lang="scss">
.octopus-app{
  .podcast-item-animator {
    font-size: 0.55rem;
    font-weight: 300;
    text-transform: capitalize;
    margin: 00.25rem 0.5rem 0;
  }
}
</style>