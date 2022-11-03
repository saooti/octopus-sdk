<template>
  <ClassicModal
    id-modal="qrcode-modal"
    :title-modal="$t('Share QR Code')"
    @close="closePopup"
  >
    <template #body>
      <QrCode :url="urlPage" />
    </template>
    <template #footer>
      <button
        class="btn btn-primary m-1"
        @click="closePopup"
      >
        {{ $t('Close') }}
      </button>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import ClassicModal from '../modal/ClassicModal.vue';
import QrCode from '../../display/sharing/QrCode.vue';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'QrCodeModal',
  components: {
    QrCode,
    ClassicModal
  },
  props: {
    urlPage: { default: undefined, type: String},
  },
  emits: ['close'],
  methods:{
    closePopup(): void {
      this.$emit('close');
    },
  }
})
</script>