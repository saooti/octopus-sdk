<template>
  <div
    v-if="animators && 0 !== animators.length"
    class="d-flex align-items-center justify-content-start animators-item"
  >
    <router-link
      v-for="(animator, index) in animators"
      v-show="index === visibleIndex"
      :key="animator.participantId"
      :to="{
        name: 'participant',
        params: { participantId: animator.participantId },
        query: { productor: $store.state.filter.organisationId },
      }"
      :title="$t('Participant')"
    >
      <div class="podcast-item-animator text-dark">
        {{ getAnimatorName(animator) }}
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
    animators: { default: undefined, type: Object as ()=> Array<Participant>},
  },

  data() {
    return {
      visibleIndex: 0 as number,
    };
  },
   methods: {
    getAnimatorName(animator: Participant): string {
      const first = animator.firstName || '';
      const last = animator.lastName || '';
      return (first + ' ' + last).trim();
    },
  },
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