<template>
  <div>
    <b-modal
      id="qrcode-modal"
      @close="closePopup"
      @hide="closePopup"
      @cancel="closePopup"
      :show="true"
      :title="$t('Share QR Code')"
    >
      <template v-slot:default>
        <QrCode :url="urlPage"/>
      </template>
      <template v-slot:modal-footer>
        <button class="btn btn-primary m-1" @click="closePopup">
          {{ $t('Close') }}
        </button>
      </template>
    </b-modal>
  </div>
</template>

<style lang="scss">
</style>
<script lang="ts">
import { Podcast } from '@/store/class/podcast';
import { Emission } from '@/store/class/emission';
import QrCode from '../../display/sharing/QrCode.vue';
export default{
  name: 'QrCodeModal',
  props: {
    podcast: { default: undefined as Podcast|undefined},
    emission: { default: undefined as Emission|undefined},
  },
  emits: ['close'],

  components: {
    QrCode
  },

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
};
</script>
