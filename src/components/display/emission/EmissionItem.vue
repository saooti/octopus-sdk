<template>
  <div
    class="mt-3 emission-item-container shadow-element"
  >
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
        query: { productor: filterOrga },
      }"
      :title="$t('Emission')"
      class="d-flex flex-grow-1 text-dark"
    >
      <img
        v-lazy="proxyImageUrl(emission.imageUrl, '260')"
        width="260"
        height="260"
        class="img-box"
        :title="$t('Emission name image', {name:emission.name})"
        :alt="$t('Emission name image', {name:emission.name})"
      >
      <div class="emission-item-text">
        <div class="d-flex align-items-center emission-name">
          <span
            v-if="!activeEmission && !isPodcastmaker && editRight"
            :title="$t('Emission have not podcasts')"
            class="saooti-warning text-danger me-1"
          />
          {{ emission.name }}
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
        <router-link
          v-if="!isPodcastmaker"
          class="emission-producer mt-auto"
          :to="{
            name: 'productor',
            params: { productorId: emission.orga.id },
            query: { productor: filterOrga },
          }"
        >
          © {{ emission.orga.name }}
        </router-link>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { orgaComputed } from '../../mixins/orgaComputed';
import { Emission } from '@/store/class/general/emission';
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
import imageProxy from '../../mixins/imageProxy';
import displayMethods from '../../mixins/displayMethods';
import { defineComponent } from 'vue'
import { Podcast } from '@/store/class/general/podcast';
export default defineComponent({
  name: 'EmissionItem',

  mixins: [displayMethods, orgaComputed, imageProxy],

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
      return this.emission?.publisher?.organisation?.name ?? '';
    },
    editRight(): boolean {
      return (true === this.authenticated && this.myOrganisationId === this.emission.orga.id) ||
        true === state.generalParameters.isAdmin
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