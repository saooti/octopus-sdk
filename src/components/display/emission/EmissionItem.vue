<template>
  <li
    class="mt-3"
    :class="
      lightItems
        ? 'noList emission-light-max-size'
        : 'emission-item-container shadow-element'
    "
  >
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
        query: { productor: $store.state.filter.organisationId },
      }"
      :aria-label="$t('Emission')"
      class="text-dark"
    >
      <div
        v-if="!lightItems"
        class="img-box"
        :style="{ 'background-image': 'url(\'' + emission.imageUrl + '\')' }"
      />
      <div
        v-else
        class="d-flex"
      >
        <div
          class="img-box-light flex-shrink"
          :style="{ 'background-image': 'url(\'' + emission.imageUrl + '\')' }"
        />
        <div class="emission-light-title">
          {{ name }}
        </div>
      </div>
    </router-link>
    <div
      class="emission-item-text"
      :class="lightItems ? 'p-0' : ''"
    >
      <router-link
        :to="{
          name: 'emission',
          params: { emissionId: emission.emissionId },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark"
      >
        <div
          v-if="!lightItems"
          class="emission-name"
        >
          <img
            v-if="!activeEmission && !isPodcastmaker && editRight"
            class="icon-caution"
            src="/img/caution.png"
            :title="$t('Emission have not podcasts')"
          >{{ name }}
        </div>
        <div
          :id="'description-emission-container-' + emission.emissionId"
          class="emission-description htms-wysiwyg-content"
          :class="lightItems ? 'emission-small-description' : ''"
        >
          <div
            :id="'description-emission-' + emission.emissionId"
            v-html="urlify(description)"
          />
        </div>
      </router-link>
      <div class="flex-grow" />
      <router-link
        v-if="!isPodcastmaker"
        :to="{
          name: 'productor',
          params: { productorId: emission.orga.id },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark"
      >
        <div class="emission-producer primary-color">
          © {{ emission.orga.name }}
        </div>
      </router-link>
    </div>
  </li>
</template>

<script lang="ts">
import { Emission } from '@/store/class/emission';
import { state } from '../../../store/paramStore';
const octopusApi = require('@saooti/octopus-api');
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
      return state.generalParameters.podcastmaker;
    },
    organisation(): string {
      if(this.emission && this.emission.publisher && this.emission.publisher.organisation){
        return '' + this.emission.publisher.organisation.name;
      }
      return '';
    },
    lightItems(): boolean {
      return state.emissionsPage.lightItems;
    },
    description(): string {
      return this.emission.description || '';
    },
    name(): string {
      return this.emission.name;
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
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