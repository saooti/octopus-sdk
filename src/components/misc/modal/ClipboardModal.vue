<template>
  <ClassicModal
    id-modal="clipboard-modal"
    :title-modal="$t('RSS Link')"
    @close="closePopup"
  >
    <template #body>
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
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import ClassicModal from '../modal/ClassicModal.vue';
import { Emission } from '@/stores/class/general/emission';
import displayMethods from '../../mixins/displayMethods';
import { defineComponent, defineAsyncComponent } from 'vue';
import { state } from '../../../stores/ParamSdkStore';
const RssSection = defineAsyncComponent(() => import('@/components/display/aggregator/RssSection.vue'));
export default defineComponent({
  name: 'ClipboardModal',
  components: {
    RssSection,
    ClassicModal
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

