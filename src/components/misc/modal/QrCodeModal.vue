<template>
  <div>
    <b-modal
      id="qrcode-modal"
      :show="true"
      :title="$t('Share QR Code')"
      @close="closePopup"
      @hide="closePopup"
      @cancel="closePopup"
    >
      <template #default>
        <QrCode :url="urlPage" />
      </template>
      <template #modal-footer>
        <button
          class="btn btn-primary m-1"
          @click="closePopup"
        >
          {{ $t('Close') }}
        </button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Podcast } from '@/store/class/podcast';
import { Emission } from '@/store/class/emission';
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

<style lang="scss"></style>