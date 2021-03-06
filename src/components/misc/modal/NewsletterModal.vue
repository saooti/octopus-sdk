<template>
  <div>
    <b-modal
      id="newsletter-modal"
      @close="closePopup"
      @hide="closePopup"
      @cancel="closePopup"
      :title="$t('Share newsletter')"
    >
      <template v-slot:default>
        <div class="d-flex justify-content-between">
          <div v-html="newsletterHtml"></div>
          <div class="d-flex flex-column flex-grow ml-4">
            <h4 class="mb-3">{{ $t('Configuration') }}</h4>
            <div class="checkbox-saooti">
              <input
                type="checkbox"
                class="custom-control-input"
                id="display-emission-name"
                v-model="displayEmissionName"
              />
              <label class="custom-control-label" for="display-emission-name">{{
                $t('Display emission name')
              }}</label>
            </div>
            <div class="checkbox-saooti">
              <input
                type="checkbox"
                class="custom-control-input"
                id="display-participants-names"
                v-model="displayParticipantsNames"
              />
              <label
                class="custom-control-label"
                for="display-participants-names"
                >{{ $t('Display participants list') }}</label
              >
            </div>
            <div class="d-flex align-items-center mt-2">
              <swatches
                v-model="color"
                class="c-hand input-no-outline mr-2 mt-2"
                show-fallback
                colors="text-advanced"
                popover-to="right"
                :data-color="color"
              ></swatches>
              <div>{{ $t('Choose main color') }}</div>
            </div>
            <div
              class=" d-flex justify-content-between align-items-center mt-3 mb-2"
            >
              <h4 class="mb-0">{{ $t('HTML Code') }}</h4>
              <input
                type="button"
                :value="$t('Copy')"
                class="btn btn-primary"
                @click="onCopyCode(newsletterHtml, afterCopy)"
                :aria-label="$t('Copy')"
              />
            </div>
            <textarea
              id="newsletter_code_textarea"
              v-model="newsletterHtml"
              @click="selectAll"
              readonly
            ></textarea>
            <label
              for="newsletter_code_textarea"
              :aria-label="$t('HTML Code')"
            ></label>
          </div>
        </div>
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
#newsletter-modal {
  textarea {
    border: 2px solid #eee;
    height: 200px;
    padding: 1em;
    border-radius: 1em;
    &:focus {
      outline-width: 0;
    }
  }

  .modal-dialog {
    max-width: 60%;
  }
}
</style>
<script lang="ts">
import Snackbar from '../../misc/Snackbar.vue';
const moment = require('moment');
//@ts-ignore
import Swatches from 'vue-swatches';
const humanizeDuration = require('humanize-duration');
import { displayMethods } from '../../mixins/functions';
import { Participant } from '@/store/class/participant';
import { Podcast } from '@/store/class/podcast';
export default displayMethods.extend({
  name: 'NewsletterModal',
  props: {
    podcast: { default: undefined as Podcast|undefined},
  },

  components: {
    Snackbar,
    Swatches,
  },

  data() {
    return {
      displayParticipantsNames: true as boolean,
      displayEmissionName: true as boolean,
      color: '#40a372' as string,
      dummyParam: new Date().getTime().toString() as string,
    };
  },

  mounted() {
    this.$bvModal.show('newsletter-modal');
  },
 
  computed: {
    emissionName(): string {
      if (this.displayEmissionName)
        return (
          `<tr><td colspan="2" style="font-size: 16px;line-height:24px;font-weight: bold;">` +
          this.podcast.emission.name +
          `</td></tr>`
        );
      return '';
    },
    articleHtml(): string{
      if(this.podcast.article && 0 !== this.podcast.article!.length){
        return (`<a href="` +
          this.podcast.article +
          `" aria-label="` +
          this.$t('See associated article') +
          `">
          <img width="44" height="44" style="display: inline-block;vertical-align: middle; margin-right:3px" src="` +
          window.location.origin +
          `/img/article.png">
        </a>
        <a style="color: #000;text-decoration: none;" href="` +
          this.podcast.article +
          `">` +
          this.$t('See associated article') +
          `</a>`);
      }
      return '';
    },
    participantsName(): string {
      if (!this.displayParticipantsNames || !this.podcast.animators) return '';
      const text = [''];
      this.podcast.animators.forEach((element: any) => {
        text.push(
          `<table width='100%' style="width:100%;background: #f3f3f3;font-family: Arial, sans-serif;font-size: 12px;line-height: 20px;border-bottom-left-radius: 1.5em;border-bottom-right-radius: 1.5em;">
					<tr>
						<td width="90" rowspan="2" style="text-align:left; vertical-align: top; width: 90px;padding:0 15px 15px 10px">
							<img width="72"  style="width: 62px;height: 62px;border-radius: 50%;background-color: #fff;" src="` +
            element.imageUrl +
            `" alt="` +
            this.$t('Animator image') +
            `">
						</td>
						<td height="1" style="height: 1px;text-align:left; font-size: 14px;line-height:20px;vertical-align: top;font-weight: bold;padding-top: 23px;">` +
            this.getName(element) +
            `</td>
					</tr>`
        );
        if (element.description) {
          text.push(
            `<tr>
							<td style="height: 100%;text-align:justify;padding-bottom: 15px;padding-right: 15px; font-size: 12px;line-height:16px;vertical-align: top">
								` +
              element.description +
              `
							</td>
						</tr>`
          );
        }
        text.push(`</table>`);
      });
      return text.join('');
    },
    newsletterHtml(): string {
      const html = [
        `<table width='100%' style="width:100%;background:#f3f3f3;font-family: Arial, sans-serif;font-size: 12px;line-height: 20px;border-top-left-radius: 1.5em;border-top-right-radius: 1.5em;">
		<tr>
				<td valign="top" rowspan="4" style="vertical-align: top; padding: 10px;">
						<img width="140" height="140" src="` +
          this.podcast.imageUrl +
          `" alt="` +
          this.$t('Podcast image') +
          `" style="width: 140px;border-radius: 16px; box-shadow: 0px 12px 48px 6px rgba(64, 163, 114, 0.2);">
				</td>
				<td colspan="2" style="height: 1px;color: #666;font-size: 12px;line-height: 16px;padding-top:15px;">
						<span>` +
          this.date +
          `</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="padding: 0 10px">` +
          this.$t('Duration', { duration: this.duration }) +
          `</span>
				</td>
		</tr>
		<tr>
				<td colspan="2" valign="top" style="line-height:24px;color: ` +
          this.color +
          `;font-size: 17px;text-transform: uppercase;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 400px;padding-top: 0.5em;">
						` +
          this.podcast.title +
          `
				</td>
		</tr>
		` +
          this.emissionName,
      ];
      if (this.podcast.description) {
        html.push(
          `<tr>
				<td colspan="2" valign="top" style="line-height:24px;font-size: 14px;max-width: 500px;">
						` +
            this.podcast.description +
            `
				</td>
		</tr>`
        );
      }
      html.push(
        `
    </table>
      <div style="font-family: Arial, sans-serif;font-size: 12px;line-height: 20px;background: #f3f3f3;vertical-align: middle;padding: 15px 10px;display: flex; align-items:center; flex-wrap:wrap">
        <a href="` +
          window.location.href +
          `" aria-label="` +
          this.$t('Listen this episode') +
          `">
          <img width="44" height="44" style="display: inline-block;vertical-align: middle" src="` +
          window.location.origin +
          `/img/play-podcast.png">
        </a>
        <a style="color: #000;text-decoration: none; margin-right:8px" href="` +
          window.location.href +
          `">` +
          this.$t('Listen this episode') +
          `</a>` + this.articleHtml + `
      </div>
		` +
          this.participantsName
      );
      return html.join('');
    },
    
    date(): string {
      if (1970 !== moment(this.podcast!.pubDate).year()){
        if('fr' === this.$i18n.locale){
          return moment(this.podcast!.pubDate).format('D MMMM YYYY [à] HH[h]mm');
        }
        return moment(this.podcast!.pubDate).format('D MMMM YYYY [at] HH[h]mm');
      }
      return '';
    },
    duration(): string {
      if (this.podcast.duration <= 1) return '';
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
  },
  methods: {
    closePopup(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.$emit('close');
    },
    getName(person: Participant): string {
      const first = person.firstName || '';
      const last = person.lastName || '';
      return (first + ' ' + last).trim();
    },
    selectAll(element: Event): void {
      (element.target! as HTMLInputElement).focus();
      (element.target! as HTMLInputElement).select();
    },
    afterCopy(): void{
      (this.$refs.snackbar as any).open(this.$t('Data in clipboard'));
    }
  },
});
</script>
