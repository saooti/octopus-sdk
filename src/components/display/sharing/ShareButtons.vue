<template>
  <div class="module-box text-center-mobile share-button-page">
    <div class="d-flex align-items-center mb-3 share-button-title">
      <h3
        class="mb-0"
        v-if="
          !bigRound &&
            (authenticated || participantId || organisationId || notExclusive)
        "
      >
        {{ $t('Share') }}
      </h3>
      <span
        class="saooti-help ml-2"
        id="popover-share-help"
        :aria-label="$t('Help')"
        v-if="authenticated"
      ></span>
      <b-popover
        target="popover-share-help"
        triggers="hover"
        placement="right"
        custom-class="wizard-help"
        v-if="authenticated"
      >
        {{ $t('Share this page without edit and share blocks') }}
      </b-popover>
    </div>
    <div
      class="d-flex"
      :class="[
        bigRound && !audioUrl ? 'justify-content-center' : '',
        verticalDisplay ? 'flex-column' : '',
      ]"
    >
      <a
        class="btn btn-bigRound"
        :title="$t('Downloading')"
        :href="audioUrl"
        target="_blank"
        download
        v-if="audioUrl"
        :aria-label="$t('Downloading')"
      >
        <div class="saooti-download-bounty"></div>
      </a>
      <a
        target="_blank"
        :href="facebookURL"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-facebook share-btn mb-2',
          verticalDisplay ? '' : 'mr-2 ml-2',
        ]"
        aria-label="Facebook"
      >
        <span class="saooti-facebook-bounty" v-if="!bigRound"></span>
        <div class="saooti-facebook-bounty" v-else></div>
      </a>
      <a
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-twitter share-btn mb-2',
          verticalDisplay ? '' : 'mr-2 ml-2',
        ]"
        :href="twitterURL"
        aria-label="Twitter"
      >
        <span class="saooti-twitter-bounty" v-if="!bigRound"></span>
        <div class="saooti-twitter-bounty" v-else></div>
      </a>
      <a
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-linkedin share-btn mb-2',
          verticalDisplay ? '' : 'mr-2 ml-2',
        ]"
        :href="linkedinURL"
        aria-label="Linkedin"
      >
        <span class="saooti-linkedin1" v-if="!bigRound"></span>
        <div class="saooti-linkedin1" v-else></div>
      </a>
      <a
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-rss share-btn mb-2',
          verticalDisplay ? '' : 'mr-2 ml-2',
        ]"
        @click.prevent="openPopup()"
        :href="rssUrl"
        :title="$t('Subscribe to this emission')"
        aria-label="RSS"
        v-if="rssUrl"
      >
        <span class="saooti-rss-bounty" v-if="!bigRound"></span>
        <div class="saooti-rss-bounty" v-else></div>
      </a>
      <a
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-rss share-btn mb-2',
          verticalDisplay ? '' : 'mr-2 ml-2',
        ]"
        aria-label="copy"
        @click="onCopyCode(window.location.href, snackbarRef, true)"
      >
        <span class="saooti-link" v-if="!bigRound"></span>
        <div class="saooti-link" v-else></div>
      </a>
      <a
        target="_blank"
        v-if="podcast"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-rss share-btn mb-2',
          verticalDisplay ? '' : 'mr-2 ml-2',
        ]"
        :aria-label="$t('Share newsletter')"
        @click="newsletter = true"
      >
        <span class="saooti-mail-bounty" v-if="!bigRound"></span>
        <div class="saooti-mail-bounty" v-else></div>
      </a>
    </div>
    <ClipboardModal
      v-if="dataRSSSave"
      :closable="true"
      @close="closeModal()"
      :link="rssUrl"
      :emission="emission"
      :title="$t('RSS Link')"
    />
    <NewsletterModal
      v-if="newsletter"
      :closable="true"
      :podcast="podcast"
      @close="newsletter = false"
    />
    <Snackbar ref="snackbar" position="bottom-left"></Snackbar>
  </div>
</template>

<style lang="scss">
.share-button-page {
  @media (max-width: 960px) {
    .flex-column {
      flex-direction: row !important;
    }
    .btn {
      margin-right: 0.5rem;
    }
  }
  @media (max-width: 450px) {
    .flex-column {
      flex-direction: row !important;
      flex-wrap: wrap;
    }
  }
}
.share-button-title {
  height: 2rem;
}
</style>

<script>
import { state } from '../../../store/paramStore.js';
import ClipboardModal from '../../misc/modal/ClipboardModal.vue';
import NewsletterModal from '../../misc/modal/NewsletterModal.vue';
import Snackbar from '../../misc/Snackbar.vue';
import { displayMethods } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  props: [
    'podcast',
    'emission',
    'participantId',
    'organisationId',
    'bigRound',
    'audioUrl',
    'notExclusive',
  ],

  components: {
    ClipboardModal,
    NewsletterModal,
    Snackbar,
  },

  mixins: [displayMethods],

  mounted() {},

  data() {
    return {
      facebookURL: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
      twitterURL: `https://twitter.com/intent/tweet?text=${window.location.href}`,
      linkedinURL: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
      dataRSSSave: false,
      newsletter: false,
    };
  },

  computed: {
    snackbarRef() {
      return this.$refs.snackbar;
    },
    verticalDisplay() {
      return (
        !this.authenticated &&
        !this.participantId &&
        !this.organisationId &&
        !this.notExclusive
      );
    },
    authenticated() {
      return state.generalParameters.authenticated;
    },
    rssUrl() {
      if (this.emission)
        return (
          state.generalParameters.ApiUri +
          'rss/emission/' +
          this.emission.emissionId
        );
      if (this.organisationId)
        return (
          state.generalParameters.ApiUri +
          'rss/productor/' +
          this.organisationId
        );
      if (this.participantId)
        return (
          state.generalParameters.ApiUri +
          'rss/participant/' +
          this.participantId
        );
      return null;
    },
  },

  methods: {
    openPopup() {
      this.dataRSSSave = !this.dataRSSSave;
    },
    closeModal() {
      this.dataRSSSave = false;
    },
  },
});
</script>
