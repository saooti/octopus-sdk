<template>
  <div
    v-if="animator"
    class="d-flex align-items-center justify-content-start animators-item"
  >
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: animator.participantId },
        query: { productor: $store.state.filter.organisationId },
      }"
      :title="$t('Participant')"
    >
      <div class="podcast-item-animator text-dark">
        {{ animatorName }}
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Participant } from '@/store/class/general/participant';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'AnimatorsItem',

  props: {
    animator: { default: undefined, type: Object as ()=> Participant},
  },
  computed:{
    animatorName(): string{
      return (`${this.animator?.firstName||''} ${this.animator?.lastName||''}`).trim();
    }
  }
})
</script>

<style lang="scss">
.octopus-app{
  .podcast-item-animator {
    display: flex;
    align-items: flex-start;
    justify-content: center;

    font-size: 0.55rem;
    font-weight: 300;
    text-transform: capitalize;
    margin: 00.25rem 0.5rem 0;
  }
}
</style>