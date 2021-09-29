<template>
  <div
    v-if="!value || init"
    class="default-multiselect-width"
    :style="{ width: width }"
    :class="{ 'multiselect-hide-arrow': !displayArrow }"
  >
    <label
      for="organisationChooser"
      class="d-inline"
      aria-label="select productor"
    />
    <!-- <Multiselect
      v-model="organisation"
      id="organisationChooser"
      label="name"
      track-by="organisationId"
      :placeholder="$t('Type string to filter by organisation')"
      ref="multiselectRef"
      :options="organisations"
      :multiple="false"
      :searchable="true"
      :loading="isLoading"
      :internal-search="false"
      :clear-on-select="false"
      :close-on-select="true"
      :options-limit="200"
      :max-height="600"
      :show-no-results="true"
      :hide-selected="true"
      :show-labels="false"
      @search-change="onSearchOrganisation"
      @open="onOpen"
      @close="onClose"
      @select="onOrganisationSelected"
      :class="{ 'light-multiselect': stats }"
    >
      <template slot="clear" slot-scope="props">
        <div
          class="multiselect__clear"
          v-if="organisation"
          @mousedown.prevent.stop="clearAll(props.search)"
        ></div>
      </template>
      <template slot="singleLabel" slot-scope="props">
        <div class="multiselect-octopus-proposition">
          <img
            v-if="!light &&!stats"
            class="option__image"
            :src="props.option.imageUrl"
            :alt="props.option.name"
          />
          <span class="option__title" :class="{ descriptionText: light }">
            {{ props.option.name }}
          </span>
        </div>
      </template>
      <template slot="option" slot-scope="props">
        <div
          class="multiselect-octopus-proposition"
          :data-selenium="
            'organisation-chooser-' + seleniumFormat(props.option.name)
          "
        >
          <img
            v-if="!light &&!stats"
            class="option__image"
            :src="props.option.imageUrl"
            :alt="props.option.name"
          />
          <span class="option__title" :class="{ descriptionText: light }">
            {{ props.option.name }}
          </span>
        </div>
      </template>
      <span slot="noResult">
        {{ $t('No elements found. Consider changing the search query.') }}
      </span>
      <template slot="afterList">
        <div v-if="remainingElements" class="multiselect-remaining-elements">
          {{
            $t(
              'Count more elements matched your query, please make a more specific search.',
              { count: remainingElements }
            )
          }}
        </div>
      </template>
      <template slot="noOptions">{{ $t('List is empty') }}</template>
      <div class="position-relative" slot="caret" v-if="!light">
        <span
          class="saooti-arrow_down octopus-arrow-down-2"
          :class="{ 'octopus-arrow-down-top': stats }"
        ></span>
      </div>
    </Multiselect> -->
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
import { selenium } from '../../mixins/functions';
import Multiselect from 'vue-multiselect';
const octopusApi = require('@saooti/octopus-api');
import { state } from '../../../store/paramStore';
import { Organisation } from '@/store/class/organisation';

const ELEMENTS_COUNT = 50;
const DEFAULT_ORGANISATION_ID = "";
const DEFAULT_ORGANISATION_IMAGE = '/img/emptypodcast.png';

const getDefaultOrganistion = (defaultName: string) => {
  if(''===defaultName){
    return undefined;
  }
  return {
    name: defaultName,
    id: DEFAULT_ORGANISATION_ID,
    imageUrl: DEFAULT_ORGANISATION_IMAGE,
  };
};

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    Multiselect,
  },
  mixins:[selenium],
  props: {
    width: { default: '100%' as string },
    defaultanswer: { default: '' as string},
    stats: { default: false as boolean},
    displayArrow: { default: true as boolean},
    value: { default: null as null | Organisation },
    light: { default: false as boolean},
    reset: { default: false as boolean},
    all: { default: false as boolean},
  },
  emits: ['selected'],
  data() {
    return {
      organisations: [] as Array<Organisation>,
      remainingElements: 0 as number,
      isLoading: false as boolean,
      init: false as boolean,
      myImage: state.organisation.imageUrl as string,
      organisation: getDefaultOrganistion(this.defaultanswer) as Organisation | undefined
    };
  },
  
  computed: {
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    myOrganisation(): Organisation|undefined {
      if (!this.authenticated) return undefined;
      return {
        id: this.organisationId,
        imageUrl: this.myImage,
        name:
          this.$t('Edit my organisation') +
          ' (' +
          state.organisation.name +
          ')',
      };
    },
  },
  watch: {
    value(): void {
      if (!this.init || this.value) {
        this.fetchOrganisation();
      }
    },
    reset(): void {
      this.organisation = this.defaultanswer
        ? getDefaultOrganistion(this.defaultanswer)
        : undefined;
    },
  },

  async created() {
    if (
      this.authenticated &&
      undefined === this.$store.state.organisation.imageUrl
    ) {
      const data = await octopusApi.fetchOrganisation(this.organisationId);
      this.myImage = data.imageUrl;
    }
    if (this.value) {
      this.fetchOrganisation();
    }
  },
  methods: {
    onOpen(): void {
      (this.$refs.multiselectRef as any).$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      this.clearAll();
      this.onSearchOrganisation();
    },
    onClose(): void {
      if (this.organisation) return;
      this.organisation = this.defaultanswer
        ? getDefaultOrganistion(this.defaultanswer)
        : undefined;
      this.$emit('selected', this.organisation);
    },
    onOrganisationSelected(organisation: Organisation|undefined): void {
      this.$emit('selected', organisation);
    },
    async onSearchOrganisation(query?: string): Promise<void> {
      this.isLoading = true;
      const response = await octopusApi.fetchOrganisations({
        query: query,
        first: 0,
        size: ELEMENTS_COUNT,
      });
      let orga = response.result;
      if (this.all && !query) {
        while (
          (response.count < 200 && orga.length < response.count) ||
          (response.count > 200 && orga.length < 200)
        ) {
          const other = await octopusApi.fetchOrganisations({
            query: query,
            first: orga.length,
            size: ELEMENTS_COUNT,
          });
          orga = orga.concat(other.result);
        }
      }
      const notNull = orga.filter((o: Organisation|null) => {
        return null !== o;
      });
      if (this.defaultanswer) {
        this.organisations =[getDefaultOrganistion(this.defaultanswer)!].concat(
          notNull
        );
      } else {
        this.organisations = notNull;
      }
      if (this.myOrganisation) {
        if (undefined === query) {
          this.organisations = this.organisations.filter((obj: Organisation) => {
            return obj.id !== this.organisationId;
          });
          this.organisations.splice(1, 0, this.myOrganisation);
        } else {
          const foundIndex = this.organisations.findIndex(
            (obj: Organisation) => obj.id === this.organisationId
          );
          if (foundIndex) {
            this.organisations[foundIndex] = this.myOrganisation;
          }
        }
      }
      this.isLoading = false;
      this.remainingElements = Math.max(0, response.count - orga.length);
    },
    async fetchOrganisation(): Promise<void> {
      if (0 === this.organisations.length) {
        this.onSearchOrganisation();
      }
      const data = await octopusApi.fetchOrganisation(this.value);
      this.organisation = data;
      this.init = true;
    },
    clearAll(): void {
      this.organisation = undefined;
      this.organisations.length = 0;
    },
  },
})
</script>
