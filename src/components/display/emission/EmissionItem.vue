<template>
  <li
    class="mt-3 emission-item-container shadow-element"
  >
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
        query: { productor: $store.state.filter.organisationId },
      }"
      :title="$t('Emission')"
      class="d-flex text-dark"
    >
      <div
        class="img-box"
        :style="{ 'background-image': 'url(\'' + emission.imageUrl + '\')' }"
      />
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
          :id="'description-emission-container-' + emission.emissionId"
          class="emission-description htms-wysiwyg-content"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            :id="'description-emission-' + emission.emissionId"
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
            query: { productor: $store.state.filter.organisationId },
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
import { Emission } from '@/store/class/general/emission';
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
import { displayMethods } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'EmissionItem',

  mixins: [displayMethods],

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
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
    editRight(): boolean {
      if (
        (this.authenticated && this.organisationId === this.emission.orga.id) ||
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
    const emissionDesc = document.getElementById(
      'description-emission-' + this.emission.emissionId
    );
    const emissionDescContainer = document.getElementById(
      'description-emission-container-' + this.emission.emissionId
    );
    if (
      null !== emissionDesc && null !== emissionDescContainer && 
      emissionDesc.clientHeight > emissionDescContainer.clientHeight
    ) {
      emissionDescContainer.classList.add('after-emission-description');
    }
  },
  methods: {
    async hasPodcast(): Promise<void> {
      const data = await octopusApi.fetchPodcasts({
        emissionId: this.emission.emissionId,
        first: 0,
        size: 0,
      });
      if (0 === data.count) {
        this.activeEmission = false;
      }
    },
  },
})
</script>
<style lang="scss"></style>