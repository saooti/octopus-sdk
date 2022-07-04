<template>
  <li
    class="mt-3 emission-item-container shadow-element"
  >
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
        query: { productor: filterOrga },
      }"
      :title="$t('Emission')"
      class="d-flex text-dark"
    >
      <img
        v-lazy="emission.imageUrl"
        class="img-box"
        :title="$t('Emission name image', {name:emission.name})"
      >
      <div class="emission-item-text">
        <div
          class="emission-name"
        >
          <img
            v-if="!activeEmission && !isPodcastmaker && editRight"
            class="icon-caution"
            src="/img/caution.png"
            :title="$t('Emission have not podcasts')"
          >{{ emission.name }}
        </div>
        <div
          ref="descriptionEmissionContainer"
          class="emission-description htms-wysiwyg-content"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            ref="descriptionEmission"
            v-html="urlify(emission.description|| '')"
          />
        <!-- eslint-enable -->
        </div>
        <div class="flex-grow-1" />
        <router-link
          v-if="!isPodcastmaker"
          :to="{
            name: 'productor',
            params: { productorId: emission.orga.id },
            query: { productor: filterOrga },
          }"
        >
          <div class="emission-producer">
            © {{ emission.orga.name }}
          </div>
        </router-link>
      </div>
    </router-link>
  </li>
</template>

<script lang="ts">
import { orgaComputed } from '../../mixins/orgaComputed';
import { Emission } from '@/store/class/general/emission';
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
import { displayMethods } from '../../mixins/functions';
import { defineComponent } from 'vue'
import { Podcast } from '@/store/class/general/podcast';
export default defineComponent({
  name: 'EmissionItem',

  mixins: [displayMethods, orgaComputed],

  props: {
    emission: { default: ()=>({}), type: Object as ()=> Emission},
  },

  data() {
    return {
      activeEmission: true as boolean,
    };
  },
  
  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    organisation(): string {
      if(this.emission && this.emission.publisher && this.emission.publisher.organisation){
        return this.emission.publisher.organisation.name;
      }
      return '';
    },
    editRight(): boolean {
      if (
        (this.authenticated && this.myOrganisationId === this.emission.orga.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
  },

  created() {
    if(!this.editRight)return;
    this.hasPodcast();
  },
  mounted() {
    const emissionDesc = (this.$refs.descriptionEmission as HTMLElement);
    const emissionDescContainer = (this.$refs.descriptionEmissionContainer as HTMLElement);
    if (
      null !== emissionDesc && null !== emissionDescContainer && 
      emissionDesc.clientHeight > emissionDescContainer.clientHeight
    ) {
      emissionDescContainer.classList.add('after-emission-description');
    }
  },
  methods: {
    async hasPodcast(): Promise<void> {
      const data = await octopusApi.fetchDataWithParams<{count: number;result:Array<Podcast>;sort: string;}>(0, 'podcast/search',{
        emissionId: this.emission.emissionId,
        first: 0,
        size: 0,
      }, true);
      if (0 === data.count) {
        this.activeEmission = false;
      }
    },
  },
})
</script>