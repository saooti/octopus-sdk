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
            ref="focusElement"
            type="button"
            class="btn-close btn-close-white"
            title="Close"
            @click="closePopup"
          />
        </div>
        <div class="modal-body">
          <QrCode :url="urlPage" />
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-primary m-1"
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
import QrCode from '../../display/sharing/QrCode.vue';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'QrCodeModal',
  components: {
    QrCode
  },
  props: {
    urlPage: { default: undefined, type: String},
  },
  emits: ['close'],
  mounted(){
    (this.$refs.focusElement as HTMLElement)?.focus();
  },
  methods:{
    closePopup(): void {
      this.$emit('close');
    },
  }
})
</script>