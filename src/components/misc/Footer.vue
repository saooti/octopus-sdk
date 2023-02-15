<template>
  <div
    id="footer"
    ref="footer"
    class="d-flex align-items-center justify-content-between border-top mt-auto"
  >
    <div
      v-if="!isPodcastmaker"
      class="d-flex align-items-center px-1"
    >
      <div class="text-dark me-2">
        &copy; Saooti 2019
      </div>
      <router-link
        v-for="link in routerLinkSecondArray" 
        :key="link.routeName"
        class="link-hover me-2"
        :to="link.routeName"
      >
        {{ link.title }}
      </router-link>
      <ClassicSelect
        v-model:textInit="language"
        :display-label="false"
        id-select="language-chooser-select"
        :label="$t('Change locale')"
        :transparent="true"
        :options="[{title:'Deutsch', value:'de'},
                   {title:'English', value:'en'},
                   {title:'Español', value:'es'},
                   {title:'Français', value:'fr'},
                   {title:'Italiano', value:'it'},
                   {title:'Slovenščina', value:'sl'}]"
      />
    </div>
    <a
      v-if="isPodcastmaker && isContactLink"
      id="footer-contact"
      class="link-hover"
      :href="isContactLink"
      rel="noopener"
      target="_blank"
    >{{ $t('Contact') }}</a>
    <a
      href="https://www.acpm.fr/L-ACPM/Certifications-et-Labels/Les-Podcasts"
      rel="noopener"
      target="_blank"
      :title="$t('Octopus is ACPM Podcast accredited')"
    >
      <img
        width="44"
        height="44"
        class="acpm_image"
        src="/img/ACPM.webp"
        :title="$t('Octopus is ACPM Podcast accredited')"
        :alt="$t('Octopus is ACPM Podcast accredited')"
      >
    </a>
  </div>
</template>

<script lang="ts">
import cookies from '../mixins/cookies';
import ClassicSelect from '../form/ClassicSelect.vue';
import { state } from '../../stores/ParamSdkStore';
import {loadLocaleMessages} from '@/i18n';
import octopusApi from '@saooti/octopus-api';
import { useFilterStore } from '@/stores/FilterStore';
import { useGeneralStore } from '@/stores/GeneralStore';
import { mapState, mapActions } from 'pinia';
import { Category } from '@/store/class/general/category';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Footer',
  components: {
    ClassicSelect
  },

  mixins:[cookies],
  data() {
    return {
      language: this.$i18n.locale,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ['storedCategories', 'platformEducation']),
    ...mapState(useFilterStore, ['filterRubrique', 'filterOrgaId', 'filterIab']),
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
      if(this.filterRubrique?.length){
        return this.filterRubrique.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
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
    ...mapActions(useGeneralStore, ['storedUpdateCategories']),
    ...mapActions(useFilterStore, ['filterUpdateIab']),
    getQueriesRouter(routeName: string){
      if('podcasts' !== routeName && 'emissions' !== routeName && 'home' !== routeName){
        return { productor: this.filterOrgaId};
      }
      return { productor: this.filterOrgaId,
                   iabId: this.filterIab?.id,
                   rubriquesId: this.rubriqueQueryParam}
    },
    changeLanguage(): void{
      this.setCookie('octopus-language', this.language);
      loadLocaleMessages(this.$i18n, this.language, this.platformEducation);
      octopusApi.fetchDataWithParams<Array<Category>>(0, `iab/list${state.octopusApi.organisationId? '/'+state.octopusApi.organisationId : ''}`, { lang: this.$i18n.locale }).then((data: Array<Category>) => {
        this.storedUpdateCategories(data);
        if(this.filterIab){
          const category = this.storedCategories.filter((c: Category) => {
            return c.id === this.filterIab?.id;
          });
          if(category.length){
            this.filterUpdateIab(category[0]);
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
    position: sticky;
    bottom: 0;
    z-index: 10;
    background: white;
    padding: 0 2rem;
    .acpm_image {
      width: 44px;
      height: 44px;
    }
    a{
      color: #666;
    }
  }
}
</style>