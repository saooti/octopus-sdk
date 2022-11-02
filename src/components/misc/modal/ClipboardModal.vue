<template>
  <div class="modal">
    <div class="modal-backdrop" />
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title h5">
            {{ $t('RSS Link') }}
          </div>
          <button
            ref="focusElement"
            type="button"
            class="btn-transparent text-light saooti-remove"
            title="Close"
            @click="closePopup"
          />
        </div>
        <div class="modal-body">
          <p class="d-flex justify-content-between align-items-center">
            {{ $t('Rss feed:') }}
            <span id="LINK">{{ link }}</span>
            <input
              type="button"
              :value="$t('Copy')"
              class="btn btn-primary"
              :title="$t('Copy')"
              @click="onCopyCode(link, afterCopy)"
            >
          </p>
          <RssSection
            v-if="emission && authenticated"
            :emission="emission"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Emission } from '@/store/class/general/emission';
import displayMethods from '../../mixins/displayMethods';
import { defineComponent, defineAsyncComponent } from 'vue';
import { state } from '../../../store/paramStore';
const RssSection = defineAsyncComponent(() => import('@/components/display/aggregator/RssSection.vue'));
export default defineComponent({
  name: 'ClipboardModal',
  components: {
    RssSection,
  },
  mixins: [displayMethods],

  props: {
    link: { default: '', type: String},
    emission: { default: undefined, type: Object as ()=> Emission},
  },
  emits: ['close', 'copy'],
  computed: {
    authenticated(): boolean {
      return state.generalParameters.authenticated??false;
    },
  },
  mounted(){
    (this.$refs.focusElement as HTMLElement)?.focus();
  },

  methods: {
    closePopup(): void {
      this.$emit('close');
    },
    afterCopy(): void{
      this.$emit("copy");
    }
  },
})
</script>

