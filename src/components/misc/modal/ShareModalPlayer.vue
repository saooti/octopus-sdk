<template>
  <div>
    <div
      id="share-modal"
      class="modal"
    >
      <div class="modal-backdrop" />
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ $t('Share the player') }}
            </h5>
            <button
              type="button"
              class="btn-close"
              title="Close"
              @click="closePopup"
            />
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs">
              <li
                v-for="(tab, index) in tabs"
                :key="tab"
                class="nav-item"
              >
                <div
                  class="nav-link"
                  :class="activeTab === index? 'active':''"
                  @click="activeTab = index"
                >
                  {{ tab }}
                </div>
              </li>
            </ul>
            <div class="tab-content p-2 share-modal-border">
              <div
                class="tab-pane tab-pane"
                :class="activeTab === 0? 'active':''"
              >
                <p>{{ embedLink }}</p>
                <div
                  class="saooti-copy"
                  @click="onCopyCode(embedLink, afterCopy)"
                />
              </div>
              <div
                class="tab-pane tab-pane"
                :class="activeTab === 1? 'active':''"
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
              </div>
              <div
                v-if="directLink"
                class="tab-pane tab-pane"
                :class="activeTab === 2? 'active':''"
              >
                <p>{{ directLink.audioUrl }}</p>
                <div
                  class="saooti-copy"
                  @click="onCopyCode(directLink.audioUrl, snackbarRef)"
                />
              </div>
            </div>
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
    <Snackbar
      ref="snackbar"
      position="bottom-left"
    />
  </div>
</template>

<script lang="ts">
import Snackbar from '../Snackbar.vue';
import { displayMethods } from '../../mixins/functions';

import QrCode from '../../display/sharing/QrCode.vue';
import { defineComponent } from 'vue'
import { Podcast } from '@/store/class/general/podcast';
import SnackbarVue from '../Snackbar.vue';
export default defineComponent({
  name: 'ShareModalPlayer',

  components: {
    Snackbar,
    QrCode
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
    closePopup(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.$emit('close');
    },
    afterCopy(): void{
      (this.$refs.snackbar as InstanceType<typeof SnackbarVue>).open(this.$t('Data in clipboard'));
    }
  },
})
</script>

<style lang="scss">
.share-modal-border {
  border-right: solid 1px rgb(222, 226, 230);
  border-left: solid 1px rgb(222, 226, 230);
  border-bottom: solid 1px rgb(222, 226, 230);
  background-color: #f8fafc;
  p {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    overflow-wrap: break-word;
    word-wrap: break-word;
    -ms-word-break: break-all;
    word-break: break-all;
    word-break: break-word;
    -ms-hyphens: auto;
    -moz-hyphens: auto;
    -webkit-hyphens: auto;
    hyphens: auto;
    margin-right: 0.5rem;
  }
}
.nav-tabs {
  .nav-item {
    border-right: solid 1px rgb(222, 226, 230);
    border-left: solid 1px rgb(222, 226, 230);
    border-top: solid 1px rgb(222, 226, 230);
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
}
.tab-content {
  .tab-pane.active {
    display: flex;
    justify-content: space-between;
  }
  .saooti-copy {
    cursor: pointer;
    align-self: center;
  }
}
</style>