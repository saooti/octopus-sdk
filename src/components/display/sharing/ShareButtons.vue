<template>
  <div class="module-box text-center-mobile share-button-page">
    <div class="d-flex align-items-center mb-3 share-button-title">
      <h3
        v-if="
          !bigRound &&
            (authenticated || participantId || organisationId || notExclusive)
        "
        class="mb-0"
      >
        {{ $t('Share') }}
      </h3>
      <span
        v-if="authenticated"
        id="popover-share-help"
        role="button"
        class="saooti-help ml-2"
        :aria-label="$t('Help')"
      />
      <Popover
        v-if="authenticated"
        target="popover-share-help"
        triggers="hover"
        placement="right"
      >
        {{ $t('Share this page without edit and share blocks') }}
      </Popover>
    </div>
    <div
      class="d-flex"
      :class="[
        bigRound && !audioUrl ? 'justify-content-center' : '',
        verticalDisplay ? 'flex-column' : '',
      ]"
    >
      <a
        v-if="audioUrl"
        class="btn btn-bigRound"
        :title="$t('Downloading')"
        :href="audioUrl"
        rel="noopener"
        target="_blank"
        download
        :aria-label="$t('Downloading')"
      >
        <div class="saooti-download-bounty" />
      </a>
      <a
        rel="noopener"
        target="_blank"
        :href="facebookURL"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-facebook share-btn mb-2',
          verticalDisplay ? '' : 'me-2 ms-2',
        ]"
        title="Facebook"
        aria-label="Facebook"
      >
        <span
          v-if="!bigRound"
          class="saooti-facebook-bounty"
        />
        <div
          v-else
          class="saooti-facebook-bounty"
        />
      </a>
      <a
        rel="noopener"
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-twitter share-btn mb-2',
          verticalDisplay ? '' : 'me-2 ms-2',
        ]"
        :href="twitterURL"
        title="Twitter"
        aria-label="Twitter"
      >
        <span
          v-if="!bigRound"
          class="saooti-twitter-bounty"
        />
        <div
          v-else
          class="saooti-twitter-bounty"
        />
      </a>
      <a
        rel="noopener"
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-linkedin share-btn mb-2',
          verticalDisplay ? '' : 'me-2 ms-2',
        ]"
        :href="linkedinURL"
        title="Linkedin"
        aria-label="Linkedin"
      >
        <span
          v-if="!bigRound"
          class="saooti-linkedin1"
        />
        <div
          v-else
          class="saooti-linkedin1"
        />
      </a>
      <a
        v-if="''!==rssUrl"
        rel="noopener"
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-rss share-btn mb-2',
          verticalDisplay ? '' : 'me-2 ms-2',
        ]"
        :href="rssUrl"
        :title="$t('Subscribe to this emission')"
        aria-label="RSS"
        @click.prevent="openPopup()"
      >
        <span
          v-if="!bigRound"
          class="saooti-rss-bounty"
        />
        <div
          v-else
          class="saooti-rss-bounty"
        />
      </a>
      <a
        rel="noopener"
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-rss share-btn mb-2',
          verticalDisplay ? '' : 'me-2 ms-2',
        ]"
        aria-label="copy"
        :title="$t('Copy this page URL')"
        @click="onCopyCode(urlPage,afterCopy)"
      >
        <span
          v-if="!bigRound"
          class="saooti-link"
        />
        <div
          v-else
          class="saooti-link"
        />
      </a>
      <a
        v-if="podcast"
        rel="noopener"
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-rss share-btn mb-2',
          verticalDisplay ? '' : 'me-2 ms-2',
        ]"
        :aria-label="$t('Share newsletter')"
        :title="$t('Share newsletter')"
        @click="newsletter = true"
      >
        <span
          v-if="!bigRound"
          class="saooti-newsletter"
        />
        <div
          v-else
          class="saooti-newsletter"
        />
      </a>
      <a
        v-if="podcast ||emission"
        rel="noopener"
        target="_blank"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-rss share-btn mb-2',
          verticalDisplay ? '' : 'me-2 ms-2',
        ]"
        :aria-label="$t('Share QR Code')"
        :title="$t('Share QR Code')"
        @click="qrCode = true"
      >
        <span
          v-if="!bigRound"
          class="saooti-qrcode"
        />
        <div
          v-else
          class="saooti-qrcode"
        />
      </a>
      <a
        v-if="isMobile"
        rel="noopener"
        target="_blank"
        :href="whatsappURL"
        :class="[
          bigRound ? 'btn btn-bigRound' : 'btn btn-whatsapp share-btn mb-2',
          verticalDisplay ? '' : 'me-2 ms-2',
        ]"
        aria-label="Whatsapp"
        title="Whatsapp"
      >
        <span
          v-if="!bigRound"
          class="saooti-Whatsapp"
        >
          <div class="path1" />
          <div class="path2" />
          <div class="path3" />
        </span>
        <div
          v-else
          class="saooti-Whatsapp"
        >
          <div class="path1" />
          <div class="path2" />
          <div class="path3" />
        </div>
      </a>
    </div>
    <ClipboardModal
      v-if="dataRSSSave"
      :link="rssUrl"
      :emission="emission"
      @close="dataRSSSave = false"
      @copy="afterCopy"
    />
    <NewsletterModal
      v-if="newsletter"
      :closable="true"
      :podcast="podcast"
      @close="newsletter = false"
    />
    <QrCodeModal
      v-if="qrCode"
      :closable="true"
      :podcast="podcast"
      :emission="emission"
      @close="qrCode = false"
    />
    <Snackbar
      ref="snackbar"
      position="bottom-left"
    />
  </div>
</template>

<script lang="ts">
import { Emission } from '@/store/class/emission';
import { Podcast } from '@/store/class/podcast';
import { state } from '../../../store/paramStore';
import Snackbar from '../../misc/Snackbar.vue';
import { displayMethods } from '../../mixins/functions';
import Popover from '../../misc/Popover.vue';
import { defineComponent, defineAsyncComponent } from 'vue';
import SnackbarVue from '../../misc/Snackbar.vue';
const ClipboardModal = defineAsyncComponent(() => import('../../misc/modal/ClipboardModal.vue'));
const NewsletterModal = defineAsyncComponent(() => import('../../misc/modal/NewsletterModal.vue'));
const QrCodeModal = defineAsyncComponent(() => import('../../misc/modal/QrCodeModal.vue'));
export default defineComponent({
  components: {
    ClipboardModal,
    NewsletterModal,
    QrCodeModal,
    Snackbar,
    Popover
  },

  mixins: [displayMethods],

  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    emission: { default: undefined, type: Object as ()=> Emission},
    participantId: { default: undefined, type: Number},
    organisationId: { default: undefined, type: String},
    bigRound: { default: false, type: Boolean},
    audioUrl: { default: undefined, type: String},
    notExclusive: { default: true, type: Boolean},
  },

  data() {
    return {
      facebookURL: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}` as string,
      twitterURL: `https://twitter.com/intent/tweet?text=${window.location.href}` as string,
      linkedinURL: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}` as string,
      whatsappURL: `whatsapp://send?text=${window.location.href}` as string,
      dataRSSSave: false as boolean,
      newsletter: false as boolean,
      isMobile: false as boolean,
      qrCode: false as boolean,
    };
  },

  computed: {
    urlPage(): string{
      return window.location.href;
    },
    verticalDisplay(): boolean {
      return (
        !this.authenticated &&
        !this.participantId &&
        !this.organisationId &&
        !this.notExclusive
      );
    },
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
    rssUrl(): string {
      if (this.emission)
        return (
          state.generalParameters.ApiUri +
          'rss/emission/' +
          this.emission.emissionId + '.rss'
        );
      if (this.organisationId)
        return (
          state.generalParameters.ApiUri +
          'rss/productor/' +
          this.organisationId + '.rss'
        );
      if (this.participantId)
        return (
          state.generalParameters.ApiUri +
          'rss/participant/' +
          this.participantId + '.rss'
        );
      return '';
    },
  },

  created(){
    this.isMobile = this.checkIfDeviceMobile();
  },
  methods: {
    openPopup(): void {
      this.dataRSSSave = !this.dataRSSSave;
    },
    afterCopy(): void{
      (this.$refs.snackbar as InstanceType<typeof SnackbarVue>).open(this.$t('Link in clipboard'));
    },
    checkIfDeviceMobile(): boolean{
      let check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent);
      return check;
    }
  },
})
</script>

<style lang="scss">
.share-button-page {
  .saooti-Whatsapp{
    width: 25px;
    height: 25px;
  }
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
</style>