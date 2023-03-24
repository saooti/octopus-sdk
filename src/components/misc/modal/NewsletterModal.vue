<template>
  <ClassicModal
    id-modal="newsletter-modal"
    :title-modal="$t('Share newsletter')"
    :closable="false"
    @close="closePopup"
  >
    <template #body>
      <div class="d-flex justify-content-between">
        <!-- eslint-disable vue/no-v-html -->
        <div v-html="newsletterHtml" />
        <!-- eslint-enable -->
        <div class="d-flex flex-column flex-grow-1 ms-4">
          <h4 class="mb-3">
            {{ $t('Configuration') }}
          </h4>
          <label for="share-url-newsletter">{{ $t('Share') }}</label>
          <input
            id="share-url-newsletter"
            v-model="shareUrl"
            class="form-input mb-2"
            type="text"
            :class="{ 'border border-danger': 0 === shareUrl }"
          >
          <template v-if="podcast">
            <ClassicCheckbox
              v-model:textInit="displayEmissionName"
              id-checkbox="display-emission-name"
              :label="$t('Display emission name')"
            />
            <ClassicCheckbox
              v-model:textInit="displayParticipantsNames"
              id-checkbox="display-participants-names"
              :label="$t('Display participants list')"
            />
          </template>
          <div class="d-flex align-items-center mt-2">
            <VSwatches
              v-model="color"
              class="c-hand  me-2 mt-2"
              show-fallback
              colors="text-advanced"
              popover-to="right"
              :data-color="color"
            />
            <div>{{ $t('Choose main color') }}</div>
          </div>
          <div
            class=" d-flex justify-content-between align-items-center mt-3 mb-2"
          >
            <h4 class="mb-0">
              {{ $t('HTML Code') }}
            </h4>
            <input
              type="button"
              :value="$t('Copy')"
              class="btn btn-primary"
              :title="$t('Copy')"
              @click="onCopyCode(newsletterHtml, afterCopy)"
            >
          </div>
          <textarea
            id="newsletter_code_textarea"
            v-model="newsletterHtml"
            readonly
            @click="selectAll"
          />
          <label
            for="newsletter_code_textarea"
            :title="$t('HTML Code')"
          />
        </div>
      </div>
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
import ClassicModal from '../modal/ClassicModal.vue';
import ClassicCheckbox from '../../form/ClassicCheckbox.vue';
import Snackbar from '../../misc/Snackbar.vue';
import dayjs from 'dayjs';
// @ts-ignore
import VSwatches from 'vue3-swatches';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import displayMethods from '../../mixins/displayMethods';
import { Participant } from '@/stores/class/general/participant';
import { Podcast } from '@/stores/class/general/podcast';
import { state } from '../../../stores/ParamSdkStore';
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import { mapState } from 'pinia';
import octopusApi from '@saooti/octopus-api';
import { Emission } from '@/stores/class/general/emission';
import { Playlist } from '@/stores/class/general/playlist';
export default defineComponent({
  name: 'NewsletterModal',

  components: {
    Snackbar,
    VSwatches,
    ClassicCheckbox,
    ClassicModal
  },

  mixins: [displayMethods],

  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    emission: { default: undefined, type: Object as ()=> Emission},
    playlist: { default: undefined, type: Object as ()=>Playlist},
  },

  emits: ['close'],

  data() {
    return {
      displayParticipantsNames: true as boolean,
      displayEmissionName: true as boolean,
      color: '#40a372' as string,
      shareUrl: window.location.href,

    };
  },

  computed: {
    ...mapState(useAuthStore, ['authOrganisation']),
    date(): string {
      if(!this.podcast || 1970 === dayjs(this.podcast.pubDate).year()){return '';}
      return dayjs(this.podcast.pubDate).format('D MMMM YYYY, HH[h]mm');
    },
    duration(): string {
      if (!this.podcast || this.podcast.duration <= 1) return '';
      if (this.podcast.duration > 600000) {
        return humanizeDuration(this.podcast.duration, {
          language: this.$i18n.locale,
          largest: 1,
          round: true,
        });
      }
      return humanizeDuration(this.podcast.duration, {
        language: this.$i18n.locale,
        largest: 2,
        round: true,
      });
    },
    emissionName(): string {
      if (!this.displayEmissionName || !this.podcast){return ''}
      return (
        `<tr><td colspan="2" style="font-size: 16px;line-height:24px;font-weight: bold;">${this.podcast.emission.name}</td></tr>`
      );
    },
    articleHtml(): string{
      if (!this.podcast?.article ||0 === this.podcast.article?.length){return ''}
      return (`<a href="${this.podcast.article}" title="${this.$t('See associated article')}">
        <img width="44" height="44" style="display: inline-block;vertical-align: middle; margin-right:3px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA6UlEQVRIie3WPUpEMRTF8R9+4QpEBGttrcdeV+E2pp3KdYi7GBRttNVCZgOCjSuQ+UCLJzLIe7l3HpFpPJAuOf+T5F4SYh3jFZ/JMVlevJUwv8c+HvEQzD/FIBEaHOFtKdkosWb0PfdHGwXzOxxk03SpDVDNvA1Q1bwNcFMwn/cB/K6iQ+3VMsVVDQDcylVMSl1VBOea5FFjTXHWZVJqtCdcYjcI+YHnPoB3FY6qdERVVNrBHi6wGXgscK3Z8UqAE80dbAeAGV4wXhUwxk5gHurP72CtgP9Gw5oabYBhT7/wwZ/If09S35Yv52lVAXwyqt0AAAAASUVORK5CYII=">
      </a>
      <a style="color: #000;text-decoration: none;" href="${this.podcast.article}">${this.$t('See associated article')}</a>`);
    },
    participantsName(): string {
      if (!this.displayParticipantsNames || !this.podcast || !this.podcast.animators) return '';
      const text = [''];
      this.podcast.animators.forEach((element: Participant) => {
        text.push(
          `<table width='100%' style="width:100%;background: #f3f3f3;font-family: Arial, sans-serif;font-size: 12px;line-height: 20px;border-bottom-left-radius: 1.5em;border-bottom-right-radius: 1.5em;">
					<tr>
						<td width="90" rowspan="2" style="text-align:left; vertical-align: top; width: 90px;padding:0 15px 15px 10px">
							<img width="72"  style="width: 62px;height: 62px;border-radius: 50%;background-color: #fff;" src="${element.imageUrl}" alt="${this.$t('Animator image')}">
						</td>
						<td height="1" style="height: 1px;text-align:left; font-size: 14px;line-height:20px;vertical-align: top;font-weight: bold;padding-top: 23px;">${this.getName(element)}</td>
					</tr>`
        );
        if (element.description) {
          text.push(
            `<tr><td style="height: 100%;text-align:justify;padding-bottom: 15px;padding-right: 15px; font-size: 12px;line-height:16px;vertical-align: top">
							${element.description}</td></tr>`
          );
        }
        text.push(`</table>`);
      });
      return text.join('');
    },
    imageUrl():string{
      if(this.podcast){
        return `${this.podcast.imageUrl}" alt="${this.$t('Podcast image')}`;
      }
      if(this.emission){
        return `${this.emission.imageUrl}" alt="${this.$t('Emission image')}`;
      }
      if(this.playlist){
        return `${this.playlist.imageUrl}" alt="${this.$t('Playlist image')}`;
      }
      return '';
    },
    title():string{
      if(this.podcast){
        return this.podcast.title;
      }
      if(this.emission){
        return this.emission.name;
      }
      if(this.playlist){
        return this.playlist.title;
      }
      return '';
    },
    description():string{
      if (this.podcast && this.podcast.description) {
        return `<tr><td colspan="2" valign="top" style="line-height:24px;font-size: 14px;max-width: 500px;">${this.podcast.description}</td></tr>`;
      }
      if(this.emission && this.emission.description){
        return `<tr><td colspan="2" valign="top" style="line-height:24px;font-size: 14px;max-width: 500px;">${this.emission.description}</td></tr>`;
      }
      if(this.playlist && this.playlist.description){
        return `<tr><td colspan="2" valign="top" style="line-height:24px;font-size: 14px;max-width: 500px;">${this.playlist.description}</td></tr>`;
      }
      return '';
    },
    shareText():string{
      if (this.podcast) {
        return this.$t('Listen this episode');
      }
      if (this.emission) {
        return this.$t('All podcast emission button');
      }
      return this.$t('Podcasts in the playlist');
    },
    durationPodcast():string{
      if(!this.podcast){return ''}
      return `<td colspan="2" style="height: 1px;color: #666;font-size: 12px;line-height: 16px;padding-top:15px;">
          <span>${this.date}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span style="padding: 0 10px">${this.$t('Duration', { duration: this.duration })}</span>
				</td>`;
    },
    newsletterHtml(): string {
      const html = [
        `<table width='100%' style="width:100%;background:#f3f3f3;font-family: Arial, sans-serif;font-size: 12px;line-height: 20px;border-top-left-radius: 1.5em;border-top-right-radius: 1.5em;">
        <tr>
				<td valign="top" rowspan="4" style="vertical-align: top; padding: 10px;">
						<img width="140" height="140" src="${this.imageUrl}" style="width: 140px;border-radius: 16px; box-shadow: 0px 12px 48px 6px rgba(64, 163, 114, 0.2);">
				</td>
				${this.durationPodcast}
		</tr>
		<tr>
				<td colspan="2" valign="top" style="line-height:24px;color: ${this.color};font-size: 17px;text-transform: uppercase;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 400px;padding-top: 0.5em;">
          ${this.title}
				</td>
		</tr>
    ${this.emissionName},${this.description}`
      ];
      html.push(
      `</table>
      <div style="font-family: Arial, sans-serif;font-size: 12px;line-height: 20px;background: #f3f3f3;vertical-align: middle;padding: 15px 10px;display: flex; align-items:center; flex-wrap:wrap">
        <a href="${this.shareUrl}">
          <img width="44" height="44" style="display: inline-block;vertical-align: middle" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAAxElEQVRIie3WMWpCURBG4Q8FSRrtbC2SPhvICmzchVuwtXQLbsE2pVUIkjqQHVgqNmIj6EvxGHhFQAIvcxt/OPVhhrlzh3sKZ4MvTLLFVYNPvJYQB294LiGucMYSw2xxcMQcj9niYIsputni4BvjEuJgjZcS4goXrDDKFgcnLDDIFgd7zNDLFgfvTUHnL23ISJuV7iS3Ooarn1VxkeeUvkDSV2b6J3FQT+pDW8Jb4vRD4Kqe1Kf/Ev4mTj32PhQ6b+9pPT+XHgysHrPM6QAAAABJRU5ErkJggg=="/>
        </a>
        <a style="color: #000;text-decoration: none; margin-right:8px" href="${this.shareUrl}">${this.shareText}</a>
        ${this.articleHtml}
      </div>${this.participantsName}`
      );
      return html.join('');
    },
  },
  created(){
    this.initData();
  },
  methods: {
    closePopup(): void {
      this.$emit('close');
    },
    getName(person: Participant): string {
      return (`${person.firstName??''} ${person.lastName??''}`).trim();
    },
    selectAll(element: Event): void {
      const target = element.target;
      if(null!==target){
        (target as HTMLInputElement).focus();
        (target as HTMLInputElement).select();
      }
    },
    afterCopy(): void{
      (this.$refs.snackbar as InstanceType<typeof Snackbar>).open(this.$t('Data in clipboard'));
    },
    async initData(): Promise<void> {
      let attributes;
      if(""!==this.authOrganisation.id && this.authOrganisation.attributes && Object.keys(this.authOrganisation.attributes).length > 1){
        attributes = this.authOrganisation.attributes;
      }else{
        attributes = await octopusApi.fetchData<{[key:string]:string}>(0, 'organisation/attributes/'+state.generalParameters.organisationId);
      }
      if (Object.prototype.hasOwnProperty.call(attributes,'podcastmakerUrl')) {
        this.shareUrl = attributes.podcastmakerUrl + window.location.pathname+window.location.search;
      }
      if(state.generalParameters.podcastmaker && state.generalParameters.podcastmakerColor){
        this.color = state.generalParameters.podcastmakerColor;
        return;
      }
      if (Object.prototype.hasOwnProperty.call(attributes,'COLOR')) {
        this.color = (attributes.COLOR as string);
      }
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
  #newsletter-modal{
    textarea {
      border: 2px solid #eee;
      height: 200px;
      padding: 1em;
      border-radius: 1em;
    }
    .octopus-modal-dialog{
      max-width: 80%;
      max-height: calc(100% - 3.5rem) !important;
    }
    .octopus-modal-content{
      max-height: calc(100vh - 100px) !important;
    }
  }
}
</style>
