<template>
  <div
    class="d-flex align-items-center justify-content-start"
    v-if="animators && 0 !== animators.length"
  >
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: animator.participantId },
        query: { productor: $store.state.filter.organisationId },
      }"
      class="animator-item"
      v-for="(animator, index) in animators"
      v-bind:key="animator.participantId"
      v-show="index === visibleIndex"
      :aria-label="$t('Participant')"
    >
      <div class="podcast-item-animator text-dark">
        {{ getAnimatorName(animator) }}
      </div>
    </router-link>
  </div>
</template>

<style lang="scss">
.podcast-item-animator {
  display: flex;
  align-items: flex-start;
  justify-content: center;

  font-size: 0.55rem;
  font-weight: 300;
  text-transform: capitalize;
  margin: 00.25rem 0.5rem 0;
}
</style>

<script lang="ts">
import { Participant } from '@/store/class/participant';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'AnimatorsItem',

  props: {
    animators: { default: undefined as Array<Participant>|undefined},
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
