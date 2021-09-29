<template>
  <div>
    <div :class="{ active: active }">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title h5">
            {{ title }}
          </div>
          <button
            v-if="closable"
            type="button"
            class="close input-no-outline"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span
              aria-hidden="true"
              @click="closePopup"
            >&times;</span>
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
              :aria-label="$t('Copy')"
              @click="onCopyCode(rss, afterCopy)"
            >
          </p>
          <RssSection
            v-if="emission"
            :emission="emission"
          />
        </div>
        <div
          v-if="validatetext"
          class="modal-footer"
        >
          <button
            class="btn btn-primary"
            @click="onValid"
          >
            {{ validatetext }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Emission } from '@/store/class/emission';
import { displayMethods } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ClipboardModal',

  components: {
    RssSection: () => import('@/components/display/aggregator/RssSection.vue'),
  },
  mixins: [displayMethods],

  props: {
    title: { default: undefined, type: String},
    active: { default: false, type: Boolean},
    closable: { default: true, type: Boolean},
    validatetext: { default: undefined, type: String},
    link: { default: undefined, type: String},
    emission: { default: undefined, type: Object as ()=> Emission},
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
})
</script>

<style lang="scss"></style>
