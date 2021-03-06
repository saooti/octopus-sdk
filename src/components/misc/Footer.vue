<template>
  <div class="bg-dark">
    <div
      id="footer"
      class="d-flex p-3 secondary-bg border-top footer-display-phone"
    >
      <div class="d-flex flex-grow align-items-end flex-column">
        <div class="d-flex flex-column">
          <router-link
            :to="{
              name: 'home',
              query: { productor: $store.state.filter.organisationId },
            }"
            class="linkHover"
            >{{ $t('Home') }}</router-link
          >
          <router-link
            :to="{
              name: 'podcasts',
              query: { productor: $store.state.filter.organisationId },
            }"
            class="linkHover"
            >{{ $t('Podcasts') }}</router-link
          >
          <router-link
            :to="{
              name: 'emissions',
              query: { productor: $store.state.filter.organisationId },
            }"
            class="linkHover"
            >{{ $t('Emissions') }}</router-link
          >
          <router-link
            :to="{
              name: 'productors',
              query: { productor: $store.state.filter.organisationId },
            }"
            class="linkHover"
            v-if="!isPodcastmaker"
            >{{ $t('Productors') }}</router-link
          >
          <router-link
            :to="{
              name: 'participants',
              query: { productor: $store.state.filter.organisationId },
            }"
            class="linkHover"
            >{{ $t('Speakers') }}</router-link
          >
        </div>
      </div>
      <hr class="divided-line show-phone" />
      <div
        class="d-flex flex-grow align-items-center flex-column"
        v-if="!isPodcastmaker"
      >
        <div class="d-flex flex-column">
          <div class="text-dark">&copy; Saooti 2019</div>
          <router-link class="linkHover" to="/main/pub/contact">{{
            $t('Contact')
          }}</router-link>
          <router-link class="linkHover" to="/main/pub/cgu">{{
            $t('Term of use')
          }}</router-link>
          <router-link class="linkHover" to="/main/pub/libraries">{{
            $t('Used libraries')
          }}</router-link>
          <a class="linkHover c-hand" @click="changeLanguage">{{
            $t('Change locale')
          }}</a>
        </div>
      </div>
      <hr class="divided-line show-phone" />
      <div class="flex-grow">
        <a
          href="https://www.acpm.fr/L-ACPM/Certifications-et-Labels/Les-Podcasts"
          rel="noopener"
          target="_blank"
          :aria-label="$t('Octopus is ACPM Podcast accredited')"
        >
          <img
            class="acpm_image"
            src="/img/ACPM.png"
            :title="$t('Octopus is ACPM Podcast accredited')"
            :alt="$t('Octopus is ACPM Podcast accredited')"
          />
        </a>
      </div>
      <div
        class="d-flex flex-grow align-items-center flex-column"
        v-if="isPodcastmaker && isContactLink"
      >
        <div class="d-flex flex-column">
          <a
            class="linkHover"
            id="footer-contact"
            :href="isContactLink"
            rel="noopener"
            target="_blank"
            >{{ $t('Contact') }}</a
          >
        </div>
      </div>
    </div>
    <Player @hide="showBlackBorder" />
  </div>
</template>
<style lang="scss">
#footer {
  font-size: 0.7rem;
  a {
    color: #666;
  }
  .acpm_image {
    width: 70px;
    height: 70px;
  }
}
.border-round {
  border-radius: 0 0 2rem 2rem;
}
/** PHONES*/
@media (max-width: 960px) {
  .footer-display-phone {
    flex-direction: column;
    .align-items-center,
    .align-items-end {
      align-items: flex-start !important;
    }
  }
  .container {
    font-size: 0.6rem;
    .pages {
      margin-right: 3rem;
    }
  }
}
</style>

<script lang="ts">
import Player from './Player.vue';
import { state } from '../../store/paramStore';
const octopusApi = require('@saooti/octopus-api');
import Vue from 'vue';
const moment = require('moment');
import { Category } from '@/store/class/category';
export default Vue.extend({
  name: 'Footer',
  components: {
    Player,
  },

  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    isBarTop(): boolean {
      return state.player.barTop;
    },
    isContactLink(): string {
      return state.footer.contactLink;
    },
  },

  methods: {
    showBlackBorder(hide: boolean): void {
      if (hide) {
        document.getElementById('footer')!.classList.remove('border-round');
      } else if (!this.isBarTop) {
        document.getElementById('footer')!.className += ' border-round';
      }
    },
    changeLanguage(): void{
      if('fr'===this.$i18n.locale){
        this.$i18n.locale= "en";
      }else{
        this.$i18n.locale= "fr";
      }
      moment.locale(this.$i18n.locale);
      octopusApi.fetchCategories({ lang: this.$i18n.locale }).then((data: Array<Category>) => {
        this.$store.commit('categoriesSet', data);
      });
    }
  },
});
</script>
