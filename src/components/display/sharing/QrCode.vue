<template>
  <div class="d-flex flex-column align-items-center">
    <qrcode-vue
      :value="url"
      :size="size"
      level="H"
      foreground="#40a372"
      class="myQrCode"
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
})
</script>

<style lang="scss"></style>