<template>
  <div class="d-flex flex-column align-items-center">
    <qrcode-vue
      :value="url"
      :size="size"
      level="H"
      :foreground="color"
      class="myQrCode"
      :margin="2" 
    />
    <button
      class="btn m-3"
      @click="download"
    >
      {{ $t('Download') }}
    </button>
    <Snackbar
      ref="snackbar"
      position="bottom-left"
    />
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import profileApi from '@/api/profile';
import Snackbar from '../../misc/Snackbar.vue';
import QrcodeVue from 'qrcode.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'QrCode',

  components: {
    Snackbar,
    QrcodeVue
  },
  props: {
    url: { default: '', type: String},
  },

  data() {
    return {
      size: 200 as number,
      color: "#40a372" as string
    };
  },
  computed:{
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
  },
  methods:{
    download(): void{
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      const canvas = document.getElementsByClassName('myQrCode');
      if(canvas && canvas.length > 0 && canvas[0] && canvas[0].firstChild){
        link.href = (canvas[0].firstChild as any).toDataURL();
        link.click();
        (this.$refs.snackbar as any).open(this.$t('Download started'));
      }
    },
    async initColor(): Promise<void> {
      if (!this.authenticated) return;
      let data;
      if(this.$store.state.organisation && this.$store.state.organisation.attributes && Object.keys(this.$store.state.organisation.attributes).length > 1){
        data = this.$store.state.organisation.attributes;
      }else{
        data= await profileApi.fetchOrganisationAttibutes(
          this.$store.state,
          state.generalParameters.organisationId
        );
      }
      if (Object.prototype.hasOwnProperty.call(data,'COLOR')) {
        this.color = data.COLOR;
      }
    },
  }
})
</script>

<style lang="scss"></style>