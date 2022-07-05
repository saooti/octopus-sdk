<template>
  <div class="module-box text-center-mobile">
    <template
      v-if="authenticated || participantId || organisationId || notExclusive"
    >
      <div class="d-flex mb-2">
        <h3 class="mb-0">
          {{ $t('Share') }}
        </h3>
        <span
          v-if="authenticated"
          id="popover-share-help"
          role="button"
          tabindex="0"
          class="saooti-help ms-2 align-items-start"
          :title="$t('Help')"
        />
        <Popover
          v-if="authenticated"
          target="popover-share-help"
          placement="right"
        >
          {{ $t('Share this page without edit and share blocks') }}
        </Popover>
      </div>
      <div class="d-flex align-items-center">
        <ShareButtonsIntern
          :podcast="podcast"
          :emission="emission"
          :participant-id="participantId"
          :organisation-id="organisationId"
          :not-exclusive="notExclusive"
        />
      </div>
    </template>
    <div
      v-else
      class="d-flex-row"
    >
      <ShareButtonsIntern
        :podcast="podcast"
        :emission="emission"
        :participant-id="participantId"
        :organisation-id="organisationId"
        :not-exclusive="notExclusive"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Emission } from '@/store/class/general/emission';
import { Podcast } from '@/store/class/general/podcast';
import { state } from '../../../store/paramStore';
import { displayMethods } from '../../mixins/functions';
import Popover from '../../misc/Popover.vue';
import ShareButtonsIntern from './ShareButtonsIntern.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  components: {
    ShareButtonsIntern,
    Popover,
  },
  mixins: [displayMethods],
  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    emission: { default: undefined, type: Object as ()=> Emission},
    participantId: { default: undefined, type: Number},
    organisationId: { default: undefined, type: String},
    notExclusive: { default: true, type: Boolean},
  },
  computed: {
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
  },
})
</script>
