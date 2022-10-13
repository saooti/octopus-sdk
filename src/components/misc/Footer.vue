<template>
  <div class="bg-dark">
    <div
      v-if="displayFooter"
      id="footer"
      ref="footer"
      class="d-flex-column p-3 secondary-bg border-top"
    >
      <div class="d-flex flex-column flex-grow-1 align-items-end">
        <div class="d-flex flex-column">
          <template
            v-for="link in routerLinkArray"
            :key="link.routeName"
          >
            <router-link
              v-if="link.condition"
              class="link-hover"
              :to="{
                name: link.routeName,
                query: getQueriesRouter(link.routeName),
              }"
            >
              {{ link.title }}
            </router-link>
          </template>
        </div>
      </div>
      <hr class="show-phone">
      <div
        v-if="!isPodcastmaker"
        class="d-flex flex-grow-1 align-items-center flex-column"
      >
        <div class="d-flex flex-column">
          <div class="text-dark">
            &copy; Saooti 2019
          </div>
          <router-link
            v-for="link in routerLinkSecondArray" 
            :key="link.routeName"
            class="link-hover"
            :to="link.routeName"
          >
            {{ link.title }}
          </router-link>
          <ClassicSelect
            v-model:textInit="language"
            :display-label="false"
            id-select="language-chooser-select"
            :label="$t('Change locale')"
            :options="[{title:'Deutsch', value:'de'},
                       {title:'English', value:'en'},
                       {title:'Español', value:'es'},
                       {title:'Français', value:'fr'},
                       {title:'Italiano', value:'it'},
                       {title:'Slovenščina', value:'sl'}]"
          />
        </div>
      </div>
      <hr class="show-phone">
      <div class="flex-grow-1">
        <a
          href="https://www.acpm.fr/L-ACPM/Certifications-et-Labels/Les-Podcasts"
          rel="noopener"
          target="_blank"
          :title="$t('Octopus is ACPM Podcast accredited')"
        >
          <img
            class="acpm_image"
            src="/img/ACPM.png"
            :title="$t('Octopus is ACPM Podcast accredited')"
            :alt="$t('Octopus is ACPM Podcast accredited')"
          >
        </a>
      </div>
      <div
        v-if="isPodcastmaker && isContactLink"
        class="d-flex flex-column flex-grow-1 align-items-center"
      >
        <div class="d-flex flex-column">
          <a
            id="footer-contact"
            class="link-hover"
            :href="isContactLink"
            rel="noopener"
            target="_blank"
          >{{ $t('Contact') }}</a>
        </div>
      </div>
    </div>
    <Player @hide="showBlackBorder" />
  </div>
</template>

<script lang="ts">
import { cookies } from '../mixins/functions';
import ClassicSelect from '../form/ClassicSelect.vue';
import Player from './player/Player.vue';
import { state } from '../../store/paramStore';
import {loadLocaleMessages} from '@/i18n';
import octopusApi from '@saooti/octopus-api';
import { Category } from '@/store/class/general/category';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Footer',
  components: {
    Player,
    ClassicSelect
  },

  mixins:[cookies],
  props: {
    displayFooter: { default: true, type: Boolean},
  },
  data() {
    return {
      language: this.$i18n.locale,
    };
  },
  computed: {
    routerLinkArray(){
      return [
        {title : this.$t('Home'), routeName: 'home', condition : true},
        {title : this.$t('Podcasts'), routeName: 'podcasts', condition : true},
        {title : this.$t('Emissions'), routeName: 'emissions', condition : true},
        {title : this.$t('Productors'), routeName: 'productors', condition : !this.isPodcastmaker && !this.$store.state.filter.organisationId},
        {title : this.$t('Playlists'), routeName: 'playlists', condition : true},
        {title : this.$t('Speakers'), routeName: 'participants', condition : true},]
    },
    routerLinkSecondArray(){
      return [
        {title : this.$t('Contact'), routeName: '/main/pub/contact'},
        {title : this.$t('Term of use'), routeName: '/main/pub/cgu'},
        {title : this.$t('Used libraries'), routeName: "/main/pub/libraries"}]
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    isContactLink(): string|undefined {
      return state.footer.contactLink;
    },
    rubriqueQueryParam(): string|undefined{
      if(this.$store.state.filter?.rubriqueFilter?.length){
        return this.$store.state.filter.rubriqueFilter.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
      }
      return undefined;
    },
  },
  watch:{
    language(){
      this.changeLanguage();
    }
  },
  methods: {
    getQueriesRouter(routeName: string){
      if('podcasts' !== routeName && 'emissions' !== routeName && 'home' !== routeName){
        return { productor: this.$store.state.filter.organisationId};
      }
      return { productor: this.$store.state.filter.organisationId,
                   iabId: this.$store.state.filter.iab?.id,
                   rubriquesId: this.rubriqueQueryParam}
    },
    showBlackBorder(hide: boolean): void {
      const footerElement = (this.$refs.footer as HTMLElement);
      if(!footerElement){return;}
      if (hide) {
        footerElement.classList.remove('border-round');
      } else {
        footerElement.className += ' border-round';
      }
    },
    changeLanguage(): void{
      this.setCookie('octopus-language', this.language);
      loadLocaleMessages(this.$i18n, this.language, this.$store.state.general.isEducation);
      octopusApi.fetchDataWithParams<Array<Category>>(0, `iab/list${state.octopusApi.organisationId? '/'+state.octopusApi.organisationId : ''}`, { lang: this.$i18n.locale }).then((data: Array<Category>) => {
        this.$store.commit('categoriesSet', data);
        if(this.$store.state.filter.iab){
          const category = this.$store.state.categories.filter((c: Category) => {
            return c.id === this.$store.state.filter.iab.id;
          });
          if(category.length){
            this.$store.commit('filterIab', category[0]);
          }
        }
      });
    }
  },
})
</script>

<style lang="scss">
.octopus-app{
  #footer{
    font-size: 0.7rem;
    .acpm_image {
      width: 70px;
      height: 70px;
    }
    a{
      color: #666;
    }
    .border-round {
      border-radius: 0 0 2rem 2rem;
    }
    /** PHONES*/
    @media (max-width: 960px) {
      .align-items-center,
      .align-items-end {
        align-items: flex-start !important;
      }
    }
  }
}
</style>