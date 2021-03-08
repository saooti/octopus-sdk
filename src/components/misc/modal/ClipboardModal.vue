<template>
  <div>
    <div v-bind:class="{ active: active }">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title h5">{{ title }}</div>
          <button
            type="button"
            class="close input-no-outline"
            data-dismiss="modal"
            aria-label="Close"
            v-if="closable"
          >
            <span aria-hidden="true" @click="closePopup">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="d-flex justify-content-between align-items-center">
            {{ $t('Rss feed:') }}
            <span id="LINK">{{ rss }}</span>
            <input
              type="button"
              :value="$t('Copy')"
              class="btn btn-primary"
              @click="onCopyCode(rss, undefined, false)"
              :aria-label="$t('Copy')"
            />
          </p>
          <RssSection :emission="emission" v-if="emission" />
        </div>
        <div class="modal-footer" v-if="validatetext">
          <button class="btn btn-primary" @click="onValid">
            {{ validatetext }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import RssSection from '@/components/display/aggregator/RssSection.vue';
import { displayMethods } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ClipboardModal',

  components: {
    RssSection,
  },

  mixins: [displayMethods],

  props: ['title', 'active', 'closable', 'validatetext', 'link', 'emission'],

  created() {
    this.rss = this.link;
  },

  data() {
    return {
      rss: '',
    };
  },

  methods: {
    closePopup(event) {
      event.preventDefault();
      this.$emit('close');
    },

    onValid() {
      this.$emit('validate');
    },
  },
});
</script>
