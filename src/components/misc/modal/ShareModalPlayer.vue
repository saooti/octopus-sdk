<template>
  <div>
    <b-modal
      id="share-modal"
      @close="closePopup"
      @hide="closePopup"
      @cancel="closePopup"
      :title="$t('Share the player')"
    >
      <template v-slot:default>
        <b-tabs content-class="p-2 share-modal-border">
          <b-tab :title="$t('Embed link')" class="tab-pane" active>
            <p>{{ embedLink }}</p>
            <div
              class="saooti-copy"
              @click="onCopyCode(embedLink, afterCopy)"
            ></div>
          </b-tab>
          <b-tab :title="$t('Embedly link')" class="tab-pane">
            <p>{{ embedlyLink }}</p>
            <div
              class="saooti-copy"
              @click="onCopyCode(embedlyLink, afterCopy)"
            ></div>
          </b-tab>
          <b-tab :title="$t('Direct link')" class="tab-pane" v-if="directLink">
            <p>{{ directLink.audioUrl }}</p>
            <div
              class="saooti-copy"
              @click="onCopyCode(directLink.audioUrl, afterCopy)"
            ></div>
          </b-tab>
        </b-tabs>
      </template>
      <template v-slot:modal-footer>
        <button class="btn btn-primary m-1" @click="closePopup">
          {{ $t('Close') }}
        </button>
      </template>
    </b-modal>
    <Snackbar ref="snackbar" position="bottom-left"></Snackbar>
  </div>
</template>

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
<script lang="ts">
import Snackbar from '../Snackbar.vue';
import { displayMethods } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ShareModalPlayer',

  props: ['embedLink', 'embedlyLink', 'directLink'],
  emits: ['close'],

  components: {
    Snackbar,
  },

  mixins: [displayMethods],

  mounted() {
    /* this.$bvModal.show('share-modal'); */
  },
  computed: {
    snackbarRef():any {
      return this.$refs.snackbar;
    },
  },

  methods: {
    closePopup(event: { preventDefault: () => void; }) {
      event.preventDefault();
      this.$emit('close');
    },
    afterCopy(){
      this.snackbarRef.open(this.$t('Data in clipboard'));
    }
  },
});
</script>
