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
        class="img-box"
        :style="{ 'background-image': 'url(\'' + emission.imageUrl + '\')' }"
        v-if="!lightItems"
      ></div>
      <div class="d-flex" v-else>
        <div
          class="img-box-light flex-shrink"
          :style="{ 'background-image': 'url(\'' + emission.imageUrl + '\')' }"
        ></div>
        <div class="emission-light-title">{{ name }}</div>
      </div>
    </router-link>
    <div class="emission-item-text" :class="lightItems ? 'p-0' : ''">
      <router-link
        :to="{
          name: 'emission',
          params: { emissionId: emission.emissionId },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark"
      >
        <div class="emission-name" v-if="!lightItems">
          <img
            class="icon-caution"
            src="/img/caution.png"
            v-if="!activeEmission && !isPodcastmaker && editRight"
            :title="$t('Emission have not podcasts')"
          />{{ name }}
        </div>
        <div
          :id="'description-emission-container-' + emission.emissionId"
          class="emission-description html-wysiwyg-content"
          :class="lightItems ? 'emission-small-description' : ''"
        >
          <div
            :id="'description-emission-' + emission.emissionId"
            v-html="urlify(description)"
          ></div>
        </div>
      </router-link>
      <div class="flex-grow"></div>
      <router-link
        :to="{
          name: 'productor',
          params: { productorId: emission.orga.id },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark"
        v-if="!isPodcastmaker"
      >
        <div class="emission-producer primary-color">
          © {{ emission.orga.name }}
        </div>
      </router-link>
    </div>
  </li>
</template>

<style lang="scss"></style>

<script lang="ts">
import { Emission } from '@/store/class/emission';
import { state } from '../../../store/paramStore';
const octopusApi = require('@saooti/octopus-api');
import { displayMethods } from '../../mixins/functions';
export default {
  name: 'EmissionItem',

  mixins: [displayMethods],

  props: {
    emission: { default: undefined as Emission|undefined },
  },

  data() {
    return {
      activeEmission: true as boolean,
    };
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
      null !== emissionDesc &&
      emissionDesc.clientHeight > emissionDescContainer!.clientHeight
    ) {
      emissionDescContainer!.classList.add('after-emission-description');
    }
  },
  
  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    organisation(): string {
      return '' + this.emission.publisher!.organisation!.name;
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
};
</script>
