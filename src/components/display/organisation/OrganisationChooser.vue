<template>
  <div
    class="default-multiselect-width"
    :style="{ width: width }"
    :class="{ 'multiselect-hide-arrow': !displayArrow }"
    v-if="!value || init"
  >
    <label
      for="organisationChooser"
      class="d-inline"
      aria-label="select productor"
    ></label>
    <Multiselect
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
      @select="onEmissionSelected"
      :class="{ 'light-multiselect': stats }"
    >
      <template v-slot:clear="props" >
        <div
          class="multiselect__clear"
          v-if="organisation.length"
          @mousedown.prevent.stop="clearAll(props.search)"
        ></div>
      </template>
      <template v-slot:singleLabel="props" >
        <div class="multiselect-octopus-proposition">
          <img
            v-if="!light"
            class="option__image"
            :src="props.option.imageUrl"
            :alt="props.option.name"
          />
          <span class="option__title" :class="{ descriptionText: light }">
            {{ props.option.name }}
          </span>
        </div>
      </template>
      <template v-slot:option="props" >
        <div
          class="multiselect-octopus-proposition"
          :data-selenium="
            'organisation-chooser-' + seleniumFormat(props.option.name)
          "
        >
          <img
            v-if="!light"
            class="option__image"
            :src="props.option.imageUrl"
            :alt="props.option.name"
          />
          <span class="option__title" :class="{ descriptionText: light }">
            {{ props.option.name }}
          </span>
        </div>
      </template>
      <template v-slot:noResult>
        <span>
          {{ $t('No elements found. Consider changing the search query.') }}
        </span>
      </template>
      <template v-slot:afterList>
        <div v-if="remainingElements" class="multiselect-remaining-elements">
          {{
            $t(
              'Count more elements matched your query, please make a more specific search.',
              { count: remainingElements }
            )
          }}
        </div>
      </template>
      <template v-slot:noOptions>{{ $t('List is empty') }}</template>
      <template v-slot:caret>
      <div class="position-relative" v-if="!light">
        <span
          class="saooti-arrow_down octopus-arrow-down-2"
          :class="{ 'octopus-arrow-down-top': stats }"
        ></span>
      </div>
      </template>
    </Multiselect>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
import { selenium } from '../../mixins/functions';
import Multiselect from 'vue-multiselect';
const octopusApi = require('@saooti/octopus-api');
import { state } from '../../../store/paramStore';

const ELEMENTS_COUNT = 50;
const DEFAULT_ORGANISATION_ID = 0;
const DEFAULT_ORGANISATION_IMAGE = '/img/emptypodcast.png';

const getDefaultOrganistion = (defaultName: any) => {
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

  props: {
    width: { default: '100%' },
    defaultanswer: { default: false },
    stats: { default: false },
    displayArrow: { default: true },
    value: { default: null },
    light: { default: false },
    reset: { default: false },
    all: { default: false },
  },
  emits: ['selected'],

  mixins: [selenium],

  data() {
    let _return:any = {
      organisation: '',
      organisations: [] as any,
      remainingElements: 0,
      isLoading: false,
      init: false,
      myImage: state.organisation.imageUrl,
    };
    if (this.defaultanswer) {
      _return['organisation'] = getDefaultOrganistion(this.defaultanswer);
    }
    return _return;
  },

  computed: {
    organisationId() {
      return state.generalParameters.organisationId;
    },
    authenticated():boolean {
      return state.generalParameters.authenticated;
    },
    myOrganisation():any {
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

  methods: {
    onOpen() {
      this.$refs.multiselectRef.$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      this.clearAll();
      this.onSearchOrganisation();
    },

    onClose() {
      if (this.organisation) return;

      this.organisation = this.defaultanswer
        ? getDefaultOrganistion(this.defaultanswer)
        : '';
      this.$emit('selected', this.organisation);
    },

    onEmissionSelected(organisation: any) {
      this.$emit('selected', organisation);
    },

    async onSearchOrganisation(query: undefined) {
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

      let notNull = orga.filter((o: null) => {
        return null !== o;
      });

      if (this.defaultanswer) {
        this.organisations = [getDefaultOrganistion(this.defaultanswer)].concat(
          notNull
        );
      } else {
        this.organisations = notNull;
      }
      if (this.myOrganisation) {
        if (undefined === query) {
          this.organisations = this.organisations.filter((obj: { id: any; }) => {
            return obj.id !== this.organisationId;
          });
          this.organisations.splice(1, 0, this.myOrganisation);
        } else {
          let foundIndex = this.organisations.findIndex(
            (            obj: { id: any; }) => obj.id === this.organisationId
          );
          if (foundIndex) {
            this.organisations[foundIndex] = this.myOrganisation;
          }
        }
      }
      this.isLoading = false;
      this.remainingElements = Math.max(0, response.count - orga.length);
    },

    async fetchOrganisation() {
      if (0 === this.organisations.length) {
        this.onSearchOrganisation();
      }
      const data = await octopusApi.fetchOrganisation(this.value);
      this.organisation = data;
      this.init = true;
    },

    clearAll() {
      this.organisation = '';
      this.organisations.length = 0;
    },
  },

  watch: {
    value(newVal) {
      if (!this.init || newVal) {
        this.fetchOrganisation();
      }
    },
    reset() {
      this.organisation = this.defaultanswer
        ? getDefaultOrganistion(this.defaultanswer)
        : '';
    },
  },
});
</script>
