<template>
  <div
    id="qrcode-modal"
    class="modal"
  >
    <div class="modal-backdrop" />
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ $t('Share QR Code') }}
          </h5>
          <button
            type="button"
            class="btn-close"
            title="Close"
            @click="closePopup"
          />
        </div>
        <div class="modal-body">
          <QrCode :url="urlPage" />
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-link m-1"
            @click="closePopup"
          >
            {{ $t('Close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Podcast } from '@/store/class/general/podcast';
import { Emission } from '@/store/class/general/emission';
import QrCode from '../../display/sharing/QrCode.vue';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'QrCodeModal',

  components: {
    QrCode
  },

  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    emission: { default: undefined, type: Object as ()=> Emission},
  },

  emits: ['close'],

  data() {
    return {
    };
  },
 
  computed: {
    urlPage(): string{
      if(window.location.href.includes('?productor')){
        return window.location.href;
      }
      if("" !== window.location.search){
        return window.location.href + "&productor=" + this.productor;
      }
      return window.location.href + "?productor=" + this.productor;
    },
    productor(): string{
      if(this.podcast){
        return this.podcast.organisation.id;
      }
      if(this.emission){
        return this.emission.orga.id;
      }
      return "";
    },
  },
  methods:{
    closePopup(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.$emit('close');
    },
  }
})
</script>