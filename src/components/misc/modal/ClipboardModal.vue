<template>
  <div>
    <div v-bind:class="{ active: active }">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title h5">{{ title }}</div>
          <button
            type="button"
            class="close input-no-outline"
            data-dismiss="modal"
            aria-label="Close"
            v-if="closable"
          >
            <span aria-hidden="true" @click="closePopup">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="d-flex justify-content-between align-items-center">
            {{ $t('Rss feed:') }}
            <span id="LINK">{{ rss }}</span>
            <input
              type="button"
              :value="$t('Copy')"
              class="btn btn-primary"
              @click="onCopyCode(rss, afterCopy)"
              :aria-label="$t('Copy')"
            />
          </p>
          <RssSection :emission="emission" v-if="emission" />
        </div>
        <div class="modal-footer" v-if="validatetext">
          <button class="btn btn-primary" @click="onValid">
            {{ validatetext }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import { Emission } from '@/store/class/emission';
import { displayMethods } from '../../mixins/functions';
export default {
  name: 'ClipboardModal',
  mixins: [displayMethods],

  components: {
    RssSection: () => import('@/components/display/aggregator/RssSection.vue'),
  },

  props: {
    title: { default: undefined as string|undefined},
    active: { default: false as boolean},
    closable: { default: true as boolean},
    validatetext: { default: undefined as string|undefined},
    link: { default: undefined as string|undefined},
    emission: { default: undefined as Emission|undefined},
  },
  emits: ['close', 'validate'],

  data() {
    return {
      rss: '' as string,
    };
  },

  created() {
    this.rss = this.link;
  },

  methods: {
    closePopup(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.$emit('close');
    },

    onValid(): void {
      this.$emit('validate');
    },
    afterCopy(): void{
      return;
    }
  },
};
</script>
