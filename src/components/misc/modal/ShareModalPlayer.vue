<template>
  <ClassicModal
    id-modal="share-modal"
    :title-modal="$t('Share the player')"
    @close="closePopup"
  >
    <template #body>
      <Nav :tab-number="tabs.length" :activeTab="activeTab">
        <template
          v-for="(tab, index) in tabs"
          #[index]
        >
          {{ tab }}
        </template>
        <template 
          #tab0
        >
          <p>{{ embedLink }}</p>
          <div
            class="saooti-copy"
            @click="onCopyCode(embedLink, afterCopy)"
          />
        </template>
        <template 
          #tab1
        >
          <div class="d-flex flex-column">
            <div class="d-flex">
              <p>{{ embedlyLink }}</p>
              <div
                class="saooti-copy"
                @click="onCopyCode(embedlyLink, afterCopy)"
              />
            </div>
            <QrCode :url="embedlyLink" />
          </div>
        </template>
        <template
          v-if="directLink"
          #tab2
        >
          <p>{{ directLink.audioUrl }}</p>
          <div
            class="saooti-copy"
            @click="onCopyCode(directLink.audioUrl, snackbarRef)"
          />
        </template>
      </Nav>
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
  <Snackbar
    ref="snackbar"
    position="bottom-left"
  />
</template>

<script lang="ts">
import Snackbar from '../Snackbar.vue';
import displayMethods from '../../mixins/displayMethods';
import ClassicModal from '../modal/ClassicModal.vue';
import Nav from '../Nav.vue';
import QrCode from '../../display/sharing/QrCode.vue';
import { defineComponent } from 'vue'
import { Podcast } from '@/store/class/general/podcast';
export default defineComponent({
  name: 'ShareModalPlayer',

  components: {
    Snackbar,
    QrCode,
    ClassicModal,
    Nav
  },
  mixins: [displayMethods],
  props: {
    embedLink: { default: undefined, type: String},
    embedlyLink: { default: undefined, type: String},
    directLink: { default: undefined, type: Object as ()=>Podcast},
  },
  emits: ['close'],
  data() {
    return {
      activeTab: 0 as number,
    };
  },
  computed:{
    tabs(): Array<string>{
      if(this.directLink){
        return [this.$t('Embed link'),this.$t('Embedly link'),this.$t('Direct link')];
      }
      return [this.$t('Embed link'),this.$t('Embedly link')];
    }
  },
  methods: {
    closePopup(): void {
      this.$emit('close');
    },
    afterCopy(): void{
      (this.$refs.snackbar as InstanceType<typeof Snackbar>).open(this.$t('Data in clipboard'));
    }
  },
})
</script>

<style lang="scss">
.octopus-app{
  #share-modal{
    .saooti-copy {
      cursor: pointer;
      align-self: center;
    }
  }
}
</style>