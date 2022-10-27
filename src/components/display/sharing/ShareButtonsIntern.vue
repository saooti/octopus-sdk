<template>
  <button
    v-if="isDownloadButton"
    class="text-dark"
    :class="getClass()"
    :title="$t('Downloading')"
    @click="onDownload(podcast.audioUrl, podcast.title)"
  >
    <div class="saooti-download" />
  </button>
  <template
    v-for="button in arrayShareButtons"
    :key="button.title"
  >
    <a
      v-if="button.condition"
      rel="noopener"
      target="_blank"
      :href="button.url"
      :class="getClass(button.className)"
      :title="button.title"
    >
      <div :class="button.icon"/>
    </a>
  </template>
  <a
    v-if="''!==rssUrl && displayRss"
    rel="noopener"
    target="_blank"
    :class="getClass()"
    :href="rssUrl"
    :title="titleRssButton"
    @click.prevent="openPopup()"
  >
    <div class="saooti-rss" />
  </a>
  <button
    :class="getClass()"
    :title="$t('Copy this page URL')"
    @click="onCopyCode(urlPage,afterCopy)"
  >
    <div class="saooti-link" />
  </button>
  <button
    v-if="podcast || emission ||playlist"
    :class="getClass()"
    :title="$t('Share newsletter')"
    @click="newsletter = true"
  >
    <div class="saooti-newsletter" />
  </button>
  <button
    :class="getClass()"
    :title="$t('Share QR Code')"
    @click="qrCode = true"
  >
    <div class="saooti-qrcode" />
  </button>
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
    :emission="emission"
    :playlist="playlist"
    @close="newsletter = false"
  />
  <QrCodeModal
    v-if="qrCode"
    :closable="true"
    :url-page="urlPage"
    @close="qrCode = false"
  />
  <Snackbar
    ref="snackbar"
    position="bottom-left"
  />
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import { Emission } from '@/store/class/general/emission';
import { Podcast } from '@/store/class/general/podcast';
import { state } from '../../../store/paramStore';
import Snackbar from '../../misc/Snackbar.vue';
import displayMethods from '../../mixins/displayMethods';
import { defineComponent, defineAsyncComponent } from 'vue';
import { Playlist } from '@/store/class/general/playlist';
const ClipboardModal = defineAsyncComponent(() => import('../../misc/modal/ClipboardModal.vue'));
const NewsletterModal = defineAsyncComponent(() => import('../../misc/modal/NewsletterModal.vue'));
const QrCodeModal = defineAsyncComponent(() => import('../../misc/modal/QrCodeModal.vue'));
export default defineComponent({
  components: {
    ClipboardModal,
    NewsletterModal,
    QrCodeModal,
    Snackbar,
  },

  mixins: [displayMethods],

  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    emission: { default: undefined, type: Object as ()=> Emission},
    playlist: { default: undefined, type: Object as ()=>Playlist},
    participantId: { default: undefined, type: Number},
    organisationId: { default: undefined, type: String},
    notExclusive: { default: true, type: Boolean},
  },

  data() {
    return {
      dataRSSSave: false as boolean,
      newsletter: false as boolean,
      qrCode: false as boolean,
      displayRss: false as boolean,
    };
  },
  computed: {
    titleRssButton(): string{
      if(this.participantId){
        return this.$t('Subscribe to this participant');
      }
      if(this.emission){
        return this.$t('Subscribe to this emission');
      }
      return this.$t('Subscribe to this RSS feed');
    },
    arrayShareButtons(){
      return [
        { title: 'Facebook', icon:'saooti-facebook', className:'btn-facebook', url :`https://www.facebook.com/sharer/sharer.php?u=${this.urlPage}`, condition: true},
        { title: 'Twitter', icon:'saooti-twitter', className:'btn-twitter', url :`https://twitter.com/intent/tweet?text=${this.urlPage}`, condition: true},
        { title: 'Linkedin', icon:'saooti-linkedin', className:'btn-linkedin', url :`https://www.linkedin.com/sharing/share-offsite/?url=${this.urlPage}`, condition: true},
        { title: 'Whatsapp', icon:'saooti-Whatsapp', className:'btn-whatsapp', url :`whatsapp://send?text=${this.urlPage}`, condition:  window.matchMedia('(hover: none)').matches}
      ]
    },
    isDownloadButton(): boolean{
      return this.isDownloadButtonParam && undefined!==this.podcast && (!this.podcast.tags || !this.podcast.tags.includes('copyright'));
    },
    isDownloadButtonParam(): boolean {
      return (state.podcastPage.downloadButton as boolean);
    },
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
      let api = state.generalParameters.ApiUri+ 'rss/';
      if (this.emission){
        return api +'emission/' + this.emission.emissionId + '.rss';
      }
      if (this.participantId){
        return api +'participant/' + this.participantId + '.rss';
      }
      if (this.organisationId){
        return api +'productor/' + this.organisationId + '.rss';
      }
      return '';
    },
  },
  async created(){
    if(this.organisationId || this.participantId){
      this.displayRss = await octopusApi.fetchDataPublic<boolean>(0,`rss/participants/allowed/${this.organisationId}`);
    }else{
      this.displayRss = true;
    }
  },

  methods: {
    getClass(className='btn-rss'): string{
      let returnString = `btn ${className} share-btn mb-2 text-dark`;
      returnString+= this.verticalDisplay ? '' : ' mx-2';
      return returnString;
    },
    openPopup(): void {
      this.dataRSSSave = !this.dataRSSSave;
    },
    afterCopy(): void{
      (this.$refs.snackbar as InstanceType<typeof Snackbar>).open(this.$t('Link in clipboard'));
    },
    onDownload(urlToDownload: string, nameOfDownload: string): void{
      const xhr = new XMLHttpRequest();
      xhr.open('GET', urlToDownload, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(this.response);
        const tag = document.createElement('a');
        tag.href = imageUrl;
        tag.target = '_blank';
        tag.download = nameOfDownload.replace(/ /g, '_');
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
      };
      xhr.send();
    },
  },
})
</script>
