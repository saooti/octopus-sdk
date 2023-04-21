<template>
  <div class="module-box">
    <div class="d-flex align-items-center mb-3">
      <h2 class="big-h2 mb-0">{{ $t('Share') }}</h2>
      <span
        v-if="authenticated"
        id="popover-share-help"
        role="button"
        tabindex="0"
        class="saooti-help ms-2"
      />
      <Popover
        v-if="authenticated"
        target="popover-share-help"
        :title="$t('Help')"
        :content="$t('Share this page without edit and share blocks')"
        relativeClass="page-element"
        :isFixed="true"
      />
    </div>
    <div class="d-flex align-items-center justify-content-between">
      <ShareButtonsIntern
        :podcast="podcast"
        :emission="emission"
        :playlist="playlist"
        :participant-id="participantId"
        :organisation-id="organisationId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Emission } from '@/stores/class/general/emission';
import { Podcast } from '@/stores/class/general/podcast';
import { state } from '../../../stores/ParamSdkStore';
import displayMethods from '../../mixins/displayMethods';
import Popover from '../../misc/Popover.vue';
import ShareButtonsIntern from './ShareButtonsIntern.vue';
import { defineComponent } from 'vue';
import { Playlist } from '@/stores/class/general/playlist';
export default defineComponent({
  components: {
    ShareButtonsIntern,
    Popover,
  },
  mixins: [displayMethods],
  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    emission: { default: undefined, type: Object as ()=> Emission},
    playlist: { default: undefined, type: Object as ()=>Playlist},
    participantId: { default: undefined, type: Number},
    organisationId: { default: undefined, type: String},
  },
  computed: {
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
  },
})
</script>
