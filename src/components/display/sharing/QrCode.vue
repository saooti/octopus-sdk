<template>
  <div class="d-flex flex-column align-items-center">
    <qrcode-vue :value="url" :size="size" level="H" foreground="#40a372" class="myQrCode"/>
    <button class="btn m-3" @click="download">{{ $t('Download') }}</button>
    <Snackbar ref="snackbar" position="bottom-left"></Snackbar>
  </div>
</template>

<style lang="scss">
</style>
<script lang="ts">
import Snackbar from '../../misc/Snackbar.vue';
import QrcodeVue from 'qrcode.vue'
import Vue from 'vue';
export default Vue.extend({
  name: 'QrCode',
  props: {
    url: { default: '' as string},
  },

  components: {
    Snackbar,
    QrcodeVue
  },

  data() {
    return {
      size: 200 as number,
    };
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
    }
  }
});
</script>
