<template>
  <div
    v-if="!value || init"
    class="default-multiselect-width"
    :style="{ width: width }"
  >
    <label
      for="organisationChooser"
      class="d-inline"
      title="select productor"
    />
    <VueMultiselect
      id="organisationChooser"
      ref="multiselectRef"
      v-model="organisation"
      label="name"
      track-by="id"
      :aria-expanded="false"
      :placeholder="$t('Type string to filter by organisation')"
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
      :class="{ 'multiselect-transparent': light }"
      @search-change="onSearchOrganisation"
      @open="onOpen"
      @select="onOrganisationSelected"
    >
      <template #clear="{ props }">
        <div
          v-if="organisation"
          class="multiselect__clear"
          @mousedown.prevent.stop="clearAll(props.search)"
        />
      </template>
      <template #singleLabel="{ option }">
        <div class="multiselect-octopus-proposition">
          <img
            v-if="!light"
            v-lazy="proxyImageUrl(option.imageUrl, '32')"
            class="option__image"
            :alt="option.name"
          >
          <span
            class="option__title"
          >
            {{ option.name }}
          </span>
        </div>
      </template>
      <template #option="{ option }">
        <div
          class="multiselect-octopus-proposition"
          :data-selenium="
            'organisation-chooser-' + seleniumFormat(option.name)
          "
        >
          <img
            v-if="!light"
            v-lazy="proxyImageUrl(option.imageUrl, '32')"
            class="option__image"
            :alt="option.name"
          >
          <span
            class="option__title"
          >
            {{ option.name }}
          </span>
        </div>
      </template>
      <template #noResult="">
        <span>{{ $t('No elements found. Consider changing the search query.') }}</span>
      </template>
      <template #afterList="">
        <div
          v-if="remainingElements"
          class="multiselect-remaining-elements"
        >
          {{
            $t(
              'Count more elements matched your query, please make a more specific search.',
              { count: remainingElements }
            )
          }}
        </div>
      </template>
      <template #noOptions="">
        {{ $t('List is empty') }}
      </template>
      <template #caret="">
        <div
          class="position-relative"
        >
          <span
            class="saooti-down octopus-arrow-down"
          />
        </div>
      </template>
    </VueMultiselect>
  </div>
</template>

<script lang="ts">
import imageProxy from '../../mixins/imageProxy';
import selenium from '../../mixins/selenium';
import { orgaComputed } from '../../mixins/orgaComputed';
//@ts-ignore
import VueMultiselect from 'vue-multiselect';
import octopusApi from '@saooti/octopus-api';
import { state } from '../../../store/paramStore';
import { Organisation } from '@/store/class/general/organisation';

const ELEMENTS_COUNT = 50;
const DEFAULT_ORGANISATION_ID = "";
const DEFAULT_ORGANISATION_IMAGE = '/img/emptypodcast.webp';

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

import { defineComponent } from 'vue';
export default defineComponent({
  components: {
    VueMultiselect,
  },
  mixins:[selenium, orgaComputed, imageProxy],
  props: {
    width: { default: '100%', type: String },
    defaultanswer: { default: '', type: String},
    value: { default: undefined, type: String},
    light: { default: false, type:  Boolean},
    reset: { default: false, type:  Boolean},
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
    myOrganisation(): Organisation|undefined {
      if (!this.authenticated) return undefined;
      return {
        id: this.myOrganisationId??"",
        imageUrl: this.myImage,
        name: `${this.$t('Edit my organisation')} (${state.organisation.name})`
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
      undefined === this.$store.state.auth?.organisation.imageUrl
    ) {
      const data = await octopusApi.fetchData<Organisation>(0,`organisation/${this.myOrganisationId ?this.myOrganisationId:""}`);
      this.myImage = data.imageUrl;
    }
    if (this.value) {
      this.fetchOrganisation();
    }
  },
  methods: {
    onOpen(): void {
      (this.$refs.multiselectRef as VueMultiselect).$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      this.onSearchOrganisation();
    },
    onOrganisationSelected(organisation: Organisation|undefined): void {
      this.$emit('selected', organisation);
    },
    async onSearchOrganisation(query?: string): Promise<void> {
      this.isLoading = true;
      const response = await octopusApi.fetchDataWithParams<{count: number;result: Array<Organisation>;sort: string;}>(0, 'organisation/search',{
        query: query,
        first: 0,
        size: ELEMENTS_COUNT,
      });
      const orga = response.result;
      const notNull = orga.filter((o: Organisation|null) => {
        return null !== o;
      });
      if (this.defaultanswer) {
        const defaultOrganisation = getDefaultOrganistion(this.defaultanswer);
        if(defaultOrganisation){
          this.organisations =[defaultOrganisation].concat(notNull);
        }
      } else {
        this.organisations = notNull;
      }
      if (this.myOrganisation) {
        if (undefined === query) {
          this.organisations = this.organisations.filter((obj: Organisation) => {
            return obj.id !== this.myOrganisationId;
          });
          this.organisations.splice(1, 0, this.myOrganisation);
        } else {
          const foundIndex = this.organisations.findIndex(
            (obj: Organisation) => obj.id === this.myOrganisationId
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
      if(!this.value){return;}
      const data = await octopusApi.fetchData<Organisation>(0,`organisation/${this.value}`);
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