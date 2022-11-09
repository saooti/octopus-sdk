<template>
  <div
    id="footer"
    ref="footer"
    class="d-flex align-items-center justify-content-between border-top mt-auto"
  >
    <div class="d-flex align-items-center px-1" v-if="!isPodcastmaker">
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
import { state } from '../../store/paramStore';
import {loadLocaleMessages} from '@/i18n';
import octopusApi from '@saooti/octopus-api';
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
    position: sticky;
    bottom: 0;
    z-index: 10;
    background: white;
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